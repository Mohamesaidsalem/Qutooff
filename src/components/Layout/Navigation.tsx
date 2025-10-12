import React, { useState } from 'react';
import { 
  ChevronDown, 
  Home, 
  Calendar, 
  Users, 
  UserCheck, 
  GraduationCap, 
  Settings, 
  BookOpen, 
  Bell, 
  LogOut,
  Plus,
  FileText,
  DollarSign,
  Clock
} from 'lucide-react';

interface NavigationProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
  userRole?: string;
}

export default function Navigation({ currentSection, onSectionChange, userRole }: NavigationProps) {
  const [optionsDropdownOpen, setOptionsDropdownOpen] = useState(false);

  const navigationItems = [
    { id: 'dashboard', title: 'Dashboard', icon: Home },
    { id: 'search-schedule', title: 'Search Schedule', icon: Calendar },
    { id: 'employees', title: 'Employees', icon: Users },
    { id: 'families', title: 'Families', icon: UserCheck },
    { id: 'students', title: 'Students', icon: GraduationCap },
    { id: 'courses', title: 'Courses', icon: BookOpen },
  ];

  const optionsItems = [
    { id: 'invoice-section', title: 'Invoice Section', icon: FileText },
    { id: 'weekly-classes', title: 'Weekly Classes', icon: Clock },
    { id: 'other-options', title: 'Other Options', icon: Settings },
  ];

  const addOptionsItems = [
    { id: 'add-employee', title: 'Add New Employee', icon: Plus },
    { id: 'add-family', title: 'Add New Family', icon: Plus },
    { id: 'add-country', title: 'Add New Country', icon: Plus },
    { id: 'add-task', title: 'Add New Task', icon: Plus },
    { id: 'add-vendor', title: 'Add New Vendor', icon: Plus },
    { id: 'add-year', title: 'Add New Year', icon: Plus },
  ];

  return (
    <nav className="bg-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Main Navigation */}
          <div className="flex items-center space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentSection === item.id
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.title}
                </button>
              );
            })}

            {/* Options Dropdown */}
            <div className="relative">
              <button
                onClick={() => setOptionsDropdownOpen(!optionsDropdownOpen)}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  ['invoice-section', 'weekly-classes', 'other-options'].includes(currentSection)
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Settings className="h-4 w-4 mr-2" />
                Options
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>

              {optionsDropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-1">
                    {/* Main Options */}
                    <div className="px-4 py-2 text-sm font-medium text-gray-900 bg-gray-50 border-b">
                      Main Options
                    </div>
                    {optionsItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            onSectionChange(item.id);
                            setOptionsDropdownOpen(false);
                          }}
                          className={`w-full text-left flex items-center px-4 py-2 text-sm transition-colors ${
                            currentSection === item.id
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <Icon className="h-4 w-4 mr-3" />
                          {item.title}
                        </button>
                      );
                    })}

                    {/* Add Options */}
                    <div className="px-4 py-2 text-sm font-medium text-gray-900 bg-gray-50 border-b border-t">
                      Add Options
                    </div>
                    {addOptionsItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            onSectionChange(item.id);
                            setOptionsDropdownOpen(false);
                          }}
                          className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Icon className="h-4 w-4 mr-3" />
                          {item.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onSectionChange('notifications')}
              className="p-2 text-slate-300 hover:bg-slate-700 hover:text-white rounded-md transition-colors"
            >
              <Bell className="h-5 w-5" />
            </button>
            <button
              onClick={() => onSectionChange('logout')}
              className="flex items-center px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white rounded-md transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}