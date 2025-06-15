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
import Navbar from '@/app/components/Navbar';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [transactions, setTransactions] = useState(null);
  const [currentPredict, setCurrentPredict] = useState(null);
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

  useEffect(() => {
    if (user?.token && user?.id) {
      axios
        .get(`http://localhost:8080/api/transactions/${user?.id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        })
        .then((response) => {
          setTransactions(response.data);
        })
        .catch((error) => {
          console.error('Error fetching dashboard data:', error);
        });
    }
  }, [user]);

  useEffect(() => {
    if (user?.token && user?.id) {
      axios
        .post(`http://127.0.0.1:5000/predict-expense`, {
          userId: user.id,
          token: user.token,
        })
        .then((response) => {
          setCurrentPredict(response.data)
        })
        .catch((error) => {
          console.log('Error fetching anomalies', error);
        });
    }
  }, [user]);

  console.log(transactions)

  if (!dashboardData) {
    return <div>Loading...</div>;
  }

  // Prepare data for the pie chart
  const chartData = [
    { name: 'Income', value: parseFloat(dashboardData.totalIncome) },
    { name: 'Expense', value: parseFloat(dashboardData.totalExpense) },
  ];

  const categoryExpenseMap = {};

  if (transactions) {
    transactions.forEach((tx) => {
      if (tx.type === 'EXPENSE') {
        const category = tx.category || 'Uncategorized';
        if (!categoryExpenseMap[category]) {
          categoryExpenseMap[category] = 0;
        }
        categoryExpenseMap[category] += tx.amount;
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

  const cumulativeData = [];

  if (transactions) {
    const sorted = [...transactions].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    let balance = 0;

    for (const tx of sorted) {
      if (tx.type === 'INCOME') {
        balance += tx.amount;
      } else {
        balance -= tx.amount;
      }

      cumulativeData.push({
        date: new Date(tx.date).toLocaleDateString(),
        balance: parseFloat(balance.toFixed(2)),
      });
    }
  }

  const predicted = currentPredict?.predicted_next_3_months_expense || [];
  const previous = currentPredict?.previous_months_expense || [];

  const expensePredictionData = [
    ...previous.map((item) => ({
      month: item.month,
      amount: item.amount,
      type: "Actual"
    })),
    ...predicted.map((item) => ({
      month: item.month,
      amount: item.amount,
      type: "Predicted"
    }))
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="container mx-auto pt-28 px-6">
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

          {/* Expense Breakdown by Category */}
          <div className="flex justify-center items-center flex-col mb-20">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Expense Breakdown by Category
            </h3>
            <PieChart width={400} height={400}>
              <Pie
                data={categoryChartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={130}
                label
              >
                {categoryChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      [
                        '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BD4', '#FF6384', '#36A2EB'
                      ][index % 7]
                    }
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              Monthly Income vs Expense
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="income" fill="#00C49F" />
                <Bar dataKey="expense" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              Savings Contributions Over Time
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={savingsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Cumulative Balance Over Time */}
          <div className="flex justify-center items-center flex-col mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Cumulative Balance Over Time
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={cumulativeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="balance" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {expensePredictionData.length > 0 && (
            <div className="flex justify-center items-center flex-col mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Expense Forecast</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={expensePredictionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />

                  {/* Single connected line */}
                  <Line
                    type="monotone"
                    dataKey="amount"
                    name="Combined"
                    stroke="#a3a3a3"
                    strokeWidth={2}
                    dot={false}
                    connectNulls={true}
                    isAnimationActive={false}
                  />

                  {/* Actual: overlay dots only */}
                  <Line
                    type="monotone"
                    dataKey={(d) => (d.type === "Actual" ? d.amount : null)}
                    name="Actual"
                    stroke="#34d399"
                    strokeWidth={3}
                    dot={{ r: 4, stroke: "#34d399", strokeWidth: 2, fill: "white" }}
                    connectNulls={false}
                    legendType="circle"
                  />

                  {/* Predicted: overlay dashed line & dots */}
                  <Line
                    type="monotone"
                    dataKey={(d) => (d.type === "Predicted" ? d.amount : null)}
                    name="Predicted"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={{ r: 4, stroke: "#8b5cf6", strokeWidth: 2, fill: "white" }}
                    connectNulls={false}
                    legendType="line"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}


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
