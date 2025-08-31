'use client';

import Link from "next/link";
import { useState, useEffect } from "react";

export default function WelcomePage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: "📊",
      title: "Smart Dashboard",
      description: "Get real-time insights into your financial health with beautiful charts and analytics"
    },
    {
      icon: "💳",
      title: "Transaction Tracking",
      description: "Easily track all your income and expenses with automated categorization"
    },
    {
      icon: "💰",
      title: "Budget Management",
      description: "Set spending limits and receive alerts when you're approaching your budget"
    },
    {
      icon: "🎯",
      title: "Savings Goals",
      description: "Create and track progress toward your financial dreams and milestones"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 flex flex-col justify-center items-center min-h-screen px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Logo */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center transform hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-white font-bold text-3xl">F</span>
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              FinApp
            </h1>
          </div>
          
          <p className="text-2xl md:text-3xl font-medium text-gray-700 mb-4">
            Take Control of Your Financial Future
          </p>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            Transform your financial management with intelligent tracking, smart budgeting, and goal-oriented savings. 
            Build wealth, reduce stress, and achieve your dreams with our comprehensive financial platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link 
              href="/pages/signup" 
              className="group relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-4 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 font-semibold text-lg"
            >
              <span className="relative z-10 flex items-center gap-3">
                <span className="text-2xl">🚀</span>
                Get Started Free
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            
            <Link 
              href="/pages/login" 
              className="group bg-white text-indigo-600 px-10 py-4 rounded-2xl shadow-lg hover:shadow-xl border-2 border-indigo-600 hover:bg-indigo-50 transition-all duration-300 transform hover:scale-105 font-semibold text-lg"
            >
              <span className="flex items-center gap-3">
                <span className="text-2xl">🔑</span>
                Sign In
              </span>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className={`w-full max-w-6xl transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Everything You Need for Financial Success
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-200"
                style={{
                  animationDelay: `${index * 200 + 1000}ms`,
                  animation: isVisible ? 'fadeInUp 0.6s ease-out forwards' : 'none'
                }}
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-indigo-600 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className={`mt-20 text-center transition-all duration-1000 delay-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="text-4xl mb-3">🔒</div>
              <h4 className="font-bold text-gray-800 mb-2">Bank-Level Security</h4>
              <p className="text-gray-600 text-sm">Your data is protected with enterprise-grade encryption</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-4xl mb-3">📱</div>
              <h4 className="font-bold text-gray-800 mb-2">Mobile Optimized</h4>
              <p className="text-gray-600 text-sm">Access your finances anywhere, anytime on any device</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-4xl mb-3">⚡</div>
              <h4 className="font-bold text-gray-800 mb-2">Real-Time Sync</h4>
              <p className="text-gray-600 text-sm">Instant updates across all your devices and platforms</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}