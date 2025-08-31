'use client';

import { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from '@/app/context/UserContext';

const SavingsGoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({ name: "", targetAmount: "", description: "", targetDate: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [editingGoal, setEditingGoal] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('progress');
  const { user } = useUser();

  // Fetch goals on load
  useEffect(() => {
    const fetchGoals = async () => {
      if (!user?.token || !user?.id) return;
      
      setIsLoading(true);
      try {
        const response = await axios.get(`http://localhost:8080/api/goals/${user.id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setGoals(response.data);
      } catch (error) {
        console.log("Failed to fetch goals:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGoals();
  }, [user]);

  // Add or update goal
  const handleSaveGoal = async () => {
    if (!newGoal.name || !newGoal.targetAmount) {
      setErrorMessage("Goal name and target amount are required.");
      return;
    }

    try {
      let response;
      if (editingGoal) {
        response = await axios.put(
          `http://localhost:8080/api/goals/${editingGoal.id}`,
          newGoal,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setGoals(goals.map(goal => goal.id === editingGoal.id ? response.data : goal));
        setSuccessMessage("Goal updated successfully!");
      } else {
        response = await axios.post(
          `http://localhost:8080/api/goals/${user.id}`,
          newGoal,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setGoals([...goals, response.data]);
        setSuccessMessage("Goal created successfully!");
      }
      
      resetForm();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error("Failed to save goal:", error);
      setErrorMessage("Failed to save goal. Please try again.");
    }
  };

  // Update saved amount for a goal
  const handleUpdateSavedAmount = async (goalId) => {
    const amount = prompt("Enter the amount to add:");
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert("Please enter a valid positive number.");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:8080/api/goals/${goalId}/add-saved-amount`,
        { amount: Number(amount) },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setGoals(
        goals.map((goal) =>
          goal.id === goalId ? { ...goal, savedAmount: response.data.savedAmount } : goal
        )
      );
      setSuccessMessage("Amount added successfully!");
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error("Failed to update saved amount:", error);
      setErrorMessage("Failed to update saved amount.");
    }
  };

  // Delete a goal
  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm("Are you sure you want to delete this goal?")) return;
    
    try {
      await axios.delete(`http://localhost:8080/api/goals/${goalId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setGoals(goals.filter((goal) => goal.id !== goalId));
      setSuccessMessage("Goal deleted successfully!");
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.log("Failed to delete goal:", error);
      setErrorMessage("Failed to delete goal.");
    }
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setNewGoal({
      name: goal.name,
      targetAmount: goal.targetAmount,
      description: goal.description || "",
      targetDate: goal.targetDate || ""
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setNewGoal({ name: "", targetAmount: "", description: "", targetDate: "" });
    setEditingGoal(null);
    setIsModalOpen(false);
    setErrorMessage("");
  };

  const calculateProgress = (saved, target) => {
    return Math.min((saved / target) * 100, 100);
  };

  const getGoalStatus = (progress, targetDate) => {
    if (progress >= 100) return { color: 'text-green-600', label: 'Completed', bg: 'bg-green-500' };
    if (targetDate && new Date(targetDate) < new Date()) return { color: 'text-red-600', label: 'Overdue', bg: 'bg-red-500' };
    if (progress >= 75) return { color: 'text-blue-600', label: 'Almost There', bg: 'bg-blue-500' };
    if (progress >= 50) return { color: 'text-yellow-600', label: 'Halfway', bg: 'bg-yellow-500' };
    return { color: 'text-gray-600', label: 'Getting Started', bg: 'bg-gray-500' };
  };

  const getGoalIcon = (progress) => {
    if (progress >= 100) return '🎉';
    if (progress >= 75) return '🚀';
    if (progress >= 50) return '💪';
    if (progress >= 25) return '📈';
    return '🎯';
  };

  const filteredGoals = goals.filter(goal => {
    const progress = calculateProgress(goal.savedAmount, goal.targetAmount);
    switch (filterStatus) {
      case 'completed': return progress >= 100;
      case 'active': return progress < 100 && (!goal.targetDate || new Date(goal.targetDate) >= new Date());
      case 'overdue': return progress < 100 && goal.targetDate && new Date(goal.targetDate) < new Date();
      default: return true;
    }
  });

  const sortedGoals = [...filteredGoals].sort((a, b) => {
    const progressA = calculateProgress(a.savedAmount, a.targetAmount);
    const progressB = calculateProgress(b.savedAmount, b.targetAmount);
    
    switch (sortBy) {
      case 'progress': return progressB - progressA;
      case 'amount': return b.targetAmount - a.targetAmount;
      case 'name': return a.name.localeCompare(b.name);
      case 'date': return new Date(a.targetDate || '9999-12-31') - new Date(b.targetDate || '9999-12-31');
      default: return 0;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto"></div>
          <p className="text-xl font-medium text-gray-700 animate-pulse">Loading your savings goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Savings Goals
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Set, track, and achieve your financial dreams with smart goal management
          </p>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg mx-auto"
          >
            <span className="text-2xl">🎯</span>
            Create New Goal
          </button>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-r-lg animate-fadeIn">
            <div className="flex items-center">
              <span className="text-2xl mr-3">✅</span>
              {successMessage}
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg animate-fadeIn">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚠️</span>
              {errorMessage}
            </div>
          </div>
        )}

        {/* Filters and Sort */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="text-xl">🔍</span>
                Filter & Sort
              </h3>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 bg-gray-50 hover:bg-white transition-colors duration-300"
              >
                <option value="all">All Goals</option>
                <option value="active">Active Goals</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 bg-gray-50 hover:bg-white transition-colors duration-300"
              >
                <option value="progress">Sort by Progress</option>
                <option value="amount">Sort by Amount</option>
                <option value="name">Sort by Name</option>
                <option value="date">Sort by Date</option>
              </select>
            </div>
          </div>
        </div>

        {/* Goals Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow duration-300 border border-gray-200">
            <div className="text-3xl mb-2">🎯</div>
            <p className="text-sm text-gray-600 mb-1">Total Goals</p>
            <p className="text-2xl font-bold text-indigo-600">{goals.length}</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow duration-300 border border-gray-200">
            <div className="text-3xl mb-2">🎉</div>
            <p className="text-sm text-gray-600 mb-1">Completed</p>
            <p className="text-2xl font-bold text-green-600">
              {goals.filter(g => calculateProgress(g.savedAmount, g.targetAmount) >= 100).length}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow duration-300 border border-gray-200">
            <div className="text-3xl mb-2">💰</div>
            <p className="text-sm text-gray-600 mb-1">Total Target</p>
            <p className="text-2xl font-bold text-blue-600">
              ${goals.reduce((sum, g) => sum + parseFloat(g.targetAmount), 0).toLocaleString()}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow duration-300 border border-gray-200">
            <div className="text-3xl mb-2">💵</div>
            <p className="text-sm text-gray-600 mb-1">Total Saved</p>
            <p className="text-2xl font-bold text-green-600">
              ${goals.reduce((sum, g) => sum + parseFloat(g.savedAmount || 0), 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Goals Grid */}
        {sortedGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedGoals.map((goal, index) => {
              const progress = calculateProgress(goal.savedAmount || 0, goal.targetAmount);
              const status = getGoalStatus(progress, goal.targetDate);
              const remaining = Math.max(goal.targetAmount - (goal.savedAmount || 0), 0);
              const isCompleted = progress >= 100;

              return (
                <div
                  key={goal.id}
                  className="group bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 relative overflow-hidden"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.5s ease-out forwards'
                  }}
                >
                  {/* Completion Celebration */}
                  {isCompleted && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-green-400 to-emerald-500 text-white px-4 py-2 rounded-bl-xl text-sm font-bold">
                      ACHIEVED!
                    </div>
                  )}

                  {/* Goal Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{getGoalIcon(progress)}</span>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600 transition-colors duration-300">
                          {goal.name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          status.color === 'text-green-600' ? 'bg-green-100 text-green-800' :
                          status.color === 'text-blue-600' ? 'bg-blue-100 text-blue-800' :
                          status.color === 'text-yellow-600' ? 'bg-yellow-100 text-yellow-800' :
                          status.color === 'text-red-600' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Goal Amounts */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Target:</span>
                      <span className="text-xl font-bold text-gray-800">${goal.targetAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Saved:</span>
                      <span className="text-xl font-bold text-green-600">${(goal.savedAmount || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Remaining:</span>
                      <span className={`text-xl font-bold ${remaining > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                        ${remaining.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Progress</span>
                      <span className={`text-sm font-bold ${status.color}`}>
                        {progress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${status.bg} relative`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      >
                        {progress > 0 && (
                          <div className="absolute inset-0 bg-white bg-opacity-20 animate-pulse"></div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Goal Details */}
                  {(goal.description || goal.targetDate) && (
                    <div className="bg-gray-50 p-4 rounded-xl mb-6">
                      {goal.description && (
                        <p className="text-sm text-gray-700 mb-2">
                          <strong>Description:</strong> {goal.description}
                        </p>
                      )}
                      {goal.targetDate && (
                        <p className="text-sm text-gray-700">
                          <strong>Target Date:</strong> {new Date(goal.targetDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleUpdateSavedAmount(goal.id)}
                      className="flex-1 bg-green-500 text-white py-3 px-4 rounded-xl hover:bg-green-600 transition-colors duration-300 font-medium flex items-center justify-center gap-2"
                    >
                      💰 Add Money
                    </button>
                    <button
                      onClick={() => handleEditGoal(goal)}
                      className="bg-blue-500 text-white py-3 px-4 rounded-xl hover:bg-blue-600 transition-colors duration-300 font-medium"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="bg-red-500 text-white py-3 px-4 rounded-xl hover:bg-red-600 transition-colors duration-300 font-medium"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-200">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Savings Goals Yet</h3>
            <p className="text-gray-600 mb-6">
              {filterStatus !== 'all' 
                ? 'No goals match your current filter criteria'
                : 'Start building your financial future by setting your first savings goal'
              }
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 transition-colors duration-300 font-medium"
            >
              Create Your First Goal
            </button>
          </div>
        )}

        {/* Savings Tips */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg p-8 mt-8 text-white">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
            <span className="text-2xl">💡</span>
            Savings Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white bg-opacity-15 p-6 rounded-xl backdrop-blur-sm hover:bg-opacity-20 transition-all duration-300">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <span className="text-xl">🎯</span>
                Set SMART Goals
              </h4>
              <p className="text-sm opacity-90">Make your goals Specific, Measurable, Achievable, Relevant, and Time-bound</p>
            </div>
            <div className="bg-white bg-opacity-15 p-6 rounded-xl backdrop-blur-sm hover:bg-opacity-20 transition-all duration-300">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <span className="text-xl">🔄</span>
                Automate Savings
              </h4>
              <p className="text-sm opacity-90">Set up automatic transfers to make saving effortless and consistent</p>
            </div>
            <div className="bg-white bg-opacity-15 p-6 rounded-xl backdrop-blur-sm hover:bg-opacity-20 transition-all duration-300">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <span className="text-xl">📈</span>
                Track Progress
              </h4>
              <p className="text-sm opacity-90">Review your goals regularly and celebrate milestones along the way</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slideDown">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center gap-3">
                <span className="text-3xl">🎯</span>
                {editingGoal ? 'Edit Goal' : 'Create New Goal'}
              </h2>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Goal Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Emergency Fund, Vacation, New Car"
                    value={newGoal.name}
                    onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 bg-gray-50 hover:bg-white transition-colors duration-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Target Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newGoal.targetAmount}
                    onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 bg-gray-50 hover:bg-white transition-colors duration-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Target Date</label>
                  <input
                    type="date"
                    value={newGoal.targetDate}
                    onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 bg-gray-50 hover:bg-white transition-colors duration-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Description</label>
                  <textarea
                    placeholder="What is this goal for? Why is it important to you?"
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 bg-gray-50 hover:bg-white transition-colors duration-300 resize-none"
                    rows="3"
                  />
                </div>

                {errorMessage && (
                  <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded-lg text-sm">
                    {errorMessage}
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleSaveGoal}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 font-semibold"
                  >
                    {editingGoal ? 'Update Goal' : 'Create Goal'}
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-6 bg-gray-500 text-white py-4 rounded-xl hover:bg-gray-600 transition-colors duration-300 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SavingsGoalsPage;