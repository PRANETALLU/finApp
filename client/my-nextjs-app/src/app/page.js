'use client';

import Link from "next/link";
import { useState, useEffect } from "react";

export default function WelcomePage() {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
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
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
        
        {/* Interactive cursor glow */}
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 pointer-events-none transition-all duration-1000"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        ></div>
      </div>

      {/* Main Content Container with proper spacing */}
      <div className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className={`text-center mb-24 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Logo */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="relative group">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-2xl">
                <span className="text-white font-bold text-4xl">F</span>
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl"></div>
            </div>
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:from-purple-600 hover:to-indigo-600 transition-all duration-500">
              FinApp
            </h1>
          </div>
          
          <p className="text-2xl md:text-4xl font-medium text-gray-700 mb-6 leading-tight">
            Take Control of Your 
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> Financial Future</span>
          </p>
          <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed">
            Transform your financial management with intelligent tracking, smart budgeting, and goal-oriented savings. 
            Build wealth, reduce stress, and achieve your dreams with our comprehensive financial platform.
          </p>

          {/* Enhanced CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Link 
              href="/pages/signup" 
              className="group relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-12 py-5 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 font-semibold text-xl"
            >
              <span className="relative z-10 flex items-center gap-3">
                <span className="text-2xl group-hover:animate-bounce">🚀</span>
                Get Started Free
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </Link>
            
            <Link 
              href="/pages/login" 
              className="group bg-white/80 backdrop-blur-sm text-indigo-600 px-12 py-5 rounded-2xl shadow-xl hover:shadow-2xl border-2 border-indigo-600 hover:bg-indigo-50 transition-all duration-300 transform hover:scale-105 font-semibold text-xl"
            >
              <span className="flex items-center gap-3">
                <span className="text-2xl group-hover:rotate-12 transition-transform duration-300">🔑</span>
                Sign In
              </span>
            </Link>
          </div>

          {/* Key Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">Free</div>
              <p className="text-gray-600 font-medium">No Monthly Fees</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">Secure</div>
              <p className="text-gray-600 font-medium">Bank-Grade Protection</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">Simple</div>
              <p className="text-gray-600 font-medium">Easy to Use</p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className={`w-full max-w-6xl mx-auto transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">
            Everything You Need for Financial Success
          </h2>
          <p className="text-lg text-gray-600 text-center mb-16 max-w-3xl mx-auto">
            Our comprehensive suite of tools helps you manage every aspect of your financial life with ease and confidence.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-white/50 hover:border-indigo-200"
                style={{
                  animationDelay: `${index * 200 + 1000}ms`,
                  animation: isVisible ? 'fadeInUp 0.8s ease-out forwards' : 'none'
                }}
              >
                <div className="text-5xl mb-6 group-hover:scale-125 transition-transform duration-300 group-hover:animate-bounce">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-indigo-600 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
                
                {/* Hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-white/60 backdrop-blur-sm border-t border-gray-200/50 py-8 mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">FinApp</span>
            </div>
            <div className="flex gap-6">
              <span className="text-gray-400 text-sm">Secure • Reliable • Trusted</span>
            </div>
          </div>
          <div className="text-center md:text-left mt-4 pt-4 border-t border-gray-200/50">
            <p className="text-gray-500 text-sm">© 2025 FinApp. All rights reserved. Made with ❤️ for your financial success.</p>
          </div>
        </div>
      </footer>

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

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}