import React, { useState } from 'react';
import { 
  Users, BookOpen, Home, Settings, 
  UserPlus, GraduationCap, CreditCard,
  Clock, ClipboardList, BarChart,
  X, ChevronLeft, ChevronRight,
  Search
} from 'lucide-react';

// ============================================
// INTERFACES
// ============================================
interface TabConfig {
  id: string;
  name: string;
  icon: any;
  shortName: string;
  badge?: string | number;
  category?: string;
}

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
}

// ============================================
// TABS CONFIGURATION
// ============================================
const tabs: TabConfig[] = [
  { id: 'overview', name: 'Dashboard Overview', icon: Home, shortName: 'Overview', category: 'main' },
  { id: 'daily-classes', name: 'Daily Classes', icon: ClipboardList, shortName: 'Classes', badge: '12', category: 'main' },
  { id: 'families', name: 'Family Management', icon: Users, shortName: 'Families', category: 'management' },
  { id: 'users', name: 'User Management', icon: UserPlus, shortName: 'Users', category: 'management' },
  { id: 'teachers', name: 'Teacher Schedules', icon: GraduationCap, shortName: 'Schedules', category: 'academic' },
  { id: 'teacher-management', name: 'Teacher Management', icon: Users, shortName: 'Teachers', category: 'academic' },
  { id: 'teacher-students', name: 'View Teacher Students', icon: Users, shortName: 'Students', category: 'academic' },
  { id: 'courses', name: 'Course Management', icon: BookOpen, shortName: 'Courses', category: 'academic' },
  { id: 'subscriptions', name: 'Subscriptions & Payments', icon: CreditCard, shortName: 'Payments', category: 'finance' },
  { id: 'analytics', name: 'Analytics', icon: BarChart, shortName: 'Analytics', category: 'reports' },
  { id: 'settings', name: 'Settings', icon: Settings, shortName: 'Settings', category: 'system' }
];

// تجميع حسب الفئات
const categories = {
  main: { name: 'Main', tabs: tabs.filter(t => t.category === 'main') },
  management: { name: 'Management', tabs: tabs.filter(t => t.category === 'management') },
  academic: { name: 'Academic', tabs: tabs.filter(t => t.category === 'academic') },
  finance: { name: 'Finance', tabs: tabs.filter(t => t.category === 'finance') },
  reports: { name: 'Reports', tabs: tabs.filter(t => t.category === 'reports') },
  system: { name: 'System', tabs: tabs.filter(t => t.category === 'system') }
};

// ============================================
// SIDEBAR COMPONENT
// ============================================
export default function AdminSidebar({
  activeTab,
  setActiveTab,
  isSidebarOpen,
  setIsSidebarOpen,
  isSidebarCollapsed,
  setIsSidebarCollapsed
}: AdminSidebarProps) {
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const sidebarWidthClass = isSidebarCollapsed ? 'w-20' : 'w-72';

  // Filter tabs based on search
  const filteredTabs = searchQuery 
    ? tabs.filter(tab => tab.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : tabs;

  return (
    <>
      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:relative lg:translate-x-0 
          transition-all duration-300 ease-in-out 
          z-30 ${sidebarWidthClass} 
          bg-white
          border-r border-gray-200 
          flex flex-col 
          shadow-lg
        `}
      >
        
        {/* ============================================ */}
        {/* HEADER WITH COLLAPSE BUTTON */}
        {/* ============================================ */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-gray-50">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-600 rounded-lg">
                <Home className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-800">
                  Qutooff
                </h2>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            </div>
          )}
          
          {isSidebarCollapsed && (
            <div className="p-1.5 bg-emerald-600 rounded-lg mx-auto">
              <Home className="h-4 w-4 text-white" />
            </div>
          )}
          
          {/* Collapse Button - في الأعلى */}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden lg:flex items-center justify-center p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={isSidebarCollapsed ? 'Expand' : 'Collapse'}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            )}
          </button>

          {/* Close Button - Mobile Only */}
          <button 
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors" 
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* ============================================ */}
        {/* SEARCH BAR */}
        {/* ============================================ */}
        {!isSidebarCollapsed && (
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="
                  w-full pl-10 pr-4 py-2 
                  bg-gray-50 
                  border border-gray-200 
                  rounded-lg 
                  text-sm text-gray-700 
                  placeholder-gray-400
                  focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                  transition-all
                "
              />
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* NAVIGATION */}
        {/* ============================================ */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {isSidebarCollapsed ? (
            // Collapsed View - Simple List
            <>
              {filteredTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`
                    relative w-full flex items-center justify-center
                    p-3 rounded-lg
                    transition-all duration-200 
                    group
                    ${activeTab === tab.id
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                    }
                  `}
                >
                  <tab.icon className="h-5 w-5" />
                  
                  {/* Badge */}
                  {tab.badge && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-sm">
                      {tab.badge}
                    </span>
                  )}
                  
                  {/* Tooltip */}
                  <div className="
                    absolute left-full ml-4 px-3 py-2
                    bg-gray-900 text-white text-sm 
                    rounded-lg shadow-xl
                    whitespace-nowrap 
                    opacity-0 group-hover:opacity-100
                    pointer-events-none
                    transition-opacity duration-200
                    z-50
                  ">
                    {tab.name}
                    {tab.badge && (
                      <span className="ml-2 px-2 py-0.5 bg-red-500 rounded-full text-xs">
                        {tab.badge}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </>
          ) : (
            // Expanded View - Categorized
            <>
              {Object.entries(categories).map(([key, category]) => {
                const categoryTabs = searchQuery 
                  ? filteredTabs.filter(t => t.category === key)
                  : category.tabs;
                
                if (categoryTabs.length === 0) return null;
                
                return (
                  <div key={key} className="mb-6">
                    {/* Category Label */}
                    <div className="px-3 mb-2">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {category.name}
                      </p>
                    </div>
                    
                    {/* Category Tabs */}
                    <div className="space-y-1">
                      {categoryTabs.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setActiveTab(tab.id);
                            setIsSidebarOpen(false);
                          }}
                          className={`
                            relative w-full flex items-center
                            px-3 py-2.5 rounded-lg
                            transition-all duration-200 
                            group
                            ${activeTab === tab.id
                              ? 'bg-emerald-600 text-white shadow-md'
                              : 'text-gray-700 hover:bg-gray-100'
                            }
                          `}
                        >
                          {/* Active Indicator */}
                          {activeTab === tab.id && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-yellow-500 rounded-r-full" />
                          )}
                          
                          {/* Icon */}
                          <div className={`
                            p-2 rounded-lg mr-3
                            transition-all duration-200
                            ${activeTab === tab.id 
                              ? 'bg-white/20' 
                              : 'bg-gray-100 group-hover:bg-gray-200'
                            }
                          `}>
                            <tab.icon className="h-4 w-4" />
                          </div>
                          
                          {/* Text */}
                          <span className="flex-1 text-left text-sm font-medium">
                            {tab.name}
                          </span>
                          
                          {/* Badge */}
                          {tab.badge && (
                            <span className={`
                              px-2 py-0.5 rounded-full text-xs font-bold
                              ${activeTab === tab.id
                                ? 'bg-white/20 text-white'
                                : 'bg-red-500 text-white'
                              }
                            `}>
                              {tab.badge}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </nav>

        {/* ============================================ */}
        {/* FOOTER - User Info (Optional) */}
        {/* ============================================ */}
        {!isSidebarCollapsed && (
          <div className="border-t border-gray-200 p-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-emerald-50 to-gray-50 border border-gray-200">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                SA
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  Super Admin
                </p>
                <p className="text-xs text-gray-500 truncate">
                  admin@qutooff.com
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* ============================================ */}
      {/* MOBILE OVERLAY */}
      {/* ============================================ */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </>
  );
}