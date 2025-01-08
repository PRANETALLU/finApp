'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '@/app/context/UserContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/app/components/Navbar'; // Import the Navbar component

const TransactionPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    category: '',
    description: '',
    type: 'INCOME',
    paymentMethod: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const { user } = useUser();
  const router = useRouter();

  const ITEMS_PER_PAGE = 10;

  // Fetch user transactions with pagination
  useEffect(() => {
    if (user?.token && user?.id) {
      axios
        .get(`http://localhost:8080/api/transactions/${user.id}?page=${page}&size=${ITEMS_PER_PAGE}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        })
        .then((response) => {
          setTransactions(response.data.transactions);
        })
        .catch((error) => {
          console.log('Error fetching transactions', error);
        });
    }
  }, [user, page]);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!newTransaction.amount || !newTransaction.category || !newTransaction.paymentMethod) {
      setErrorMessage('All fields are required.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8080/api/transactions/add', newTransaction, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      setTransactions([response.data, ...transactions]); // Add new transaction to the list
      setNewTransaction({
        amount: '',
        category: '',
        description: '',
        type: 'INCOME',
        paymentMethod: '',
      });
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Failed to add transaction.');
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    try {
      await axios.delete(`http://localhost:8080/api/transactions/delete/${transactionId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      setTransactions(transactions.filter((transaction) => transaction.id !== transactionId));
    } catch (error) {
      console.log('Error deleting transaction', error);
    }
  };

  const handleTransactionStatusChange = async (transactionId, currentStatus) => {
    const updatedStatus = currentStatus === 'pending' ? 'completed' : 'pending';

    try {
      await axios.patch(
        `http://localhost:8080/api/transactions/changeStatus/${transactionId}`,
        { status: updatedStatus },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      setTransactions(
        transactions.map((transaction) =>
          transaction.id === transactionId ? { ...transaction, status: updatedStatus } : transaction
        )
      );
    } catch (error) {
      console.log('Error updating transaction status', error);
    }
  };

  const filteredTransactions = (transactions || []).filter((transaction) => {
    const matchesSearch =
      transaction.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.amount.toString().includes(searchQuery);
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesPaymentMethod = filterPaymentMethod === '' || transaction.paymentMethod === filterPaymentMethod;
    const matchesStatus = filterStatus === '' || transaction.status === filterStatus;
  
    return matchesSearch && matchesType && matchesPaymentMethod && matchesStatus;
  });
  

  const handleNextPage = () => setPage(page + 1);
  const handlePrevPage = () => setPage(page - 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-500 text-white flex flex-col justify-center items-center py-8">
      {/* Navbar Component */}
      <Navbar />

      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl mt-8">
        <h1 className="text-3xl font-semibold mb-6 text-gray-800 text-center">Transactions</h1>

        {/* Error Message */}
        {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}

        {/* Add Transaction Form */}
        <form onSubmit={handleAddTransaction} className="space-y-4">
          <div className="flex space-x-4">
            <input
              type="number"
              placeholder="Amount"
              value={newTransaction.amount}
              onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
            <select
              value={newTransaction.type}
              onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value })}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            >
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </div>
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="Category"
              value={newTransaction.category}
              onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
            <input
              type="text"
              placeholder="Payment Method"
              value={newTransaction.paymentMethod}
              onChange={(e) => setNewTransaction({ ...newTransaction, paymentMethod: e.target.value })}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
          </div>
          <textarea
            placeholder="Description"
            value={newTransaction.description}
            onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            rows="4"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 focus:outline-none"
          >
            Add Transaction
          </button>
        </form>

        {/* Search and Filter */}
        <div className="mt-8 flex space-x-4 mb-6">
          <input
            type="text"
            placeholder="Search transactions"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
          >
            <option value="all">All Types</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
          <input
            type="text"
            placeholder="Payment Method"
            value={filterPaymentMethod}
            onChange={(e) => setFilterPaymentMethod(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
          />
        </div>

        {/* Transaction Table */}
        <table className="min-w-full bg-white border rounded-lg shadow-lg">
          <thead>
            <tr>
              <th className="px-6 py-3 bg-gray-200 text-left text-sm font-medium text-gray-600">Date</th>
              <th className="px-6 py-3 bg-gray-200 text-left text-sm font-medium text-gray-600">Category</th>
              <th className="px-6 py-3 bg-gray-200 text-left text-sm font-medium text-gray-600">Amount</th>
              <th className="px-6 py-3 bg-gray-200 text-left text-sm font-medium text-gray-600">Status</th>
              <th className="px-6 py-3 bg-gray-200 text-left text-sm font-medium text-gray-600">Payment Method</th>
              <th className="px-6 py-3 bg-gray-200 text-left text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="px-6 py-4">{transaction.date}</td>
                <td className="px-6 py-4">{transaction.category}</td>
                <td className="px-6 py-4">{transaction.amount}</td>
                <td
                  className={`px-6 py-4 ${
                    transaction.status === 'pending' ? 'bg-yellow-300' : 'bg-green-300'
                  }`}
                >
                  {transaction.status}
                </td>
                <td className="px-6 py-4">{transaction.paymentMethod}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleTransactionStatusChange(transaction.id, transaction.status)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                  >
                    Toggle Status
                  </button>
                  <button
                    onClick={() => handleDeleteTransaction(transaction.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 ml-2"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={handlePrevPage}
            disabled={page <= 1}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg disabled:bg-gray-400"
          >
            Previous
          </button>
          <button
            onClick={handleNextPage}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionPage;
