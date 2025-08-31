'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '@/app/context/UserContext';
import Link from 'next/link';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [transactions, setTransactions] = useState(null);
  const [currentPredict, setCurrentPredict] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeChart, setActiveChart] = useState('overview');
  const { user } = useUser();

  useEffect(() => {
    if (user?.token && user?.id) {
      setIsLoading(true);
      Promise.all([
        axios.get(`http://localhost:8080/api/dashboard/${user?.id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        }),
        axios.get(`http://localhost:8080/api/transactions/${user?.id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        }),
        axios.post(`http://127.0.0.1:5000/predict-expense`, {
          userId: user.id,
          token: user.token,
        }),
      ])
        .then(([dashboardRes, transactionsRes, predictRes]) => {
          setDashboardData(dashboardRes.data);
          setTransactions(transactionsRes.data);
          setCurrentPredict(predictRes.data);
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto"></div>
          <p className="text-xl font-medium text-gray-700 animate-pulse">Loading your financial insights...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl">📊</div>
          <p className="text-xl font-medium text-gray-700">No data available</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const chartData = [
    { name: 'Income', value: parseFloat(dashboardData.totalIncome) },
    { name: 'Expense', value: parseFloat(dashboardData.totalExpense) },
  ];

  const categoryExpenseMap = {};
  if (transactions) {
    transactions.forEach((tx) => {
      if (tx.type === 'EXPENSE') {
        const category = tx.category || 'Uncategorized';
        categoryExpenseMap[category] = (categoryExpenseMap[category] || 0) + tx.amount;
      }
    });
  }

  const categoryChartData = Object.entries(categoryExpenseMap).map(([key, value]) => ({
    name: key,
    value: value,
  }));

  // Monthly Income & Expense
  const incomeExpenseByMonth = {};
  transactions?.forEach((t) => {
    const date = new Date(t.date);
    const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    if (!incomeExpenseByMonth[month]) {
      incomeExpenseByMonth[month] = { month, income: 0, expense: 0 };
    }
    if (t.type === 'INCOME') {
      incomeExpenseByMonth[month].income += t.amount;
    } else {
      incomeExpenseByMonth[month].expense += t.amount;
    }
  });
  const monthlyChartData = Object.values(incomeExpenseByMonth);

  // Savings Contributions Over Time
  const savingsData = transactions
    ?.filter((t) => t.category === 'Savings Contribution')
    ?.map((t) => ({
      date: new Date(t.date).toLocaleDateString(),
      amount: t.amount,
    }));

  // Cumulative Balance
  const cumulativeData = [];
  if (transactions) {
    const sorted = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    let balance = 0;
    for (const tx of sorted) {
      balance += tx.type === 'INCOME' ? tx.amount : -tx.amount;
      cumulativeData.push({
        date: new Date(tx.date).toLocaleDateString(),
        balance: parseFloat(balance.toFixed(2)),
      });
    }
  }

  // Prediction data
  const predicted = currentPredict?.predicted_next_3_months_expense || [];
  const previous = currentPredict?.previous_months_expense || [];
  const expensePredictionData = [
    ...previous.map((item) => ({ ...item, type: "Actual" })),
    ...predicted.map((item) => ({ ...item, type: "Predicted" }))
  ];

  const chartTabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'categories', label: 'Categories', icon: '🏷️' },
    { id: 'trends', label: 'Trends', icon: '📈' },
    { id: 'predictions', label: 'Forecast', icon: '🔮' },
  ];

  const renderActiveChart = () => {
    switch (activeChart) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Income vs Expense Pie */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-lg font-bold text-gray-800 mb-6 text-center">Income vs Expense</h3>
              <div className="flex justify-center">
                <PieChart width={300} height={300}>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ value, percent }) => `$${value.toLocaleString()}`}
                    labelLine={false}
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                </PieChart>
              </div>
            </div>

            {/* Monthly Comparison */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-lg font-bold text-gray-800 mb-6 text-center">Monthly Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                  <Legend />
                  <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case 'categories':
        return (
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-lg font-bold text-gray-800 mb-8 text-center">Expense Breakdown by Category</h3>
            <div className="flex justify-center">
              <PieChart width={450} height={450}>
                <Pie
                  data={categoryChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={150}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  labelLine={false}
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={[
                        '#6366f1', '#10b981', '#f59e0b', '#ef4444', 
                        '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
                      ][index % 8]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                <Legend 
                  verticalAlign="bottom" 
                  height={60}
                  wrapperStyle={{ paddingTop: '20px' }}
                />
              </PieChart>
            </div>
          </div>
        );

      case 'trends':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Cumulative Balance */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-lg font-bold text-gray-800 mb-6 text-center">Balance Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={cumulativeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Balance']} />
                  <Line 
                    type="monotone" 
                    dataKey="balance" 
                    stroke="#6366f1" 
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#6366f1' }}
                    activeDot={{ r: 6, fill: '#4f46e5' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Savings Contributions */}
            {savingsData && savingsData.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-lg font-bold text-gray-800 mb-6 text-center">Savings Progress</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={savingsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Savings']} />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#10b981' }}
                      activeDot={{ r: 6, fill: '#059669' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        );

      case 'predictions':
        return expensePredictionData.length > 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-lg font-bold text-gray-800 mb-8 text-center">Expense Forecast</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={expensePredictionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => [`$${value?.toLocaleString()}`, 'Amount']} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="amount"
                  name="Combined"
                  stroke="#d1d5db"
                  strokeWidth={2}
                  dot={false}
                  connectNulls={true}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey={(d) => (d.type === "Actual" ? d.amount : null)}
                  name="Actual"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 5, stroke: "#10b981", strokeWidth: 2, fill: "white" }}
                  connectNulls={false}
                  legendType="circle"
                />
                <Line
                  type="monotone"
                  dataKey={(d) => (d.type === "Predicted" ? d.amount : null)}
                  name="Predicted"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  strokeDasharray="8 4"
                  dot={{ r: 5, stroke: "#8b5cf6", strokeWidth: 2, fill: "white" }}
                  connectNulls={false}
                  legendType="line"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🔮</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Predictions Available</h3>
            <p className="text-gray-600">Add more transactions to see expense forecasts</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Financial Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Track your income, expenses, and savings with beautiful visualizations
          </p>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 p-8 rounded-2xl text-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Total Income</h3>
                <div className="text-3xl">💰</div>
              </div>
              <p className="text-3xl font-bold">${parseFloat(dashboardData.totalIncome).toLocaleString()}</p>
              <p className="text-blue-100 mt-2">Revenue streams</p>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-red-500 to-red-600 p-8 rounded-2xl text-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Total Expenses</h3>
                <div className="text-3xl">💸</div>
              </div>
              <p className="text-3xl font-bold">${parseFloat(dashboardData.totalExpense).toLocaleString()}</p>
              <p className="text-red-100 mt-2">Outgoing funds</p>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 p-8 rounded-2xl text-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Net Savings</h3>
                <div className="text-3xl">🎯</div>
              </div>
              <p className="text-3xl font-bold">${parseFloat(dashboardData.netSavings).toLocaleString()}</p>
              <p className="text-green-100 mt-2">Available balance</p>
            </div>
          </div>
        </div>

        {/* Chart Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {chartTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveChart(tab.id)}
              className={`flex items-center gap-3 px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
                activeChart === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-indigo-50 shadow-md'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Chart Container */}
        <div className="mb-12">
          {renderActiveChart()}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <span className="text-3xl">📋</span>
              Recent Transactions
            </h3>
            <Link
              href="/pages/transactions"
              className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition-colors duration-300 font-medium"
            >
              View All
            </Link>
          </div>

          {dashboardData.recentTransactions.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.recentTransactions.slice(0, 5).map((transaction, index) => (
                <div
                  key={transaction.id}
                  className="group bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all duration-300"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.5s ease-out forwards'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${
                        transaction.type === 'INCOME' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {transaction.type === 'INCOME' ? '💰' : '💸'}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xl font-bold ${
                            transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'INCOME' ? '+' : '-'}${transaction.amount.toLocaleString()}
                          </span>
                          <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                            {transaction.category}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-1">
                          {transaction.type} • {new Date(transaction.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-gray-400 group-hover:text-indigo-600 transition-colors duration-300">
                      →
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h4 className="text-xl font-medium text-gray-800 mb-2">No Recent Transactions</h4>
              <p className="text-gray-600 mb-6">Start tracking your finances by adding your first transaction</p>
              <Link
                href="/pages/transactions"
                className="bg-indigo-600 text-white px-8 py-3 rounded-full hover:bg-indigo-700 transition-colors duration-300 font-medium"
              >
                Add Transaction
              </Link>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow duration-300">
            <div className="text-2xl mb-2">📈</div>
            <p className="text-sm text-gray-600">Total Transactions</p>
            <p className="text-xl font-bold text-gray-800">{transactions?.length || 0}</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow duration-300">
            <div className="text-2xl mb-2">🏷️</div>
            <p className="text-sm text-gray-600">Categories Used</p>
            <p className="text-xl font-bold text-gray-800">{Object.keys(categoryExpenseMap).length}</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow duration-300">
            <div className="text-2xl mb-2">📅</div>
            <p className="text-sm text-gray-600">Active Months</p>
            <p className="text-xl font-bold text-gray-800">{monthlyChartData.length}</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow duration-300">
            <div className="text-2xl mb-2">💎</div>
            <p className="text-sm text-gray-600">Savings Rate</p>
            <p className="text-xl font-bold text-gray-800">
              {dashboardData.totalIncome > 0 
                ? `${((dashboardData.netSavings / dashboardData.totalIncome) * 100).toFixed(1)}%`
                : '0%'
              }
            </p>
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
      `}</style>
    </div>
  );
};

export default Dashboard;