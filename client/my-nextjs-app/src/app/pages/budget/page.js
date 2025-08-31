'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '@/app/context/UserContext';

const Budget = () => {
    const { user } = useUser();
    const [budgets, setBudgets] = useState([]);
    const [newBudget, setNewBudget] = useState({ 
        category: '', 
        amount: '', 
        description: '', 
        budgetType: 'monthly', 
        startDate: '', 
        endDate: '' 
    });
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [notification, setNotification] = useState('');
    const [editingBudgetId, setEditingBudgetId] = useState(null);
    const [expensesByCategory, setExpensesByCategory] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [filterCategory, setFilterCategory] = useState('');
    const [filterType, setFilterType] = useState('all');

    const categories = [
        'GROCERIES', 'UTILITIES', 'RENT', 'ENTERTAINMENT', 'TRANSPORTATION',
        'HEALTHCARE', 'INSURANCE', 'SUBSCRIPTIONS', 'LOANS', 'CREDIT_CARD_PAYMENT',
        'TRAVEL', 'EDUCATION', 'SHOPPING', 'PETS', 'GIFTS', 'TAXES', 'DINING',
        'CHARITY', 'HOUSEHOLD', 'PERSONAL_CARE', 'INVESTMENTS', 'MISC_EXPENSE'
    ];

    // Fetch user's budgets
    useEffect(() => {
        if (user?.token && user?.id) {
            setIsLoading(true);
            axios
                .get(`http://localhost:8080/api/budgets/${user.id}`, {
                    headers: { Authorization: `Bearer ${user.token}` },
                })
                .then((response) => {
                    setBudgets(response.data);
                })
                .catch((error) => {
                    console.log('Error fetching budgets', error);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [user]);

    const calculateExpenseByCategory = async (category) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/transactions/expenses/category/total`, {
                headers: { Authorization: `Bearer ${user.token}` },
                params: { category: category },
            });

            setExpensesByCategory((prevState) => ({
                ...prevState,
                [category]: response.data,
            }));
        } catch (error) {
            console.log('Error fetching total expenses by category:', error);
        }
    };

    const handleAddBudget = async (e) => {
        e.preventDefault();
        if (!newBudget.category || !newBudget.amount) {
            setErrorMessage('Category and amount are required.');
            return;
        }

        try {
            const response = await axios.post(
                `http://localhost:8080/api/budgets/${user.id}`,
                newBudget,
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setBudgets([...budgets, response.data]);
            setNewBudget({ 
                category: '', 
                amount: '', 
                description: '', 
                budgetType: 'monthly', 
                startDate: '', 
                endDate: '' 
            });
            setErrorMessage('');
            setSuccessMessage('Budget created successfully!');
            setShowForm(false);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            setErrorMessage('Failed to add budget. Please try again.');
        }
    };

    const handleEditBudget = (budget) => {
        setEditingBudgetId(budget.id);
        setNewBudget({
            category: budget.category,
            amount: budget.amount,
            description: budget.description,
            budgetType: budget.budgetType,
            startDate: budget.startDate,
            endDate: budget.endDate,
        });
        setShowForm(true);
    };

    const handleUpdateBudget = async (e) => {
        e.preventDefault();
        if (!newBudget.category || !newBudget.amount) {
            setErrorMessage('Category and amount are required.');
            return;
        }

        try {
            const response = await axios.put(
                `http://localhost:8080/api/budgets/${user.id}/${editingBudgetId}`,
                newBudget,
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setBudgets(budgets.map((budget) => 
                budget.id === editingBudgetId ? response.data : budget
            ));
            setNewBudget({ 
                category: '', 
                amount: '', 
                description: '', 
                budgetType: 'monthly', 
                startDate: '', 
                endDate: '' 
            });
            setEditingBudgetId(null);
            setErrorMessage('');
            setSuccessMessage('Budget updated successfully!');
            setShowForm(false);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            setErrorMessage('Failed to update budget. Please try again.');
        }
    };

    const handleDeleteBudget = async (id) => {
        try {
            await axios.delete(
                `http://localhost:8080/api/budgets/${user.id}/${id}`,
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setBudgets(budgets.filter((budget) => budget.id !== id));
            setSuccessMessage('Budget deleted successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.log('Failed to delete budget', error);
        }
    };

    const calculateBudgetProgress = (amount, spent) => {
        return Math.min((spent / amount) * 100, 100);
    };

    const handleBudgetNotification = () => {
        budgets.forEach((budget) => {
            const spent = expensesByCategory[budget.category] || 0;
            const progress = calculateBudgetProgress(budget.amount, spent);
            if (progress >= 90 && progress < 100) {
                setNotification(`Warning: You're about to exceed your budget for ${budget.category}!`);
            } else if (progress >= 100) {
                setNotification(`Alert: You've exceeded your budget for ${budget.category}!`);
            }
        });
    };

    useEffect(() => {
        handleBudgetNotification();
    }, [budgets, expensesByCategory]);

    useEffect(() => {
        if (user?.token && user?.id) {
            budgets.forEach((budget) => {
                calculateExpenseByCategory(budget.category);
            });
        }
    }, [user, budgets]);

    const getCategoryIcon = (category) => {
        const icons = {
            'GROCERIES': '🛒',
            'UTILITIES': '💡',
            'RENT': '🏠',
            'ENTERTAINMENT': '🎬',
            'TRANSPORTATION': '🚗',
            'HEALTHCARE': '🏥',
            'INSURANCE': '🛡️',
            'SUBSCRIPTIONS': '📱',
            'DINING': '🍽️',
            'SHOPPING': '🛍️',
            'TRAVEL': '✈️',
            'EDUCATION': '📚',
            'PETS': '🐕',
            'GIFTS': '🎁',
        };
        return icons[category] || '💰';
    };

    const getBudgetStatus = (progress) => {
        if (progress >= 100) return { color: 'text-red-600', label: 'Over Budget', bg: 'bg-red-500' };
        if (progress >= 90) return { color: 'text-orange-600', label: 'Near Limit', bg: 'bg-orange-500' };
        if (progress >= 75) return { color: 'text-yellow-600', label: 'On Track', bg: 'bg-yellow-500' };
        return { color: 'text-green-600', label: 'Under Budget', bg: 'bg-green-500' };
    };

    const filteredBudgets = budgets.filter(budget => {
        const matchesCategory = filterCategory === '' || budget.category === filterCategory;
        const matchesType = filterType === 'all' || budget.budgetType === filterType;
        return matchesCategory && matchesType;
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto"></div>
                    <p className="text-xl font-medium text-gray-700 animate-pulse">Loading your budgets...</p>
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
                        Budget Management
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                        Create and track budgets to stay on top of your spending goals
                    </p>
                    
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg mx-auto ${
                            showForm 
                                ? 'bg-red-500 hover:bg-red-600 text-white' 
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                    >
                        <span className="text-2xl">{showForm ? '❌' : '➕'}</span>
                        {showForm ? 'Cancel' : editingBudgetId ? 'Edit Budget' : 'Create Budget'}
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

                {notification && (
                    <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 mb-6 rounded-r-lg animate-pulse">
                        <div className="flex items-center">
                            <span className="text-2xl mr-3">🚨</span>
                            {notification}
                        </div>
                    </div>
                )}

                {/* Add/Edit Budget Form */}
                {showForm && (
                    <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 border border-gray-200 animate-slideDown">
                        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center flex items-center justify-center gap-3">
                            <span className="text-3xl">💰</span>
                            {editingBudgetId ? 'Edit Budget' : 'Create New Budget'}
                        </h2>
                        
                        <form onSubmit={editingBudgetId ? handleUpdateBudget : handleAddBudget} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Category *</label>
                                    <select
                                        value={newBudget.category}
                                        onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                                        className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 bg-gray-50 hover:bg-white transition-colors duration-300"
                                    >
                                        <option value="" disabled>Select Category</option>
                                        {categories.map(category => (
                                            <option key={category} value={category}>
                                                {getCategoryIcon(category)} {category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Budget Amount *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={newBudget.amount}
                                        onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                                        className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 bg-gray-50 hover:bg-white transition-colors duration-300"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Budget Type</label>
                                    <select
                                        value={newBudget.budgetType}
                                        onChange={(e) => setNewBudget({ ...newBudget, budgetType: e.target.value })}
                                        className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 bg-gray-50 hover:bg-white transition-colors duration-300"
                                    >
                                        <option value="monthly">📅 Monthly</option>
                                        <option value="yearly">🗓️ Yearly</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Start Date</label>
                                    <input
                                        type="datetime-local"
                                        value={newBudget.startDate}
                                        onChange={(e) => setNewBudget({ ...newBudget, startDate: e.target.value })}
                                        className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 bg-gray-50 hover:bg-white transition-colors duration-300"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">End Date</label>
                                <input
                                    type="datetime-local"
                                    value={newBudget.endDate}
                                    onChange={(e) => setNewBudget({ ...newBudget, endDate: e.target.value })}
                                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 bg-gray-50 hover:bg-white transition-colors duration-300"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Description</label>
                                <textarea
                                    placeholder="Add a description for this budget..."
                                    value={newBudget.description}
                                    onChange={(e) => setNewBudget({ ...newBudget, description: e.target.value })}
                                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 bg-gray-50 hover:bg-white transition-colors duration-300 resize-none"
                                    rows="3"
                                />
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105 font-semibold"
                                >
                                    {editingBudgetId ? 'Update Budget' : 'Create Budget'}
                                </button>
                                {editingBudgetId && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingBudgetId(null);
                                            setNewBudget({ 
                                                category: '', 
                                                amount: '', 
                                                description: '', 
                                                budgetType: 'monthly', 
                                                startDate: '', 
                                                endDate: '' 
                                            });
                                            setShowForm(false);
                                        }}
                                        className="px-6 bg-gray-500 text-white py-4 rounded-xl hover:bg-gray-600 transition-colors duration-300 font-semibold"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
                        <span className="text-2xl">🔍</span>
                        Filter Budgets
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 bg-gray-50 hover:bg-white transition-colors duration-300"
                        >
                            <option value="">All Categories</option>
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                                </option>
                            ))}
                        </select>

                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 bg-gray-50 hover:bg-white transition-colors duration-300"
                        >
                            <option value="all">All Types</option>
                            <option value="monthly">Monthly Only</option>
                            <option value="yearly">Yearly Only</option>
                        </select>
                    </div>
                </div>

                {/* Budget Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow duration-300 border border-gray-200">
                        <div className="text-3xl mb-2">📊</div>
                        <p className="text-sm text-gray-600 mb-1">Total Budgets</p>
                        <p className="text-2xl font-bold text-indigo-600">{budgets.length}</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow duration-300 border border-gray-200">
                        <div className="text-3xl mb-2">💰</div>
                        <p className="text-sm text-gray-600 mb-1">Total Allocated</p>
                        <p className="text-2xl font-bold text-green-600">
                            ${budgets.reduce((sum, b) => sum + parseFloat(b.amount), 0).toLocaleString()}
                        </p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow duration-300 border border-gray-200">
                        <div className="text-3xl mb-2">💸</div>
                        <p className="text-sm text-gray-600 mb-1">Total Spent</p>
                        <p className="text-2xl font-bold text-red-600">
                            ${Object.values(expensesByCategory).reduce((sum, amount) => sum + (amount || 0), 0).toLocaleString()}
                        </p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow duration-300 border border-gray-200">
                        <div className="text-3xl mb-2">⚠️</div>
                        <p className="text-sm text-gray-600 mb-1">Over Budget</p>
                        <p className="text-2xl font-bold text-orange-600">
                            {budgets.filter(b => {
                                const spent = expensesByCategory[b.category] || 0;
                                return calculateBudgetProgress(b.amount, spent) >= 100;
                            }).length}
                        </p>
                    </div>
                </div>

                {/* Budget Cards */}
                {filteredBudgets.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBudgets.map((budget, index) => {
                            const spent = expensesByCategory[budget.category] || 0;
                            const progress = calculateBudgetProgress(budget.amount, spent);
                            const status = getBudgetStatus(progress);
                            const remaining = Math.max(budget.amount - spent, 0);

                            return (
                                <div
                                    key={budget.id}
                                    className="group bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200"
                                    style={{
                                        animationDelay: `${index * 100}ms`,
                                        animation: 'fadeInUp 0.5s ease-out forwards'
                                    }}
                                >
                                    {/* Budget Header */}
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl">{getCategoryIcon(budget.category)}</span>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-800">
                                                    {budget.category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                                                </h3>
                                                <span className="text-sm text-gray-500 capitalize">{budget.budgetType}</span>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            progress >= 100 ? 'bg-red-100 text-red-800' :
                                            progress >= 90 ? 'bg-orange-100 text-orange-800' :
                                            progress >= 75 ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                            {status.label}
                                        </span>
                                    </div>

                                    {/* Budget Amount Info */}
                                    <div className="space-y-4 mb-6">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Budget:</span>
                                            <span className="text-xl font-bold text-gray-800">${budget.amount.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Spent:</span>
                                            <span className="text-xl font-bold text-red-600">${spent.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Remaining:</span>
                                            <span className={`text-xl font-bold ${remaining > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                ${remaining.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mb-6">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-gray-600">Progress</span>
                                            <span className={`text-sm font-semibold ${status.color}`}>
                                                {progress.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ease-out ${status.bg}`}
                                                style={{ width: `${Math.min(progress, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Budget Period */}
                                    <div className="bg-gray-50 p-4 rounded-xl mb-6">
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <p><strong>Period:</strong> {new Date(budget.startDate).toLocaleDateString()} - {new Date(budget.endDate).toLocaleDateString()}</p>
                                            {budget.description && (
                                                <p><strong>Description:</strong> {budget.description}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleEditBudget(budget)}
                                            className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-xl hover:bg-blue-600 transition-colors duration-300 font-medium"
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteBudget(budget.id)}
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
                        <div className="text-6xl mb-4">💰</div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">No Budgets Found</h3>
                        <p className="text-gray-600 mb-6">
                            {filterCategory || filterType !== 'all'
                                ? 'No budgets match your current filters'
                                : 'Start managing your finances by creating your first budget'
                            }
                        </p>
                        {!showForm && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 transition-colors duration-300 font-medium"
                            >
                                Create First Budget
                            </button>
                        )}
                    </div>
                )}

                {/* Budget Tips */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-8 mt-8 text-white">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                        <span className="text-2xl">💡</span>
                        Budget Tips
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-white bg-opacity-10 p-4 rounded-xl backdrop-blur-sm">
                            <h4 className="font-semibold mb-2">50/30/20 Rule</h4>
                            <p className="text-sm opacity-90">Allocate 50% for needs, 30% for wants, and 20% for savings</p>
                        </div>
                        <div className="bg-white bg-opacity-10 p-4 rounded-xl backdrop-blur-sm">
                            <h4 className="font-semibold mb-2">Track Daily</h4>
                            <p className="text-sm opacity-90">Monitor your spending daily to stay within budget limits</p>
                        </div>
                        <div className="bg-white bg-opacity-10 p-4 rounded-xl backdrop-blur-sm">
                            <h4 className="font-semibold mb-2">Emergency Fund</h4>
                            <p className="text-sm opacity-90">Set aside 3-6 months of expenses for unexpected situations</p>
                        </div>
                    </div>
                </div>
            </div>

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
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
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

export default Budget;