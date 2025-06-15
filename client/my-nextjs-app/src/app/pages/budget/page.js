'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '@/app/context/UserContext';
import Navbar from '@/app/components/Navbar';

const Budget = () => {
    const { user } = useUser();
    const [budgets, setBudgets] = useState([]);
    const [newBudget, setNewBudget] = useState({ category: '', amount: '', description: '', budgetType: 'monthly', startDate: '', endDate: '' });
    const [errorMessage, setErrorMessage] = useState('');
    const [notification, setNotification] = useState('');
    const [editingBudgetId, setEditingBudgetId] = useState(null);
    const [expensesByCategory, setExpensesByCategory] = useState({});

    // Fetch user's budgets
    useEffect(() => {
        if (user?.token && user?.id) {
            axios
                .get(`http://localhost:8080/api/budgets/${user.id}`, {
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

    const calculateExpenseByCategory = async (category) => {
        console.log('User', user)
        console.log('Category', category)
        try {
            const response = await axios.get(`http://localhost:8080/api/transactions/expenses/category/total`, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
                params: {
                    category: category,
                },
            });

            console.log(response.data)

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
            setErrorMessage('All fields are required.');
            return;
        }

        try {
            const response = await axios.post(
                `http://localhost:8080/api/budgets/${user.id}`,
                newBudget,
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                }
            );
            setBudgets([...budgets, response.data]);
            setNewBudget({ category: '', amount: '', description: '', budgetType: 'monthly', startDate: '', endDate: '' });
            setErrorMessage('');
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
            startDate: budget.startDate,
            endDate: budget.endDate,
        });
    };

    const handleUpdateBudget = async (e) => {
        e.preventDefault();

        if (!newBudget.category || !newBudget.amount) {
            setErrorMessage('All fields are required.');
            return;
        }

        try {
            const response = await axios.put(
                `http://localhost:8080/api/budgets/${user.id}/${editingBudgetId}`,
                newBudget,
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                }
            );
            setBudgets(budgets.map((budget) => (budget.id === editingBudgetId ? response.data : budget)));
            setNewBudget({ category: '', amount: '', description: '', budgetType: 'monthly', startDate: '', endDate: '' });
            setEditingBudgetId(null);
            setErrorMessage('');
        } catch (error) {
            setErrorMessage('Failed to update budget.');
        }
    };

    const handleDeleteBudget = async (id) => {
        try {
            await axios.delete(
                `http://localhost:8080/api/budgets/${user.id}/${id}`,
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
            const progress = calculateBudgetProgress(budget.amount, expensesByCategory[budget.category] || 0);
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-500 to-blue-500 text-white flex flex-col justify-center items-center pt-24 pb-8">
            <Navbar />
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg mt-8">
                <h1 className="text-3xl font-semibold mb-6 text-gray-800 text-center">Budgeting</h1>

                {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}

                <form onSubmit={editingBudgetId ? handleUpdateBudget : handleAddBudget} className="space-y-4">
                    <div className="flex space-x-4">
                        <select
                            value={newBudget.category}
                            onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })}
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                        >
                            <option value="" disabled>Select Category</option>
                            {/* Add all your categories here */}
                            <option value="GROCERIES">Groceries</option>
                            <option value="UTILITIES">Utilities</option>
                            <option value="RENT">Rent</option>
                            <option value="ENTERTAINMENT">Entertainment</option>
                            <option value="TRANSPORTATION">Transportation</option>
                            <option value="HEALTHCARE">Healthcare</option>
                            <option value="INSURANCE">Insurance</option>
                            <option value="SUBSCRIPTIONS">Subscriptions</option>
                            <option value="LOANS">Loans</option>
                            <option value="CREDIT_CARD_PAYMENT">Credit Card Payment</option>
                            <option value="TRAVEL">Travel</option>
                            <option value="EDUCATION">Education</option>
                            <option value="SHOPPING">Shopping</option>
                            <option value="PETS">Pets</option>
                            <option value="GIFTS">Gifts</option>
                            <option value="TAXES">Taxes</option>
                            <option value="DINING">Dining</option>
                            <option value="CHARITY">Charity</option>
                            <option value="HOUSEHOLD">Household</option>
                            <option value="PERSONAL_CARE">Personal Care</option>
                            <option value="INVESTMENTS">Investments</option>
                            <option value="MISC_EXPENSE">Misc Expense</option>
                        </select>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                            type="datetime-local"
                            value={newBudget.startDate}
                            onChange={(e) => setNewBudget({ ...newBudget, startDate: e.target.value })}
                            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                        />
                        <input
                            type="datetime-local"
                            value={newBudget.endDate}
                            onChange={(e) => setNewBudget({ ...newBudget, endDate: e.target.value })}
                            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                        />
                    </div>
                    <select
                        value={newBudget.budgetType}
                        onChange={(e) => setNewBudget({ ...newBudget, budgetType: e.target.value })}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                    >
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                    </select>
                    <button
                        type="submit"
                        className="w-full p-3 bg-blue-500 rounded-lg text-white font-semibold"
                    >
                        {editingBudgetId ? 'Update Budget' : 'Add Budget'}
                    </button>
                </form>

                {/* Budget List */}
                <div className="mt-8 space-y-4">
                    {budgets.map((budget) => (
                        <div
                            key={budget.id}
                            className="bg-gray-100 p-6 rounded-lg shadow-md hover:shadow-xl transition duration-300"
                        >
                            {/* Header */}
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-xl font-semibold text-gray-800">{budget.category}</h2>
                                <div className="text-sm text-gray-600 space-y-1 text-right">
                                    <p>{budget.description}</p>
                                    <p className="capitalize">{budget.budgetType}</p>
                                    <p>Amount: ${budget.amount}</p>
                                    <p>Spent: ${expensesByCategory[budget.category] || 0}</p>
                                    <p>
                                        From: {new Date(budget.startDate).toLocaleDateString()} <br />
                                        To: {new Date(budget.endDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-4">
                                <div className="w-full bg-gray-300 h-2 rounded-full">
                                    <div
                                        className="bg-blue-500 h-2 rounded-full"
                                        style={{
                                            width: `${Math.min(
                                                calculateBudgetProgress(budget.amount, expensesByCategory[budget.category] || 0),
                                                100
                                            )}%`,
                                        }}
                                    ></div>
                                </div>
                                <p className="mt-2 text-sm text-gray-600">
                                    {Math.min(calculateBudgetProgress(budget.amount, expensesByCategory[budget.category] || 0), 100)}% of budget used
                                </p>

                            </div>

                            {/* Actions */}
                            <div className="flex space-x-4">
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
            {notification && <div className="text-red-500 mt-4">{notification}</div>}
        </div>
    );
};

export default Budget;
