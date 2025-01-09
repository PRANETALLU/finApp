'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '@/app/context/UserContext';
import Navbar from '@/app/components/Navbar';

const Budget = () => {
    const { user } = useUser();
    const [budgets, setBudgets] = useState([]);
    const [newBudget, setNewBudget] = useState({ category: '', amount: '', description: '' });
    const [errorMessage, setErrorMessage] = useState('');
    const [notification, setNotification] = useState('');
    const [editingBudgetId, setEditingBudgetId] = useState(null);

    // Fetch user's budgets
    useEffect(() => {
        if (user?.token && user?.id) {
            axios
                .get(`http://localhost:8080/api/users/${user.id}/budgets`, {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                })
                .then((response) => {
                    setBudgets(response.data);
                })
                .catch((error) => {
                    console.log('Error fetching budgets', error);
                });
        }
    }, [user]);

    const handleAddBudget = async (e) => {
        e.preventDefault();
        if (!newBudget.category || !newBudget.amount) {
            setErrorMessage('All fields are required.');
            return;
        }

        try {
            const response = await axios.post(
                `http://localhost:8080/api/users/${user.id}/budgets`,
                newBudget,
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                }
            );
            setBudgets([...budgets, response.data]);
            setNewBudget({ category: '', amount: '', description: '' });
            setErrorMessage('');
        } catch (error) {
            setErrorMessage('Failed to add budget.');
        }
    };

    const handleEditBudget = (budget) => {
        setEditingBudgetId(budget.id);
        setNewBudget({ category: budget.category, amount: budget.amount, description: budget.description });
    };

    const handleUpdateBudget = async (e) => {
        e.preventDefault();

        if (!newBudget.category || !newBudget.amount) {
            setErrorMessage('All fields are required.');
            return;
        }

        try {
            const response = await axios.put(
                `http://localhost:8080/api/users/${user.id}/budgets/${editingBudgetId}`,
                newBudget,
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                }
            );
            setBudgets(budgets.map((budget) => (budget.id === editingBudgetId ? response.data : budget)));
            setNewBudget({ category: '', amount: '', description: '' });
            setEditingBudgetId(null);
            setErrorMessage('');
        } catch (error) {
            setErrorMessage('Failed to update budget.');
        }
    };

    const handleDeleteBudget = async (id) => {
        try {
            await axios.delete(
                `http://localhost:8080/api/users/${user.id}/budgets/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                }
            );
            setBudgets(budgets.filter((budget) => budget.id !== id));
        } catch (error) {
            console.log('Failed to delete budget', error);
        }
    };

    const calculateBudgetProgress = (amount, spent) => {
        return (spent / amount) * 100;
    };

    const handleBudgetNotification = () => {
        budgets.forEach((budget) => {
            const progress = calculateBudgetProgress(budget.amount, budget.spentAmount);
            if (progress >= 90 && progress < 100) {
                setNotification(`Warning: You're about to exceed your budget for ${budget.category}!`);
            } else if (progress >= 100) {
                setNotification(`Alert: You've exceeded your budget for ${budget.category}!`);
            }
        });
    };

    useEffect(() => {
        handleBudgetNotification();
    }, [budgets]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-500 to-blue-500 text-white flex flex-col justify-center items-center py-8">
            <Navbar />
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg mt-8">
                <h1 className="text-3xl font-semibold mb-6 text-gray-800 text-center">Budgeting</h1>

                {/* Error Message */}
                {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}

                {/* New Budget Form */}
                <form
                    onSubmit={editingBudgetId ? handleUpdateBudget : handleAddBudget}
                    className="space-y-4"
                >
                    <div className="flex space-x-4">
                        <input
                            type="text"
                            placeholder="Category"
                            value={newBudget.category}
                            onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                        />
                        <input
                            type="number"
                            placeholder="Amount"
                            value={newBudget.amount}
                            onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                        />
                    </div>
                    <textarea
                        placeholder="Description"
                        value={newBudget.description}
                        onChange={(e) => setNewBudget({ ...newBudget, description: e.target.value })}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                        rows="4"
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 focus:outline-none"
                    >
                        {editingBudgetId ? 'Update Budget' : 'Add Budget'}
                    </button>
                </form>

                {/* Notification */}
                {notification && <p className="text-yellow-500 mt-4">{notification}</p>}

                {/* Budget List */}
                <div className="mt-8 space-y-4">
                    {budgets.map((budget) => (
                        <div
                            key={budget.id}
                            className="bg-gray-100 p-6 rounded-lg shadow-md hover:shadow-xl transition duration-300"
                        >
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl text-gray-800">{budget.category}</h2>
                                <div className="text-gray-600">
                                    <p className="text-sm">{budget.description}</p>
                                    <p className="text-sm">Amount: ${budget.amount}</p>
                                    <p className="text-sm">Spent: ${budget.spentAmount}</p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className="w-full bg-gray-300 h-2 rounded-full">
                                    <div
                                        className="bg-blue-500 h-2 rounded-full"
                                        style={{ width: `${calculateBudgetProgress(budget.amount, budget.spentAmount)}%` }}
                                    ></div>
                                </div>
                                <p className="mt-2 text-sm text-gray-600">
                                    {Math.min(calculateBudgetProgress(budget.amount, budget.spentAmount), 100)}% of budget used
                                </p>
                            </div>
                            <div className="mt-4 flex space-x-4">
                                <button
                                    onClick={() => handleEditBudget(budget)}
                                    className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 focus:outline-none"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteBudget(budget.id)}
                                    className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 focus:outline-none"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Budget;
