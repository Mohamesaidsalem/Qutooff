import React, { useState } from 'react';
import Navigation from './Layout/Navigation';
import InvoiceSection from './InvoiceSection';
import WeeklyClassesSection from './WeeklyClassesSection';
import OtherOptionsSection from './OtherOptionsSection';
import { BarChart3, Users, Calendar, BookOpen, TrendingUp, Clock } from 'lucide-react';

export default function AdminDashboardWithNavigation() {
  const [currentSection, setCurrentSection] = useState('dashboard');

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return <DashboardContent />;
      case 'search-schedule':
        return <SearchScheduleContent />;
      case 'employees':
        return <EmployeesContent />;
      case 'families':
        return <FamiliesContent />;
      case 'students':
        return <StudentsContent />;
      case 'courses':
        return <CoursesContent />;
      case 'invoice-section':
        return <InvoiceSection teachers={[]} children={[]} />;
      case 'weekly-classes':
        return <WeeklyClassesSection teachers={[]} children={[]} />;
      case 'other-options':
        return <OtherOptionsSection />;
      case 'notifications':
        return <NotificationsContent />;
      case 'logout':
        return <LogoutContent />;
      // Add options
      case 'add-employee':
        return <AddEmployeeContent />;
      case 'add-family':
        return <AddFamilyContent />;
      case 'add-country':
        return <AddCountryContent />;
      case 'add-task':
        return <AddTaskContent />;
      case 'add-vendor':
        return <AddVendorContent />;
      case 'add-year':
        return <AddYearContent />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        currentSection={currentSection} 
        onSectionChange={setCurrentSection}
        userRole="admin"
      />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderCurrentSection()}
      </main>
    </div>
  );
}

// Dashboard Content Component
function DashboardContent() {
  const stats = [
    { name: 'Total Students', value: '2,651', icon: Users, change: '+4.75%', changeType: 'positive' },
    { name: 'Active Teachers', value: '145', icon: BookOpen, change: '+2.02%', changeType: 'positive' },
    { name: 'Classes Today', value: '89', icon: Calendar, change: '+12.5%', changeType: 'positive' },
    { name: 'Revenue', value: '$45,231', icon: TrendingUp, change: '+8.2%', changeType: 'positive' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Welcome back! Here's what's happening with your educational platform today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <item.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{item.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <span className="text-green-600 font-medium">{item.change}</span>
                <span className="text-gray-500"> from last month</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h3>
          <div className="mt-5">
            <div className="flow-root">
              <ul className="-mb-8">
                {[
                  { id: 1, content: 'New student enrolled in Mathematics course', time: '2 hours ago' },
                  { id: 2, content: 'Teacher Sarah completed weekly report', time: '4 hours ago' },
                  { id: 3, content: 'Payment received from Johnson family', time: '6 hours ago' },
                  { id: 4, content: 'New class scheduled for tomorrow', time: '8 hours ago' },
                ].map((item, itemIdx) => (
                  <li key={item.id}>
                    <div className="relative pb-8">
                      {itemIdx !== 3 ? (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                            <Clock className="h-4 w-4 text-white" aria-hidden="true" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">{item.content}</p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            <time>{item.time}</time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Placeholder components for other sections
function SearchScheduleContent() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Search Schedule</h2>
      <p className="text-gray-600">Schedule search functionality will be implemented here.</p>
    </div>
  );
}

function EmployeesContent() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Employees Management</h2>
      <p className="text-gray-600">Employee management functionality will be implemented here.</p>
    </div>
  );
}

function FamiliesContent() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Families Management</h2>
      <p className="text-gray-600">Family management functionality will be implemented here.</p>
    </div>
  );
}

function StudentsContent() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Students Management</h2>
      <p className="text-gray-600">Student management functionality will be implemented here.</p>
    </div>
  );
}

function CoursesContent() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Courses Management</h2>
      <p className="text-gray-600">Course management functionality will be implemented here.</p>
    </div>
  );
}

function NotificationsContent() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Notifications</h2>
      <p className="text-gray-600">Notifications will be displayed here.</p>
    </div>
  );
}

function LogoutContent() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Logout</h2>
      <p className="text-gray-600">Logout functionality will be implemented here.</p>
    </div>
  );
}

// Add option components
function AddEmployeeContent() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Employee</h2>
      <p className="text-gray-600">Employee creation form will be implemented here.</p>
    </div>
  );
}

function AddFamilyContent() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Family</h2>
      <p className="text-gray-600">Family creation form will be implemented here.</p>
    </div>
  );
}

function AddCountryContent() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Country</h2>
      <p className="text-gray-600">Country creation form will be implemented here.</p>
    </div>
  );
}

function AddTaskContent() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Task</h2>
      <p className="text-gray-600">Task creation form will be implemented here.</p>
    </div>
  );
}

function AddVendorContent() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Vendor</h2>
      <p className="text-gray-600">Vendor creation form will be implemented here.</p>
    </div>
  );
}

function AddYearContent() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Year</h2>
      <p className="text-gray-600">Academic year creation form will be implemented here.</p>
    </div>
  );
}