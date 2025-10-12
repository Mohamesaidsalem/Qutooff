import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, LogOut, DollarSign, Calendar, Shield, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ref, push, set } from 'firebase/database';
import { database } from '../../firebase/config';

// Import Add Options Modals
import AddEmployeeModal from '../Modals/AddEmployeeModal';
import AddFamilyModal from '../Modals/AddFamilyModal';
import AddCountryModal from '../Modals/AddCountryModal';
import AddTaskModal from '../Modals/AddTaskModal';
import AddVendorModal from '../Modals/AddVendorModal';
import AddYearModal from '../Modals/AddYearModal';

// Import Invoice Section Modals
import InvoiceDetailsModal from '../Modals/Invoice Section/InvoiceDetailsModal';
import SendMonthlyInvoiceModal from '../Modals/Invoice Section/SendMonthlyInvoiceModal';
import GenerateMonthlySalaryModal from '../Modals/Invoice Section/GenerateMonthlySalaryModal';
import TestReportsModal from '../Modals/Invoice Section/TestReportsModal';
import RulesModal from '../Modals/Invoice Section/RulesModal';

// Import Other Options Modals
import NewRequestsModal from '../Modals/Other Options/NewRequestsModal';
import SeeTestStatusModal from '../Modals/Other Options/SeeTestStatusModal';
import ListOfCountryModal from '../Modals/Other Options/ListOfCountryModal';
import SMSServicesModal from '../Modals/Other Options/SMSServicesModal';
import ComplaintsModal from '../Modals/Other Options/ComplaintsModal';

interface HeaderProps {
  onShowLogin: () => void;
}

const Header: React.FC<HeaderProps> = ({ onShowLogin }) => {
  const navigate = useNavigate();
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
  const [dropdownTimeoutId, setDropdownTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const { user, logout } = useAuth();

  // Add Options Modal states
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);

  // Invoice Section Modal states
  const [showInvoiceDetailsModal, setShowInvoiceDetailsModal] = useState(false);
  const [showSendMonthlyInvoiceModal, setShowSendMonthlyInvoiceModal] = useState(false);
  const [showGenerateMonthlySalaryModal, setShowGenerateMonthlySalaryModal] = useState(false);
  const [showTestReportsModal, setShowTestReportsModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);

  // Other Options Modal states
  const [showNewRequestsModal, setShowNewRequestsModal] = useState(false);
  const [showSeeTestStatusModal, setShowSeeTestStatusModal] = useState(false);
  const [showListOfCountryModal, setShowListOfCountryModal] = useState(false);
  const [showSMSServicesModal, setShowSMSServicesModal] = useState(false);
  const [showComplaintsModal, setShowComplaintsModal] = useState(false);

  const handleSignOut = async () => {
    await logout();
  };

  const handleMouseEnterDropdown = () => {
    if (dropdownTimeoutId) {
      clearTimeout(dropdownTimeoutId);
      setDropdownTimeoutId(null);
    }
    setShowOptionsDropdown(true);
  };

  const handleMouseLeaveDropdown = () => {
    const timeoutId = setTimeout(() => {
      setShowOptionsDropdown(false);
    }, 300);
    setDropdownTimeoutId(timeoutId);
  };

  const handleDropdownItemClick = (action: string) => {
    setShowOptionsDropdown(false);
    
    switch(action) {
      // Invoice Section Actions
      case 'Invoice Details':
        setShowInvoiceDetailsModal(true);
        break;
      case 'Send Monthly Invoice':
        setShowSendMonthlyInvoiceModal(true);
        break;
      case 'Generate Monthly Salary':
        setShowGenerateMonthlySalaryModal(true);
        break;
      case 'Test Reports':
        setShowTestReportsModal(true);
        break;
      case 'Rules':
        setShowRulesModal(true);
        break;

      // Weekly Classes Navigation
      case 'Create Weekly Classes':
      case 'Update Weekly Classes':
        navigate('/weekly-classes');
        break;
      case 'Schedule Advance Class':
        navigate('/advance-classes');
        break;
      case 'Public Holidays':
        navigate('/public-holidays');
        break;
      case 'Salary Class Report':
        navigate('/salary-report');
        break;
      case 'Daily Class Report':
        navigate('/daily-report');
        break;
      
      // Add Options Modal Actions
      case 'Add New Employee':
        setShowEmployeeModal(true);
        break;
      case 'Add New Family':
        setShowFamilyModal(true);
        break;
      case 'Add New Country':
        setShowCountryModal(true);
        break;
      case 'Add New Task':
        setShowTaskModal(true);
        break;
      case 'Add New Vendor':
        setShowVendorModal(true);
        break;
      case 'Add New Year':
        setShowYearModal(true);
        break;
      
      // Other Options Modal Actions
      case 'New Requests':
        setShowNewRequestsModal(true);
        break;
      case 'See Test Status':
        setShowSeeTestStatusModal(true);
        break;
      case 'List of Country':
        setShowListOfCountryModal(true);
        break;
      case 'SMS Services':
        setShowSMSServicesModal(true);
        break;
      case 'Complaints':
        setShowComplaintsModal(true);
        break;
      
      default:
        console.log(`Clicked: ${action}`);
        alert(`Feature: ${action} - Coming soon!`);
    }
  };

  // Firebase handlers for Add Options modals
  const handleAddEmployee = async (employeeData: any) => {
    try {
      const employeesRef = ref(database, 'employees');
      const newEmployeeRef = push(employeesRef);
      await set(newEmployeeRef, employeeData);
      alert('Employee added successfully!');
    } catch (error) {
      console.error('Error adding employee:', error);
      alert('Failed to add employee. Please try again.');
    }
  };

  const handleAddFamily = async (familyData: any) => {
    try {
      const familiesRef = ref(database, 'families');
      const newFamilyRef = push(familiesRef);
      await set(newFamilyRef, familyData);
      alert('Family added successfully!');
    } catch (error) {
      console.error('Error adding family:', error);
      alert('Failed to add family. Please try again.');
    }
  };

  const handleAddCountry = async (countryData: any) => {
    try {
      const countriesRef = ref(database, 'countries');
      const newCountryRef = push(countriesRef);
      await set(newCountryRef, countryData);
      alert('Country added successfully!');
    } catch (error) {
      console.error('Error adding country:', error);
      alert('Failed to add country. Please try again.');
    }
  };

  const handleAddTask = async (taskData: any) => {
    try {
      const tasksRef = ref(database, 'tasks');
      const newTaskRef = push(tasksRef);
      await set(newTaskRef, taskData);
      alert('Task added successfully!');
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Failed to add task. Please try again.');
    }
  };

  const handleAddVendor = async (vendorData: any) => {
    try {
      const vendorsRef = ref(database, 'vendors');
      const newVendorRef = push(vendorsRef);
      await set(newVendorRef, vendorData);
      alert('Vendor added successfully!');
    } catch (error) {
      console.error('Error adding vendor:', error);
      alert('Failed to add vendor. Please try again.');
    }
  };

  const handleAddYear = async (yearData: any) => {
    try {
      const yearsRef = ref(database, 'academicYears');
      const newYearRef = push(yearsRef);
      await set(newYearRef, yearData);
      alert('Academic Year added successfully!');
    } catch (error) {
      console.error('Error adding year:', error);
      alert('Failed to add year. Please try again.');
    }
  };

  // Firebase handlers for Invoice Section modals
  const handleSendInvoice = async (invoiceData: any) => {
    try {
      const invoicesRef = ref(database, 'invoices');
      const newInvoiceRef = push(invoicesRef);
      await set(newInvoiceRef, invoiceData);
    } catch (error) {
      console.error('Error sending invoice:', error);
      throw error;
    }
  };

  const handleGenerateSalary = async (salaryData: any) => {
    try {
      const salariesRef = ref(database, 'salaries');
      const newSalaryRef = push(salariesRef);
      await set(newSalaryRef, salaryData);
    } catch (error) {
      console.error('Error generating salary:', error);
      throw error;
    }
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
    <>
      <header className="bg-emerald-900 shadow-sm sticky top-0 z-40 border-b border-emerald-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div 
              className="flex-shrink-0 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                Quraan Academy
              </div>
            </div>

            {!user && (
              <div className="hidden md:flex items-center space-x-6">
                <div className="font-medium transition-colors cursor-pointer hover:bg-emerald-800 px-3 py-1 rounded-md" style={{ color: "#FFD700" }}>
                  Courses
                </div>
                <div className="font-medium transition-colors cursor-pointer hover:bg-emerald-800 px-3 py-1 rounded-md" style={{ color: "#FFD700" }}>
                  Why Us
                </div>
                <div className="font-medium transition-colors cursor-pointer hover:bg-emerald-800 px-3 py-1 rounded-md" style={{ color: "#FFD700" }}>
                  Reviews
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-3">
                  {(user.role === 'parent' || user.role === 'student' || user.role === 'teacher') && (
                    <>
                      <div className="font-medium transition-colors flex items-center cursor-pointer hover:bg-emerald-800 px-3 py-1 rounded-md" style={{ color: "#FFD700" }}>
                        <Calendar className="h-4 w-4 mr-1" /> My Classes
                      </div>
                      <div className="font-medium transition-colors flex items-center cursor-pointer hover:bg-emerald-800 px-3 py-1 rounded-md" style={{ color: "#FFD700" }}>
                        <DollarSign className="h-4 w-4 mr-1" /> Payments
                      </div>
                    </>
                  )}
                  
                  {(user.role === 'admin' || (user.role as string) === 'super_admin') && (
                    <div className="flex items-center space-x-4">
                      <div className="font-medium transition-colors flex items-center cursor-pointer hover:bg-emerald-800 px-3 py-1 rounded-md" style={{ color: "#FFD700" }}>
                        <Settings className="h-4 w-4 mr-1" /> System
                      </div>

                      {/* Options Dropdown */}
                      <div
                        className="relative group"
                        onMouseEnter={handleMouseEnterDropdown}
                        onMouseLeave={handleMouseLeaveDropdown}
                      >
                        <button className="font-medium transition-colors flex items-center hover:bg-emerald-800 px-3 py-1 rounded-md" style={{ color: "#FFD700" }}>
                          Options
                          <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${showOptionsDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {showOptionsDropdown && (
                          <div
                            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 rounded-lg shadow-2xl z-50 p-6 min-w-[800px] animate-in fade-in slide-in-from-top-2 duration-200"
                            style={{ backgroundColor: "#064E3B", border: "2px solid #FFD700" }}
                            onMouseEnter={handleMouseEnterDropdown}
                            onMouseLeave={handleMouseLeaveDropdown}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="grid grid-cols-4 gap-8">
                              {/* Invoice Section */}
                              <div className="flex flex-col min-w-[160px]">
                                <h3 className="text-sm font-semibold mb-3 pb-2 uppercase tracking-wide" style={{ color: "#FFD700", borderBottom: "1px solid #FFD700" }}>
                                  Invoice Section
                                </h3>
                                <button
                                  onClick={() => handleDropdownItemClick('Invoice Details')}
                                  className="block text-sm py-2 px-2 rounded-md transition-all duration-200 ease-in-out text-left hover:bg-emerald-800"
                                  style={{ color: "#D1D5DB" }}
                                >
                                  Invoice Details
                                </button>
                                <button
                                  onClick={() => handleDropdownItemClick('Send Monthly Invoice')}
                                  className="block text-sm py-2 px-2 rounded-md transition-all duration-200 ease-in-out text-left hover:bg-emerald-800"
                                  style={{ color: "#D1D5DB" }}
                                >
                                  Send Monthly Invoice
                                </button>
                                <button
                                  onClick={() => handleDropdownItemClick('Generate Monthly Salary')}
                                  className="block text-sm py-2 px-2 rounded-md transition-all duration-200 ease-in-out text-left hover:bg-emerald-800"
                                  style={{ color: "#D1D5DB" }}
                                >
                                  Generate Monthly Salary
                                </button>
                                <button
                                  onClick={() => handleDropdownItemClick('Test Reports')}
                                  className="block text-sm py-2 px-2 rounded-md transition-all duration-200 ease-in-out text-left hover:bg-emerald-800"
                                  style={{ color: "#D1D5DB" }}
                                >
                                  Test Reports
                                </button>
                                <button
                                  onClick={() => handleDropdownItemClick('Rules')}
                                  className="block text-sm py-2 px-2 rounded-md transition-all duration-200 ease-in-out flex items-center gap-2 text-left hover:bg-emerald-800"
                                  style={{ color: "#D1D5DB" }}
                                >
                                  <span>Rules</span>
                                  <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">New</span>
                                </button>
                              </div>

                              {/* Weekly Classes */}
                              <div className="flex flex-col min-w-[160px]">
                                <h3 className="text-sm font-semibold mb-3 pb-2 uppercase tracking-wide" style={{ color: "#FFD700", borderBottom: "1px solid #FFD700" }}>
                                  Weekly Classes
                                </h3>
                                <button
                                  onClick={() => handleDropdownItemClick('Create Weekly Classes')}
                                  className="block text-sm py-2 px-2 rounded-md transition-all duration-200 ease-in-out text-left hover:bg-emerald-800"
                                  style={{ color: "#D1D5DB" }}
                                >
                                  Create Weekly Classes
                                </button>
                                <button
                                  onClick={() => handleDropdownItemClick('Update Weekly Classes')}
                                  className="block text-sm py-2 px-2 rounded-md transition-all duration-200 ease-in-out text-left hover:bg-emerald-800"
                                  style={{ color: "#D1D5DB" }}
                                >
                                  Update Weekly Classes
                                </button>
                                <button
                                  onClick={() => handleDropdownItemClick('Schedule Advance Class')}
                                  className="block text-sm py-2 px-2 rounded-md transition-all duration-200 ease-in-out text-left hover:bg-emerald-800"
                                  style={{ color: "#D1D5DB" }}
                                >
                                  Schedule Advance Class
                                </button>
                                <button
                                  onClick={() => handleDropdownItemClick('Public Holidays')}
                                  className="block text-sm py-2 px-2 rounded-md transition-all duration-200 ease-in-out text-left hover:bg-emerald-800"
                                  style={{ color: "#D1D5DB" }}
                                >
                                  Public Holidays
                                </button>
                                <button
                                  onClick={() => handleDropdownItemClick('Salary Class Report')}
                                  className="block text-sm py-2 px-2 rounded-md transition-all duration-200 ease-in-out text-left hover:bg-emerald-800"
                                  style={{ color: "#D1D5DB" }}
                                >
                                  Salary Class Report
                                </button>
                                <button
                                  onClick={() => handleDropdownItemClick('Daily Class Report')}
                                  className="block text-sm py-2 px-2 rounded-md transition-all duration-200 ease-in-out text-left hover:bg-emerald-800"
                                  style={{ color: "#D1D5DB" }}
                                >
                                  Daily Class Report
                                </button>
                              </div>

                              {/* Add Options */}
                              <div className="flex flex-col min-w-[160px]">
                                <h3 className="text-sm font-semibold mb-3 pb-2 uppercase tracking-wide" style={{ color: "#FFD700", borderBottom: "1px solid #FFD700" }}>
                                  Add Options
                                </h3>
                                <button
                                  onClick={() => handleDropdownItemClick('Add New Employee')}
                                  className="block text-sm py-2 px-2 rounded-md transition-all duration-200 ease-in-out text-left hover:bg-emerald-800"
                                  style={{ color: "#D1D5DB" }}
                                >
                                  Add New Employee
                                </button>
                                <button
                                  onClick={() => handleDropdownItemClick('Add New Family')}
                                  className="block text-sm py-2 px-2 rounded-md transition-all duration-200 ease-in-out text-left hover:bg-emerald-800"
                                  style={{ color: "#D1D5DB" }}
                                >
                                  Add New Family
                                </button>
                                <button
                                  onClick={() => handleDropdownItemClick('Add New Country')}
                                  className="block text-sm py-2 px-2 rounded-md transition-all duration-200 ease-in-out text-left hover:bg-emerald-800"
                                  style={{ color: "#D1D5DB" }}
                                >
                                  Add New Country
                                </button>
                                <button
                                  onClick={() => handleDropdownItemClick('Add New Task')}
                                  className="block text-sm py-2 px-2 rounded-md transition-all duration-200 ease-in-out text-left hover:bg-emerald-800"
                                  style={{ color: "#D1D5DB" }}
                                >
                                  Add New Task
                                </button>
                                <button
                                  onClick={() => handleDropdownItemClick('Add New Vendor')}
                                  className="block text-sm py-2 px-2 rounded-md transition-all duration-200 ease-in-out text-left hover:bg-emerald-800"
                                  style={{ color: "#D1D5DB" }}
                                >
                                  Add New Vendor
                                </button>
                                <button
                                  onClick={() => handleDropdownItemClick('Add New Year')}
                                  className="block text-sm py-2 px-2 rounded-md transition-all duration-200 ease-in-out text-left hover:bg-emerald-800"
                                  style={{ color: "#D1D5DB" }}
                                >
                                  Add New Year
                                </button>
                              </div>

                              {/* Other Options */}
                              <div className="flex flex-col min-w-[160px]">
                                <h3 className="text-sm font-semibold mb-3 pb-2 uppercase tracking-wide" style={{ color: "#FFD700", borderBottom: "1px solid #FFD700" }}>
                                  Other Options
                                </h3>
                                <button
                                  onClick={() => handleDropdownItemClick('New Requests')}
                                  className="block text-sm py-2 px-2 rounded-md transition-all duration-200 ease-in-out text-left hover:bg-emerald-800"
                                  style={{ color: "#D1D5DB" }}
                                >
                                  New Requests
                                </button>
                                <button
                                  onClick={() => handleDropdownItemClick('See Test Status')}
                                  className="block text-sm py-2 px-2 rounded-md transition-all duration-200 ease-in-out text-left hover:bg-emerald-800"
                                  style={{ color: "#D1D5DB" }}
                                >
                                  See Test Status
                                </button>
                                <button
                                  onClick={() => handleDropdownItemClick('List of Country')}
                                  className="block text-sm py-2 px-2 rounded-md transition-all duration-200 ease-in-out text-left hover:bg-emerald-800"
                                  style={{ color: "#D1D5DB" }}
                                >
                                  List of Country
                                </button>
                                <button
                                  onClick={() => handleDropdownItemClick('SMS Services')}
                                  className="block text-sm py-2 px-2 rounded-md transition-all duration-200 ease-in-out text-left hover:bg-emerald-800"
                                  style={{ color: "#D1D5DB" }}
                                >
                                  SMS Services
                                </button>
                                <button
                                  onClick={() => handleDropdownItemClick('Complaints')}
                                  className="block text-sm py-2 px-2 rounded-md transition-all duration-200 ease-in-out text-left hover:bg-emerald-800"
                                  style={{ color: "#D1D5DB" }}
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
                        {(user.role as string) === 'super_admin' && <Shield className="h-3 w-3 inline mr-1" />}
                        {getUserRoleText(user.role)}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">{user.name}</div>
                    </div>
                  </div>
                  
                  <button onClick={handleSignOut} className="px-4 py-2 rounded-full font-semibold text-sm flex items-center transition-colors shadow-md hover:opacity-90" style={{ backgroundColor: "#FFD700", color: "#064E3B" }}>
                    <LogOut className="h-4 w-4 mr-1" /> Sign Out
                  </button>
                </div>
              )}
              
              {!user && (
                <div className="flex items-center space-x-4">
                  <button className="px-4 py-2 rounded-full font-semibold text-sm transition-colors shadow-md hover:opacity-90" style={{ backgroundColor: "#FFD700", color: "#064E3B" }}>
                    Get Free Trial
                  </button>
                  <button onClick={onShowLogin} className="px-4 py-2 rounded-full font-semibold text-sm flex items-center transition-colors shadow-md hover:opacity-90" style={{ backgroundColor: "#FFD700", color: "#064E3B" }}>
                    <LogIn className="h-4 w-4 mr-1" /> Sign In
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Add Options Modals */}
      <AddEmployeeModal 
        isOpen={showEmployeeModal} 
        onClose={() => setShowEmployeeModal(false)}
        onSubmit={handleAddEmployee}
      />
      <AddFamilyModal 
        isOpen={showFamilyModal} 
        onClose={() => setShowFamilyModal(false)}
        onSubmit={handleAddFamily}
      />
      <AddCountryModal 
        isOpen={showCountryModal} 
        onClose={() => setShowCountryModal(false)}
        onSubmit={handleAddCountry}
      />
      <AddTaskModal 
        isOpen={showTaskModal} 
        onClose={() => setShowTaskModal(false)}
        onSubmit={handleAddTask}
      />
      <AddVendorModal 
        isOpen={showVendorModal} 
        onClose={() => setShowVendorModal(false)}
        onSubmit={handleAddVendor}
      />
      <AddYearModal 
        isOpen={showYearModal} 
        onClose={() => setShowYearModal(false)}
        onSubmit={handleAddYear}
      />

      {/* Invoice Section Modals */}
      <InvoiceDetailsModal 
        isOpen={showInvoiceDetailsModal} 
        onClose={() => setShowInvoiceDetailsModal(false)}
      />
      <SendMonthlyInvoiceModal 
        isOpen={showSendMonthlyInvoiceModal} 
        onClose={() => setShowSendMonthlyInvoiceModal(false)}
        onSubmit={handleSendInvoice}
      />
      <GenerateMonthlySalaryModal 
        isOpen={showGenerateMonthlySalaryModal} 
        onClose={() => setShowGenerateMonthlySalaryModal(false)}
        onSubmit={handleGenerateSalary}
      />
      <TestReportsModal 
        isOpen={showTestReportsModal} 
        onClose={() => setShowTestReportsModal(false)}
      />
      <RulesModal 
        isOpen={showRulesModal} 
        onClose={() => setShowRulesModal(false)}
      />

      {/* Other Options Modals */}
      <NewRequestsModal 
        isOpen={showNewRequestsModal} 
        onClose={() => setShowNewRequestsModal(false)}
      />
      <SeeTestStatusModal 
        isOpen={showSeeTestStatusModal} 
        onClose={() => setShowSeeTestStatusModal(false)}
      />
      <ListOfCountryModal 
        isOpen={showListOfCountryModal} 
        onClose={() => setShowListOfCountryModal(false)}
      />
      <SMSServicesModal 
        isOpen={showSMSServicesModal} 
        onClose={() => setShowSMSServicesModal(false)}
      />
      <ComplaintsModal 
        isOpen={showComplaintsModal} 
        onClose={() => setShowComplaintsModal(false)}
      />
    </>
  );
};

export default Header;