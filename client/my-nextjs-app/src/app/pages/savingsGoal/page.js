'use client';

import { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from '@/app/context/UserContext';
import Navbar from '@/app/components/Navbar';

const SavingsGoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({ name: "", targetAmount: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { user } = useUser();
  const userId = user.id; // Replace with dynamic user ID if necessary

  // Fetch goals on load
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/goals/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        setGoals(response.data);
      } catch (error) {
        console.log("Failed to fetch goals:", error);
      }
    };
    fetchGoals();
  }, [userId]);

  // Add a new goal
  const handleAddGoal = async () => {
    if (!newGoal.name || !newGoal.targetAmount) {
      setErrorMessage("Please fill out all fields.");
      return;
    }
    try {
      const response = await axios.post(`http://localhost:8080/api/goals/${userId}`, {
        name: newGoal.name,
        targetAmount: newGoal.targetAmount,
      }, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      setGoals([...goals, response.data]);
      setNewGoal({ name: "", targetAmount: "" });
      setIsModalOpen(false);
      setErrorMessage("");
    } catch (error) {
      console.error("Failed to add goal:", error);
      setErrorMessage("Failed to add goal.");
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
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      setGoals(
        goals.map((goal) =>
          goal.id === goalId ? { ...goal, savedAmount: response.data.savedAmount } : goal
        )
      );
      alert("Amount added successfully!");
    } catch (error) {
      console.error("Failed to update saved amount:", error);
      alert("There was an error updating your saved amount.");
    }
  };

  // Delete a goal
  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm("Are you sure you want to delete this goal?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/goals/${goalId}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      setGoals(goals.filter((goal) => goal.id !== goalId));
    } catch (error) {
      console.log("Failed to delete goal:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-15">
        <div className="text-center mb-8 pt-14 pb-6">
          <h1 className="text-4xl font-bold text-green-600 leading-tight">Savings Goals</h1>
          <p className="text-gray-600 text-lg mt-2">Track and manage your savings effectively.</p>
        </div>

        {/* Goals List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="bg-white shadow-md rounded-lg p-6 border border-gray-200 hover:shadow-xl transition"
            >
              <h2 className="text-lg font-semibold text-gray-800">{goal.name}</h2>
              <p className="text-sm text-gray-600 mt-1">
                Target: <span className="font-bold">${goal.targetAmount}</span>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Saved: <span className="font-bold">${goal.savedAmount}</span>
              </p>
              <div className="relative w-full bg-gray-300 h-3 rounded-full mt-3">
                <div
                  className="absolute top-0 left-0 h-3 bg-green-500 rounded-full"
                  style={{
                    width: `${(goal.savedAmount / goal.targetAmount) * 100 || 0
                      }%`,
                  }}
                ></div>
              </div>

              <div className="flex space-x-2 mt-4">
                <button
                  className="bg-blue-500 text-white py-1 px-4 rounded-lg hover:bg-blue-600 transition"
                  onClick={() => handleUpdateSavedAmount(goal.id)}
                >
                  Add Amount
                </button>
                <button
                  className="bg-red-500 text-white py-1 px-4 rounded-lg hover:bg-red-600 transition"
                  onClick={() => handleDeleteGoal(goal.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Goal Button */}
        <div className="text-center mt-8">
          <button
            className="bg-green-500 text-white py-2 px-6 rounded-lg hover:bg-green-600 transition"
            onClick={() => setIsModalOpen(true)}
          >
            Add New Goal
          </button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-gray-800">Add New Goal</h2>
            <div className="mt-4">
              <label className="block text-sm text-gray-600">Goal Name</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                value={newGoal.name}
                onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm text-gray-600">Target Amount</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                value={newGoal.targetAmount}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, targetAmount: e.target.value })
                }
              />
            </div>
            {errorMessage && (
              <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
            )}
            <div className="mt-6 flex justify-end space-x-4">
              <button
                className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition"
                onClick={handleAddGoal}
              >
                Save
              </button>
              <button
                className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400 transition"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavingsGoalsPage;
