"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '@/app/context/UserContext';

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const { user } = useUser(); // Get the user object, which includes the token

    useEffect(() => {
        if (user?.token && user?.id) { // Ensure the token and id exist before making the request
            axios.get(`http://localhost:8080/api/dashboard/${user.id}`, {
                headers: {
                    Authorization: `Bearer ${user.token}`, // Pass the Bearer token here
                },
            })
                .then((response) => {
                    setDashboardData(response.data);
                })
                .catch((error) => {
                    console.log("There was an error fetching the dashboard data!", error);
                });
        }
    }, [user]); // Dependency includes user to re-fetch if it changes

    if (!dashboardData) {
        return <div>Loading...</div>;
    }

    // Prepare data for the pie chart
    const chartData = [
        { name: 'Income', value: parseFloat(dashboardData.totalIncome) },
        { name: 'Expense', value: parseFloat(dashboardData.totalExpense) },
    ];

    return (
        <div className="dashboard">
            <h2>Dashboard</h2>
            
            {/* Display pie chart */}
            <PieChart width={400} height={400}>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={150} fill="#8884d8">
                    <Cell name="Income" fill="#82ca9d" />
                    <Cell name="Expense" fill="#ff4f4f" />
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>

            <div className="summary">
                <h3>Summary</h3>
                <p>Total Income: {dashboardData.totalIncome}</p>
                <p>Total Expense: {dashboardData.totalExpense}</p>
                <p>Net Savings: {dashboardData.netSavings}</p>
            </div>
            
            {/* Display recent transactions */}
            <div className="transactions">
                <h3>Recent Transactions</h3>
                <ul>
                    {dashboardData.recentTransactions.map((transaction) => (
                        <li key={transaction.id}>
                            <strong>{transaction.amount}</strong> - {transaction.category} - {transaction.type} - {new Date(transaction.date).toLocaleDateString()}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Dashboard;
