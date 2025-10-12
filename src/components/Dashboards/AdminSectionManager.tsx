import React, { useState } from 'react';
import Navigation from '../Layout/Navigation';
import InvoiceSection from '../Sections/InvoiceSection';
import WeeklyClassesSection from '../Sections/WeeklyClassesSection';
import OtherOptionsSection from '../Sections/OtherOptionsSection';
import { Home, Calendar, Users, UserCheck, GraduationCap, BookOpen, Bell, Plus, Building, Globe, Tag as Task, Truck, CalendarDays } from 'lucide-react';

interface AdminSectionManagerProps {
  userRole?: string;
}

export default function AdminSectionManager({ userRole }: AdminSectionManagerProps) {
  const [currentSection, setCurrentSection] = useState('dashboard');

  const renderDashboardOverview = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="text-sm text-gray-500">
          Welcome back, Admin
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-2xl font-semibold text-gray-900">24</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Families</p>
              <p className="text-2xl font-semibold text-gray-900">156</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <GraduationCap className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Students</p>
              <p className="text-2xl font-semibold text-gray-900">342</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Courses</p>
              <p className="text-2xl font-semibold text-gray-900">18</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <button
            onClick={() => setCurrentSection('invoice-section')}
            className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <div className="p-2 bg-blue-100 rounded-lg mb-2">
              <Plus className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">Invoice Section</span>
          </button>

          <button
            onClick={() => setCurrentSection('weekly-classes')}
            className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <div className="p-2 bg-green-100 rounded-lg mb-2">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">Weekly Classes</span>
          </button>

          <button
            onClick={() => setCurrentSection('other-options')}
            className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <div className="p-2 bg-purple-100 rounded-lg mb-2">
              <Bell className="h-5 w-5 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">Other Options</span>
          </button>

          <button
            onClick={() => setCurrentSection('add-employee')}
            className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <div className="p-2 bg-orange-100 rounded-lg mb-2">
              <Users className="h-5 w-5 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">Add Employee</span>
          </button>

          <button
            onClick={() => setCurrentSection('add-family')}
            className="flex flex-col items-center p-4 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
          >
            <div className="p-2 bg-pink-100 rounded-lg mb-2">
              <UserCheck className="h-5 w-5 text-pink-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">Add Family</span>
          </button>

          <button
            onClick={() => setCurrentSection('add-country')}
            className="flex flex-col items-center p-4 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
          >
            <div className="p-2 bg-teal-100 rounded-lg mb-2">
              <Globe className="h-5 w-5 text-teal-600" />
            </div>
            <span className="text-sm font-medium text-gray-900">Add Country</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderAddForm = (type: string) => {
    const formConfigs = {
      'add-employee': {
        title: 'Add New Employee',
        icon: Users,
        fields: ['Full Name', 'Email', 'Position', 'Department', 'Salary'],
      },
      'add-family': {
        title: 'Add New Family',
        icon: UserCheck,
        fields: ['Family Name', 'Contact Person', 'Phone', 'Email', 'Address'],
      },
      'add-country': {
        title: 'Add New Country',
        icon: Globe,
        fields: ['Country Name', 'Country Code', 'Currency', 'Timezone', 'Flag'],
      },
      'add-task': {
        title: 'Add New Task',
        icon: Task,
        fields: ['Task Title', 'Description', 'Priority', 'Assignee', 'Due Date'],
      },
      'add-vendor': {
        title: 'Add New Vendor',
        icon: Building,
        fields: ['Vendor Name', 'Contact Person', 'Phone', 'Email', 'Service Type'],
      },
      'add-year': {
        title: 'Add New Academic Year',
        icon: CalendarDays,
        fields: ['Year Name', 'Start Date', 'End Date', 'Status'],
      },
    };

    const config = formConfigs[type as keyof typeof formConfigs];
    if (!config) return null;

    const Icon = config.icon;

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Icon className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="ml-4 text-2xl font-bold text-gray-900">{config.title}</h2>
          </div>

          <form className="space-y-4">
            {config.fields.map((field, index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field}
                </label>
                <input
                  type={field.toLowerCase().includes('email') ? 'email' : 
                        field.toLowerCase().includes('phone') ? 'tel' :
                        field.toLowerCase().includes('date') ? 'date' :
                        field.toLowerCase().includes('salary') ? 'number' : 'text'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`Enter ${field.toLowerCase()}`}
                />
              </div>
            ))}
            
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setCurrentSection('dashboard')}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return renderDashboardOverview();
      case 'invoice-section':
        return <InvoiceSection />;
      case 'weekly-classes':
        return <WeeklyClassesSection />;
      case 'other-options':
        return <OtherOptionsSection />;
      case 'add-employee':
      case 'add-family':
      case 'add-country':
      case 'add-task':
      case 'add-vendor':
      case 'add-year':
        return renderAddForm(currentSection);
      default:
        return (
          <div className="text-center py-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {currentSection.charAt(0).toUpperCase() + currentSection.slice(1).replace('-', ' ')}
            </h2>
            <p className="text-gray-600">This section is under development.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
        userRole={userRole}
      />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderSection()}
      </main>
    </div>
  );
}