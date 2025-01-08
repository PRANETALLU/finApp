'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '@/app/context/UserContext';
import Link from 'next/link';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import Navbar from '@/app/components/Navbar';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const { user } = useUser();

  useEffect(() => {
    if (user?.token && user?.id) {
      axios
        .get(`http://localhost:8080/api/dashboard/${user?.id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        })
        .then((response) => {
          setDashboardData(response.data);
        })
        .catch((error) => {
          console.error('Error fetching dashboard data:', error);
        });
    }
  }, [user]);

  if (!dashboardData) {
    return <div>Loading...</div>;
  }

  // Prepare data for the pie chart
  const chartData = [
    { name: 'Income', value: parseFloat(dashboardData.totalIncome) },
    { name: 'Expense', value: parseFloat(dashboardData.totalExpense) },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="container mx-auto pt-20 px-6">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          {/* Dashboard Header */}
          <h2 className="text-3xl font-semibold mb-6 text-center text-gray-800">
            Dashboard Overview
          </h2>

          {/* Financial Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-600 p-6 rounded-lg text-white text-center shadow-md">
              <h3 className="text-lg font-bold">Total Income</h3>
              <p className="text-2xl font-semibold">{dashboardData.totalIncome}</p>
            </div>
            <div className="bg-red-600 p-6 rounded-lg text-white text-center shadow-md">
              <h3 className="text-lg font-bold">Total Expense</h3>
              <p className="text-2xl font-semibold">{dashboardData.totalExpense}</p>
            </div>
            <div className="bg-green-600 p-6 rounded-lg text-white text-center shadow-md">
              <h3 className="text-lg font-bold">Net Savings</h3>
              <p className="text-2xl font-semibold">{dashboardData.netSavings}</p>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="flex justify-center items-center flex-col mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Income vs Expense
            </h3>
            <PieChart width={350} height={350}>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label
              >
                <Cell fill="#00C49F" />
                <Cell fill="#FF8042" />
              </Pie>
              <Tooltip />
            </PieChart>
          </div>

          {/* Recent Transactions */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Recent Transactions
            </h3>
            <ul className="space-y-4">
              {dashboardData.recentTransactions.map((transaction) => (
                <li
                  key={transaction.id}
                  className="bg-gray-200 p-4 rounded-lg shadow-md"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">
                      ${transaction.amount}
                    </span>
                    <span className="text-sm text-gray-600">
                      {transaction.category}
                    </span>
                  </div>
                  <p className="text-gray-600">
                    {transaction.type} -{' '}
                    {new Date(transaction.date).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
