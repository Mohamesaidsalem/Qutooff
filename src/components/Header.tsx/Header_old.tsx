import React, { useState } from 'react';
import { LogIn, LogOut, DollarSign, Calendar, Shield, Settings, ChevronDown } from 'lucide-react';

const Header: React.FC = () => {
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);

  // محاكاة مستخدم إداري لاختبار القائمة المنسدلة
  const user = {
    name: 'أحمد محمد',
    role: 'admin'
  };

  const handleDropdownItemClick = (action: string) => {
    setShowOptionsDropdown(false);
    console.log(`تم النقر على: ${action}`);
    alert(`تم النقر على: ${action}`);
  };

  const getUserRoleText = (role: string) => {
    switch (role) {
      case 'parent': return 'Parent';
      case 'teacher': return 'Teacher';
      case 'student': return 'Student';
      case 'admin': return 'Admin';
      case 'super_admin': return 'Super Admin';
      default: return '';
    }
  };

  const getUserRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'text-red-600 bg-red-50';
      case 'admin': return 'text-purple-600 bg-purple-50';
      case 'teacher': return 'text-blue-600 bg-blue-50';
      case 'parent': return 'text-green-600 bg-green-50';
      case 'student': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <div className="text-2xl font-bold text-emerald-600">
              Quraan Academy
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <div className="text-gray-600 hover:text-emerald-600 font-medium transition-colors cursor-pointer">
              Courses
            </div>
            <div className="text-gray-600 hover:text-emerald-600 font-medium transition-colors cursor-pointer">
              Why Us
            </div>
            <div className="text-gray-600 hover:text-emerald-600 font-medium transition-colors cursor-pointer">
              Reviews
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-3">
                {(user.role === 'parent' || user.role === 'student' || user.role === 'teacher') && (
                  <>
                    <div className="text-gray-600 hover:text-emerald-600 font-medium transition-colors flex items-center cursor-pointer">
                      <Calendar className="h-4 w-4 mr-1" /> My Classes
                    </div>
                    <div className="text-gray-600 hover:text-emerald-600 font-medium transition-colors flex items-center cursor-pointer">
                      <DollarSign className="h-4 w-4 mr-1" /> Payments
                    </div>
                  </>
                )}
                
                {(user.role === 'admin' || user.role === 'super_admin') && (
                  <div className="flex items-center space-x-4">
                    <div className="text-gray-600 hover:text-blue-600 font-medium transition-colors flex items-center cursor-pointer">
                      <Settings className="h-4 w-4 mr-1" /> System
                    </div>
                    
                    {/* Options Dropdown */}
                    <div 
                      className="relative"
                      onMouseEnter={() => setShowOptionsDropdown(true)}
                      onMouseLeave={() => setShowOptionsDropdown(false)}
                    >
                      <button className="text-gray-600 hover:text-blue-600 font-medium transition-colors flex items-center">
                        Options
                        <ChevronDown className="h-4 w-4 ml-1" />
                      </button>
                      
                      {showOptionsDropdown && (
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-gray-900 text-white rounded-lg shadow-xl z-50 p-6 min-w-[800px] animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="grid grid-cols-4 gap-8">
                            {/* Invoice Section */}
                            <div className="flex flex-col min-w-[160px]">
                              <h3 className="text-sm font-semibold text-white mb-3 pb-2 border-b border-gray-700 uppercase tracking-wide">
                                Invoice Section
                              </h3>
                              <button 
                                onClick={() => handleDropdownItemClick('Invoice Details')} 
                                className="block text-sm py-2 px-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-all duration-200 ease-in-out text-left"
                              >
                                Invoice Details
                              </button>
                              <button 
                                onClick={() => handleDropdownItemClick('Send Monthly Invoice')} 
                                className="block text-sm py-2 px-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-all duration-200 ease-in-out text-left"
                              >
                                Send Monthly Invoice
                              </button>
                              <button 
                                onClick={() => handleDropdownItemClick('Generate Monthly Salary')} 
                                className="block text-sm py-2 px-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-all duration-200 ease-in-out text-left"
                              >
                                Generate Monthly Salary
                              </button>
                              <button 
                                onClick={() => handleDropdownItemClick('Test Reports')} 
                                className="block text-sm py-2 px-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-all duration-200 ease-in-out text-left"
                              >
                                Test Reports
                              </button>
                              <button 
                                onClick={() => handleDropdownItemClick('Rules')} 
                                className="block text-sm py-2 px-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-all duration-200 ease-in-out flex items-center gap-2 text-left"
                              >
                                <span>Rules</span>
                                <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">New</span>
                              </button>
                            </div>

                            {/* Weekly Classes */}
                            <div className="flex flex-col min-w-[160px]">
                              <h3 className="text-sm font-semibold text-white mb-3 pb-2 border-b border-gray-700 uppercase tracking-wide">
                                Weekly Classes
                              </h3>
                              <button 
                                onClick={() => handleDropdownItemClick('Create Weekly Classes')} 
                                className="block text-sm py-2 px-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-all duration-200 ease-in-out text-left"
                              >
                                Create Weekly Classes
                              </button>
                              <button 
                                onClick={() => handleDropdownItemClick('Update Weekly Classes')} 
                                className="block text-sm py-2 px-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-all duration-200 ease-in-out text-left"
                              >
                                Update Weekly Classes
                              </button>
                              <button 
                                onClick={() => handleDropdownItemClick('Schedule Advance Class')} 
                                className="block text-sm py-2 px-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-all duration-200 ease-in-out text-left"
                              >
                                Schedule Advance Class
                              </button>
                              <button 
                                onClick={() => handleDropdownItemClick('Public Holidays')} 
                                className="block text-sm py-2 px-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-all duration-200 ease-in-out text-left"
                              >
                                Public Holidays
                              </button>
                              <button 
                                onClick={() => handleDropdownItemClick('Salary Class Report')} 
                                className="block text-sm py-2 px-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-all duration-200 ease-in-out text-left"
                              >
                                Salary Class Report
                              </button>
                              <button 
                                onClick={() => handleDropdownItemClick('Daily Class Report')} 
                                className="block text-sm py-2 px-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-all duration-200 ease-in-out text-left"
                              >
                                Daily Class Report
                              </button>
                            </div>

                            {/* Add Options */}
                            <div className="flex flex-col min-w-[160px]">
                              <h3 className="text-sm font-semibold text-white mb-3 pb-2 border-b border-gray-700 uppercase tracking-wide">
                                Add Options
                              </h3>
                              <button 
                                onClick={() => handleDropdownItemClick('Add New Employee')} 
                                className="block text-sm py-2 px-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-all duration-200 ease-in-out text-left"
                              >
                                Add New Employee
                              </button>
                              <button 
                                onClick={() => handleDropdownItemClick('Add New Family')} 
                                className="block text-sm py-2 px-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-all duration-200 ease-in-out text-left"
                              >
                                Add New Family
                              </button>
                              <button 
                                onClick={() => handleDropdownItemClick('Add New Country')} 
                                className="block text-sm py-2 px-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-all duration-200 ease-in-out text-left"
                              >
                                Add New Country
                              </button>
                              <button 
                                onClick={() => handleDropdownItemClick('Add New Task')} 
                                className="block text-sm py-2 px-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-all duration-200 ease-in-out text-left"
                              >
                                Add New Task
                              </button>
                              <button 
                                onClick={() => handleDropdownItemClick('Add New Vendor')} 
                                className="block text-sm py-2 px-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-all duration-200 ease-in-out text-left"
                              >
                                Add New Vendor
                              </button>
                              <button 
                                onClick={() => handleDropdownItemClick('Add New Year')} 
                                className="block text-sm py-2 px-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-all duration-200 ease-in-out text-left"
                              >
                                Add New Year
                              </button>
                            </div>

                            {/* Other Options */}
                            <div className="flex flex-col min-w-[160px]">
                              <h3 className="text-sm font-semibold text-white mb-3 pb-2 border-b border-gray-700 uppercase tracking-wide">
                                Other Options
                              </h3>
                              <button 
                                onClick={() => handleDropdownItemClick('New Requests')} 
                                className="block text-sm py-2 px-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-all duration-200 ease-in-out text-left"
                              >
                                New Requests
                              </button>
                              <button 
                                onClick={() => handleDropdownItemClick('See Test Status')} 
                                className="block text-sm py-2 px-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-all duration-200 ease-in-out text-left"
                              >
                                See Test Status
                              </button>
                              <button 
                                onClick={() => handleDropdownItemClick('List of Country')} 
                                className="block text-sm py-2 px-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-all duration-200 ease-in-out text-left"
                              >
                                List of Country
                              </button>
                              <button 
                                onClick={() => handleDropdownItemClick('SMS Services')} 
                                className="block text-sm py-2 px-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-all duration-200 ease-in-out text-left"
                              >
                                SMS Services
                              </button>
                              <button 
                                onClick={() => handleDropdownItemClick('Complaints')} 
                                className="block text-sm py-2 px-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-all duration-200 ease-in-out text-left"
                              >
                                Complaints
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <span className={`text-sm font-bold px-2 py-1 rounded-full ${getUserRoleColor(user.role)}`}>
                      {user.role === 'super_admin' && <Shield className="h-3 w-3 inline mr-1" />}
                      {getUserRoleText(user.role)}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">{user.name}</div>
                  </div>
                </div>
                
                <button className="bg-red-500 text-white px-4 py-2 rounded-md font-medium text-sm flex items-center hover:bg-red-600 transition-colors">
                  <LogOut className="h-4 w-4 mr-1" /> Sign Out
                </button>
              </div>
            )}
            
            {!user && (
              <div className="flex items-center space-x-4">
                <button className="bg-yellow-500 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-yellow-600 transition-colors">
                  Get Free Trial
                </button>
                <button className="bg-emerald-600 text-white px-4 py-2 rounded-md font-medium text-sm flex items-center hover:bg-emerald-700 transition-colors">
                  <LogIn className="h-4 w-4 mr-1" /> Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;