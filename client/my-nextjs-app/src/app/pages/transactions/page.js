'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '@/app/context/UserContext';
import { useRouter } from 'next/navigation';

const TransactionPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    category: '',
    description: '',
    type: 'INCOME',
    paymentMethod: '',
    status: 'pending',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'
  const { user } = useUser();
  const router = useRouter();

  const ITEMS_PER_PAGE = 10;

  const categories = [
    'SALARY', 'GROCERIES', 'UTILITIES', 'RENT', 'ENTERTAINMENT', 'TRANSPORTATION',
    'HEALTHCARE', 'INSURANCE', 'SUBSCRIPTIONS', 'LOANS', 'CREDIT_CARD_PAYMENT',
    'TRAVEL', 'EDUCATION', 'SHOPPING', 'PETS', 'GIFTS', 'TAXES', 'DINING',
    'CHARITY', 'HOUSEHOLD', 'PERSONAL_CARE', 'INVESTMENTS', 'MISC_EXPENSE'
  ];

  const paymentMethods = ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Check', 'Digital Wallet'];

  // Fetch data on mount
  useEffect(() => {
    if (user?.token && user?.id) {
      setIsLoading(true);
      Promise.all([
        axios.get(`http://localhost:8080/api/transactions/${user.id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        }),
        axios.post(`http://127.0.0.1:5000/detect-anomalies`, {
          userId: user.id,
          token: user.token,
        }),
      ])
        .then(([transactionsRes, anomaliesRes]) => {
          const sortedTransactions = (transactionsRes.data || []).sort(
            (a, b) => new Date(b.date) - new Date(a.date)
          );
          setTransactions(sortedTransactions);
          setAnomalies(anomaliesRes.data || []);
        })
        .catch((error) => {
          console.log('Error fetching data', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [user]);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!newTransaction.amount || !newTransaction.category || !newTransaction.paymentMethod) {
      setErrorMessage('All required fields must be filled.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8080/api/transactions/add', newTransaction, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setTransactions([response.data, ...transactions]);
      setNewTransaction({
        amount: '',
        category: '',
        description: '',
        type: 'INCOME',
        paymentMethod: '',
        status: 'pending',
      });
      setErrorMessage('');
      setSuccessMessage('Transaction added successfully!');
      setShowForm(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage('Failed to add transaction. Please try again.');
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    try {
      await axios.delete(`http://localhost:8080/api/transactions/delete/${transactionId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setTransactions(transactions.filter((transaction) => transaction.id !== transactionId));
      setSuccessMessage('Transaction deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
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
        { headers: { Authorization: `Bearer ${user.token}` } }
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

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);

  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  const getTransactionIcon = (type, category) => {
    if (type === 'INCOME') return '💰';
    switch (category) {
      case 'GROCERIES': return '🛒';
      case 'UTILITIES': return '💡';
      case 'RENT': return '🏠';
      case 'ENTERTAINMENT': return '🎬';
      case 'TRANSPORTATION': return '🚗';
      case 'HEALTHCARE': return '🏥';
      case 'DINING': return '🍽️';
      case 'SHOPPING': return '🛍️';
      case 'TRAVEL': return '✈️';
      default: return '💸';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'SALARY': 'bg-green-100 text-green-800',
      'GROCERIES': 'bg-orange-100 text-orange-800',
      'UTILITIES': 'bg-yellow-100 text-yellow-800',
      'RENT': 'bg-purple-100 text-purple-800',
      'ENTERTAINMENT': 'bg-pink-100 text-pink-800',
      'TRANSPORTATION': 'bg-blue-100 text-blue-800',
      'HEALTHCARE': 'bg-red-100 text-red-800',
      'DINING': 'bg-indigo-100 text-indigo-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto"></div>
          <p className="text-xl font-medium text-gray-700 animate-pulse">Loading transactions...</p>
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
            Transaction Management
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Add, edit, and track all your financial transactions in one place
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setShowForm(!showForm)}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                showForm 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              <span className="text-2xl">{showForm ? '❌' : '➕'}</span>
              {showForm ? 'Cancel' : 'Add Transaction'}
            </button>
            
            <button
              onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
              className="flex items-center gap-3 px-8 py-4 bg-white text-gray-700 rounded-2xl font-semibold hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg border border-gray-200"
            >
              <span className="text-2xl">{viewMode === 'table' ? '📋' : '🃏'}</span>
              {viewMode === 'table' ? 'Card View' : 'Table View'}
            </button>
          </div>
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

        {/* Add Transaction Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 border border-gray-200 animate-slideDown">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center flex items-center justify-center gap-3">
              <span className="text-3xl">📝</span>
              Add New Transaction
            </h2>
            
            <form onSubmit={handleAddTransaction} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 bg-gray-50 hover:bg-white transition-colors duration-300"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Type *</label>
                  <select
                    value={newTransaction.type}
                    onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value })}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 bg-gray-50 hover:bg-white transition-colors duration-300"
                  >
                    <option value="INCOME">💰 Income</option>
                    <option value="EXPENSE">💸 Expense</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Category *</label>
                  <select
                    value={newTransaction.category}
                    onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 bg-gray-50 hover:bg-white transition-colors duration-300"
                  >
                    <option value="" disabled>Select Category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Payment Method *</label>
                  <select
                    value={newTransaction.paymentMethod}
                    onChange={(e) => setNewTransaction({ ...newTransaction, paymentMethod: e.target.value })}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 bg-gray-50 hover:bg-white transition-colors duration-300"
                  >
                    <option value="" disabled>Select Payment Method</option>
                    {paymentMethods.map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Description</label>
                <textarea
                  placeholder="Add a description for this transaction..."
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 bg-gray-50 hover:bg-white transition-colors duration-300 resize-none"
                  rows="3"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105 font-semibold text-lg shadow-lg"
              >
                Add Transaction
              </button>
            </form>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <span className="text-2xl">🔍</span>
            Search & Filter
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 bg-gray-50 hover:bg-white transition-colors duration-300"
            />
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 bg-gray-50 hover:bg-white transition-colors duration-300"
            >
              <option value="all">All Types</option>
              <option value="INCOME">Income Only</option>
              <option value="EXPENSE">Expenses Only</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 bg-gray-50 hover:bg-white transition-colors duration-300"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>

            <input
              type="text"
              placeholder="Payment method..."
              value={filterPaymentMethod}
              onChange={(e) => setFilterPaymentMethod(e.target.value)}
              className="p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800 bg-gray-50 hover:bg-white transition-colors duration-300"
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Showing {paginatedTransactions.length} of {filteredTransactions.length} transactions
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">View:</span>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-colors duration-300 ${
                  viewMode === 'table' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                📋
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-lg transition-colors duration-300 ${
                  viewMode === 'cards' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                🃏
              </button>
            </div>
          </div>
        </div>

        {/* Transactions Display */}
        {viewMode === 'table' ? (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Payment</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Alert</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedTransactions.map((transaction, index) => (
                    <tr 
                      key={transaction.id} 
                      className="hover:bg-gray-50 transition-colors duration-200"
                      style={{
                        animationDelay: `${index * 50}ms`,
                        animation: 'fadeInUp 0.5s ease-out forwards'
                      }}
                    >
                      <td className="px-6 py-4 text-gray-800">
                        {new Date(transaction.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getTransactionIcon(transaction.type, transaction.category)}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(transaction.category)}`}>
                            {transaction.category.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-lg font-bold ${
                          transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'INCOME' ? '+' : '-'}${transaction.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          transaction.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-800">{transaction.paymentMethod}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleTransactionStatusChange(transaction.id, transaction.status)}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300 text-sm font-medium"
                          >
                            Toggle
                          </button>
                          <button
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-300 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {anomalies.some(anomaly => anomaly.id === transaction.id) && (
                          <span 
                            className="bg-red-100 text-red-700 px-3 py-2 text-xs rounded-full font-semibold animate-pulse cursor-help" 
                            title="Anomaly detected - This transaction appears unusual"
                          >
                            ⚠️ Anomaly
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Card View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedTransactions.map((transaction, index) => (
              <div
                key={transaction.id}
                className="group bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.5s ease-out forwards'
                }}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getTransactionIcon(transaction.type, transaction.category)}</span>
                    <span className={`text-2xl font-bold ${
                      transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'INCOME' ? '+' : '-'}${transaction.amount.toLocaleString()}
                    </span>
                  </div>
                  
                  {anomalies.some(anomaly => anomaly.id === transaction.id) && (
                    <span className="bg-red-100 text-red-700 px-2 py-1 text-xs rounded-full font-semibold animate-pulse">
                      ⚠️
                    </span>
                  )}
                </div>

                {/* Card Content */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(transaction.category)}`}>
                      {transaction.category.replace(/_/g, ' ')}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      transaction.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </div>
                  
                  <div className="text-gray-600">
                    <p className="font-medium">{transaction.paymentMethod}</p>
                    <p className="text-sm">
                      {new Date(transaction.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  {transaction.description && (
                    <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
                      {transaction.description}
                    </p>
                  )}
                </div>

                {/* Card Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleTransactionStatusChange(transaction.id, transaction.status)}
                    className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-300 text-sm font-medium"
                  >
                    Toggle Status
                  </button>
                  <button
                    onClick={() => handleDeleteTransaction(transaction.id)}
                    className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors duration-300 text-sm font-medium"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredTransactions.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-200">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Transactions Found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filterType !== 'all' || filterStatus || filterPaymentMethod
                ? 'Try adjusting your search criteria'
                : 'Start by adding your first transaction'
              }
            </p>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 transition-colors duration-300 font-medium"
              >
                Add First Transaction
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 font-medium"
            >
              <span>←</span>
              Previous
            </button>
            
            <div className="flex items-center gap-4">
              <span className="text-gray-600 font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  const isActive = page === currentPage;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg font-medium transition-all duration-300 ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-indigo-100'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 font-medium"
            >
              Next
              <span>→</span>
            </button>
          </div>
        )}

        {/* Transaction Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow duration-300 border border-gray-200">
            <div className="text-3xl mb-2">💰</div>
            <p className="text-sm text-gray-600 mb-1">Total Income</p>
            <p className="text-xl font-bold text-green-600">
              ${transactions
                .filter(t => t.type === 'INCOME')
                .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                .toLocaleString()}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow duration-300 border border-gray-200">
            <div className="text-3xl mb-2">💸</div>
            <p className="text-sm text-gray-600 mb-1">Total Expenses</p>
            <p className="text-xl font-bold text-red-600">
              ${transactions
                .filter(t => t.type === 'EXPENSE')
                .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                .toLocaleString()}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow duration-300 border border-gray-200">
            <div className="text-3xl mb-2">⏳</div>
            <p className="text-sm text-gray-600 mb-1">Pending</p>
            <p className="text-xl font-bold text-yellow-600">
              {transactions.filter(t => t.status === 'pending').length}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow duration-300 border border-gray-200">
            <div className="text-3xl mb-2">⚠️</div>
            <p className="text-sm text-gray-600 mb-1">Anomalies</p>
            <p className="text-xl font-bold text-red-600">
              {anomalies.length}
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

export default TransactionPage;