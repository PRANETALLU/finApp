'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '@/app/context/UserContext';

const Budget = () => {
    const { user } = useUser();
    const [budgets, setBudgets] = useState([]);
    const [newBudget, setNewBudget] = useState({
        category: '', amount: '', description: '', budgetType: 'monthly'
    });
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [notification, setNotification] = useState('');
    const [editingBudgetId, setEditingBudgetId] = useState(null);
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

    useEffect(() => {
        if (user?.token && user?.id) {
            fetchBudgets();
        }
    }, [user]);

    const fetchBudgets = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`http://localhost:8080/api/budgets/${user.id}`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setBudgets(response.data);
        } catch (error) {
            console.error('Error fetching budgets', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getDateRange = (budgetType) => {
        const now = new Date();
        let start, end;

        if (budgetType === "monthly") {
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        } else if (budgetType === "yearly") {
            start = new Date(now.getFullYear(), 0, 1);
            end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
        } else {
            // fallback if needed
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        }

        return {
            startDate: start.toISOString(),
            endDate: end.toISOString(),
        };
    };

    const syncBudgetWithExpenses = async (budgetId, category, budgetType) => {
        try {
            const { startDate, endDate } = getDateRange(budgetType);

            const expenseResponse = await axios.get(
                `http://localhost:8080/api/transactions/total/filter`,
                {
                    headers: { Authorization: `Bearer ${user.token}` },
                    params: {
                        type: "EXPENSE",
                        category,
                        startDate,
                        endDate,
                    },
                }
            );

            await axios.patch(
                `http://localhost:8080/api/budgets/${user.id}/${budgetId}/spent`,
                { spentAmount: expenseResponse.data },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
        } catch (error) {
            console.error("Error syncing budget with expenses:", error);
        }
    };


    const syncAllBudgets = async () => {
        if (budgets.length === 0) return;

        const syncPromises = budgets.map((budget) =>
            syncBudgetWithExpenses(budget.id, budget.category, budget.budgetType)
        );

        try {
            await Promise.all(syncPromises);
            fetchBudgets();
            setSuccessMessage("Budgets synced successfully!");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error) {
            setErrorMessage("Failed to sync budgets.");
        }
    };


    const forceResetBudget = async (budgetId) => {
        try {
            await axios.post(`http://localhost:8080/api/budgets/${user.id}/${budgetId}/reset`, {}, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setSuccessMessage('Budget reset successfully!');
            fetchBudgets();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            setErrorMessage('Failed to reset budget.');
        }
    };

    const handleAddBudget = async (e) => {
        e.preventDefault();
        if (!newBudget.category || !newBudget.amount) {
            setErrorMessage('Category and amount are required.');
            return;
        }
        try {
            const response = await axios.post(`http://localhost:8080/api/budgets/${user.id}`, newBudget, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setBudgets([...budgets, response.data]);
            setNewBudget({ category: '', amount: '', description: '', budgetType: 'monthly' });
            setErrorMessage('');
            setSuccessMessage('Budget created successfully!');
            setShowForm(false);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            setErrorMessage('Failed to add budget.');
        }
    };

    const handleEditBudget = (budget) => {
        setEditingBudgetId(budget.id);
        setNewBudget({
            category: budget.category,
            amount: budget.amount,
            description: budget.description,
            budgetType: budget.budgetType,
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
            const response = await axios.put(`http://localhost:8080/api/budgets/${user.id}/${editingBudgetId}`,
                { ...newBudget, id: editingBudgetId },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            setBudgets(budgets.map((budget) => budget.id === editingBudgetId ? response.data : budget));
            setNewBudget({ category: '', amount: '', description: '', budgetType: 'monthly' });
            setEditingBudgetId(null);
            setSuccessMessage('Budget updated successfully!');
            setShowForm(false);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            setErrorMessage('Failed to update budget.');
        }
    };

    const handleDeleteBudget = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/api/budgets/${user.id}/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setBudgets(budgets.filter((budget) => budget.id !== id));
            setSuccessMessage('Budget deleted successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            setErrorMessage('Failed to delete budget.');
        }
    };

    const calculateBudgetProgress = (amount, spent) => {
        if (amount === 0) return 0;
        return Math.min((spent / amount) * 100, 100);
    };

    const handleBudgetNotification = () => {
        budgets.forEach((budget) => {
            const spent = budget.spentAmount || 0;
            const progress = calculateBudgetProgress(budget.amount, spent);
            if (progress >= 90 && progress < 100) {
                setNotification(`Warning: Budget for ${budget.category} is at ${progress.toFixed(1)}%`);
            } else if (progress >= 100) {
                setNotification(`Alert: Budget for ${budget.category} exceeded!`);
            }
        });
    };

    useEffect(() => {
        handleBudgetNotification();
    }, [budgets]);

    const getCategoryIcon = (category) => {
        const icons = {
            'GROCERIES': '🛒', 'UTILITIES': '💡', 'RENT': '🏠', 'ENTERTAINMENT': '🎬',
            'TRANSPORTATION': '🚗', 'HEALTHCARE': '🏥', 'INSURANCE': '🛡️', 'SUBSCRIPTIONS': '📱',
            'DINING': '🍽️', 'SHOPPING': '🛍️', 'TRAVEL': '✈️', 'EDUCATION': '📚',
            'PETS': '🐕', 'GIFTS': '🎁'
        };
        return icons[category] || '💰';
    };

    const getBudgetStatus = (progress) => {
        if (progress >= 100) return { color: 'text-red-600', label: 'Over Budget', bg: 'bg-red-500' };
        if (progress >= 90) return { color: 'text-orange-600', label: 'Near Limit', bg: 'bg-orange-500' };
        if (progress >= 75) return { color: 'text-yellow-600', label: 'On Track', bg: 'bg-yellow-500' };
        return { color: 'text-green-600', label: 'Under Budget', bg: 'bg-green-500' };
    };

    const getResetInfo = (budget) => {
        if (typeof window === 'undefined') {
            return {
                lastReset: 'Loading...',
                nextReset: 'Loading...',
                daysUntil: 0
            };
        }

        const now = new Date();
        const lastReset = new Date(budget.lastResetDate);

        if (budget.budgetType === 'monthly') {
            const nextReset = new Date(lastReset.getFullYear(), lastReset.getMonth() + 1, 1);
            const daysUntilReset = Math.ceil((nextReset - now) / (1000 * 60 * 60 * 24));
            return {
                lastReset: lastReset.toLocaleDateString(),
                nextReset: nextReset.toLocaleDateString(),
                daysUntil: Math.max(0, daysUntilReset)
            };
        } else {
            const nextReset = new Date(lastReset.getFullYear() + 1, 0, 1);
            const daysUntilReset = Math.ceil((nextReset - now) / (1000 * 60 * 60 * 24));
            return {
                lastReset: lastReset.toLocaleDateString(),
                nextReset: nextReset.toLocaleDateString(),
                daysUntil: Math.max(0, daysUntilReset)
            };
        }
    };

    const filteredBudgets = budgets.filter(budget => {
        const matchesCategory = filterCategory === '' || budget.category === filterCategory;
        const matchesType = filterType === 'all' || budget.budgetType === filterType;
        return matchesCategory && matchesType;
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600">Loading budgets...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-6xl mx-auto pt-20">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Budget Management</h1>
                    <p className="text-gray-600 mb-6">Track budgets with automatic monthly/yearly resets</p>

                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className={`px-6 py-3 rounded-lg font-medium transition ${showForm ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                        >
                            {showForm ? 'Cancel' : 'Add Budget'}
                        </button>

                        <button
                            onClick={syncAllBudgets}
                            className="px-6 py-3 rounded-lg font-medium bg-green-600 hover:bg-green-700 text-white transition"
                        >
                            Sync Expenses
                        </button>
                    </div>
                </div>

                {successMessage && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                        {successMessage}
                    </div>
                )}

                {errorMessage && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {errorMessage}
                    </div>
                )}

                {notification && (
                    <div className="bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded mb-4">
                        {notification}
                    </div>
                )}

                {showForm && (
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h2 className="text-xl font-bold mb-4">
                            {editingBudgetId ? 'Edit Budget' : 'Create Budget'}
                        </h2>

                        <form onSubmit={editingBudgetId ? handleUpdateBudget : handleAddBudget} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <select
                                    value={newBudget.category}
                                    onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                                    className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(category => (
                                        <option key={category} value={category}>
                                            {category.replace(/_/g, ' ')}
                                        </option>
                                    ))}
                                </select>

                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="Amount"
                                    value={newBudget.amount}
                                    onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                                    className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <select
                                value={newBudget.budgetType}
                                onChange={(e) => setNewBudget({ ...newBudget, budgetType: e.target.value })}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="monthly">Monthly (Auto-reset each month)</option>
                                <option value="yearly">Yearly (Auto-reset each year)</option>
                            </select>

                            <textarea
                                placeholder="Description (optional)"
                                value={newBudget.description}
                                onChange={(e) => setNewBudget({ ...newBudget, description: e.target.value })}
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                rows="2"
                            />

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
                                >
                                    {editingBudgetId ? 'Update' : 'Create'} Budget
                                </button>
                                {editingBudgetId && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingBudgetId(null);
                                            setNewBudget({ category: '', amount: '', description: '', budgetType: 'monthly' });
                                            setShowForm(false);
                                        }}
                                        className="px-6 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <h3 className="font-bold mb-3">Filters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="p-3 border rounded-lg"
                        >
                            <option value="">All Categories</option>
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {category.replace(/_/g, ' ')}
                                </option>
                            ))}
                        </select>

                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="p-3 border rounded-lg"
                        >
                            <option value="all">All Types</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                        <p className="text-sm text-gray-600">Total Budgets</p>
                        <p className="text-2xl font-bold text-blue-600">{budgets.length}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                        <p className="text-sm text-gray-600">Total Allocated</p>
                        <p className="text-2xl font-bold text-green-600">
                            ${budgets.reduce((sum, b) => sum + parseFloat(b.amount), 0).toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                        <p className="text-sm text-gray-600">Total Spent</p>
                        <p className="text-2xl font-bold text-red-600">
                            ${budgets.reduce((sum, b) => sum + parseFloat(b.spentAmount || 0), 0).toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow text-center">
                        <p className="text-sm text-gray-600">Over Budget</p>
                        <p className="text-2xl font-bold text-orange-600">
                            {budgets.filter(b => calculateBudgetProgress(b.amount, b.spentAmount || 0) >= 100).length}
                        </p>
                    </div>
                </div>

                {filteredBudgets.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBudgets.map((budget) => {
                            const spent = budget.spentAmount || 0;
                            const progress = calculateBudgetProgress(budget.amount, spent);
                            const status = getBudgetStatus(progress);
                            const remaining = Math.max(budget.amount - spent, 0);
                            const resetInfo = getResetInfo(budget);

                            return (
                                <div key={budget.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">{getCategoryIcon(budget.category)}</span>
                                            <div>
                                                <h3 className="font-bold text-gray-800">
                                                    {budget.category.replace(/_/g, ' ')}
                                                </h3>
                                                <span className="text-sm text-gray-500">{budget.budgetType}</span>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${progress >= 100 ? 'bg-red-100 text-red-800' :
                                            progress >= 90 ? 'bg-orange-100 text-orange-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                            {status.label}
                                        </span>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Budget:</span>
                                            <span className="font-bold">${parseFloat(budget.amount).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Spent:</span>
                                            <span className="font-bold text-red-600">${parseFloat(spent).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Remaining:</span>
                                            <span className={`font-bold ${remaining > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                ${parseFloat(remaining).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm text-gray-600">Progress</span>
                                            <span className={`text-sm font-semibold ${status.color}`}>
                                                {progress.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-full rounded-full ${status.bg}`}
                                                style={{ width: `${Math.min(progress, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-3 rounded-lg mb-4">
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <div className="flex justify-between">
                                                <span>Last Reset:</span>
                                                <span>{resetInfo.lastReset}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Next Reset:</span>
                                                <span>{resetInfo.nextReset}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Days Until Reset:</span>
                                                <span className="font-semibold">{resetInfo.daysUntil}</span>
                                            </div>
                                            {budget.description && (
                                                <div className="pt-2 border-t">
                                                    <p>{budget.description}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEditBudget(budget)}
                                            className="flex-1 bg-blue-500 text-white py-2 px-3 rounded hover:bg-blue-600 text-sm"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => forceResetBudget(budget.id)}
                                            className="bg-yellow-500 text-white py-2 px-3 rounded hover:bg-yellow-600 text-sm"
                                        >
                                            Reset
                                        </button>
                                        <button
                                            onClick={() => handleDeleteBudget(budget.id)}
                                            className="bg-red-500 text-white py-2 px-3 rounded hover:bg-red-600 text-sm"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <div className="text-6xl mb-4">💰</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No Budgets Found</h3>
                        <p className="text-gray-600 mb-4">
                            {filterCategory || filterType !== 'all'
                                ? 'No budgets match your filters'
                                : 'Create your first budget to get started'
                            }
                        </p>
                        {!showForm && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                            >
                                Create Budget
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Budget;