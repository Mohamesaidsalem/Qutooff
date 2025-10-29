import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, TrendingUp, Calendar, DollarSign, Video, Plus, Edit, 
  UserPlus, Key, BookOpen, Bell, CreditCard, FileText, Clock, 
  CheckCircle, AlertCircle, Download, Trash2, Home 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

// Import Modals
import AddChildModal from '../Modals/Parent/AddChildModal';
import EditChildModal from '../Modals/Parent/EditChildModal';
import CreateStudentAccountModal from '../Modals/Parent/CreateStudentAccountModal';
import ChangePasswordModal from '../Modals/Parent/ChangePasswordModal';

export default function ParentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    getChildrenByParent, 
    getFamiliesByParent, // ✅ NEW
    getUpcomingClassesForParent, 
    getInvoicesForParent,
    getParentStats,
    removeChild,
    loading: dataLoading
  } = useData();

  const [activeTab, setActiveTab] = useState('overview');
  const [children, setChildren] = useState<any[]>([]);
  const [families, setFamilies] = useState<any[]>([]); // ✅ NEW
  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  
  // Modal states
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [showEditChildModal, setShowEditChildModal] = useState(false);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [selectedChild, setSelectedChild] = useState<any>(null);

  // Load data when user is available
  useEffect(() => {
    if (user && user.id) {
      const parentChildren = getChildrenByParent(user.id);
      const parentFamilies = getFamiliesByParent(user.id); // ✅ NEW
      const parentClasses = getUpcomingClassesForParent(user.id);
      const parentInvoices = getInvoicesForParent(user.id);
      const parentStats = getParentStats(user.id);

      console.log('👨‍👩‍👦 ParentDashboard - Children:', parentChildren);
      console.log('🏠 ParentDashboard - Families:', parentFamilies); // ✅ NEW
      console.log('📅 ParentDashboard - Classes:', parentClasses);

      setChildren(parentChildren);
      setFamilies(parentFamilies); // ✅ NEW
      setUpcomingClasses(parentClasses);
      setInvoices(parentInvoices);
      setStats(parentStats);
    }
  }, [user, getChildrenByParent, getFamiliesByParent, getUpcomingClassesForParent, getInvoicesForParent, getParentStats]);

  // Handler functions for modals
  const handleEditChild = (child: any) => {
    setSelectedChild(child);
    setShowEditChildModal(true);
  };

  const handleCreateAccount = (child: any) => {
    setSelectedChild(child);
    setShowCreateAccountModal(true);
  };

  const handleChangePassword = (child: any) => {
    setSelectedChild(child);
    setShowChangePasswordModal(true);
  };

  const handleRemoveChild = async (childId: string, childName: string) => {
    if (window.confirm(`Are you sure you want to remove ${childName}? This action cannot be undone.`)) {
      try {
        await removeChild(childId);
        alert('Child removed successfully!');
      } catch (error) {
        console.error('Error removing child:', error);
        alert('Failed to remove child. Please try again.');
      }
    }
  };

  // Calculate statistics
  const statsCards = stats ? [
    { 
      name: 'My Families', // ✅ NEW
      value: families.length.toString(), 
      icon: Home, 
      color: 'bg-purple-500',
      change: `${families.length} family groups`,
      onClick: () => navigate('/parent/families')
    },
    { 
      name: 'Total Children', 
      value: stats.totalChildren.toString(), 
      icon: Users, 
      color: 'bg-blue-500',
      change: `${stats.totalChildren} active`,
      onClick: () => setActiveTab('children')
    },
    { 
      name: 'Average Progress', 
      value: `${stats.averageProgress}%`, 
      icon: TrendingUp, 
      color: 'bg-green-500',
      change: '+12% this month',
      onClick: () => setActiveTab('children')
    },
    { 
      name: 'Classes This Month', 
      value: stats.classesThisMonth.toString(), 
      icon: Calendar, 
      color: 'bg-orange-500',
      change: `${stats.upcomingClasses} upcoming`,
      onClick: () => setActiveTab('classes')
    },
  ] : [];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Family Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back, {user?.name}! Track your children's Quran journey
              </p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {upcomingClasses.length}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border p-1 inline-flex">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'overview' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('children')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'children' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Children
          </button>
          <button
            onClick={() => setActiveTab('classes')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'classes' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Classes
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'payments' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Payments
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsCards.map((item) => (
              <div 
                key={item.name} 
                onClick={item.onClick}
                className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-all cursor-pointer"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${item.color} p-3 rounded-xl`}>
                      <item.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xs text-green-600 font-medium">{item.change}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {item.name}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {item.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ✅ NEW: Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/parent/families')}
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <Home className="h-5 w-5" />
              <span className="font-medium">Manage Families</span>
            </button>
            
            <button
              onClick={() => setShowAddChildModal(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <UserPlus className="h-5 w-5" />
              <span className="font-medium">Add Child</span>
            </button>
            
            <button
              onClick={() => setActiveTab('classes')}
              className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-lg hover:from-green-700 hover:to-green-800 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <Calendar className="h-5 w-5" />
              <span className="font-medium">View Classes</span>
            </button>
            
            <button
              onClick={() => setActiveTab('payments')}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-4 rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <DollarSign className="h-5 w-5" />
              <span className="font-medium">View Payments</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upcoming Classes */}
            <div className="lg:col-span-2 bg-white shadow-lg rounded-xl border overflow-hidden">
              <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-blue-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Upcoming Classes
                </h2>
              </div>
              <div className="p-6">
                {upcomingClasses.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No upcoming classes scheduled</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingClasses.slice(0, 5).map((cls) => (
                      <div key={cls.id} className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-all">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">{cls.studentName}</h3>
                            <p className="text-sm text-gray-600">{cls.teacherName}</p>
                          </div>
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
                            {cls.time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                          <Clock className="h-4 w-4" />
                          <span>{formatDate(cls.date)}</span>
                          <span className="mx-2">•</span>
                          <BookOpen className="h-4 w-4" />
                          <span>{cls.subject || 'Quran'}</span>
                        </div>
                        <button
                          onClick={() => window.open(cls.zoomLink, '_blank')}
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2 shadow-md"
                        >
                          <Video className="h-4 w-4" />
                          Join Class
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-6">
              {/* ✅ NEW: Families Summary */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg rounded-xl p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                    <Home className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold">My Families</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-bold">{families.length}</p>
                  <p className="text-purple-100">
                    {families.length === 0 
                      ? 'No families created yet' 
                      : `Managing ${families.length} family group${families.length !== 1 ? 's' : ''}`
                    }
                  </p>
                  <button 
                    onClick={() => navigate('/parent/families')}
                    className="w-full bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors font-medium mt-4"
                  >
                    Manage Families
                  </button>
                </div>
              </div>

              {/* Next Payment */}
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg rounded-xl p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold">Next Payment</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-bold">${stats?.monthlyFee || 0}</p>
                  <p className="text-emerald-100">
                    {invoices.find(inv => inv.status === 'pending')?.dueDate 
                      ? `Due ${new Date(invoices.find(inv => inv.status === 'pending')!.dueDate).toLocaleDateString()}`
                      : 'No pending payments'}
                  </p>
                  <button className="w-full bg-white text-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-50 transition-colors font-medium mt-4">
                    Pay Now with PayPal
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white shadow-lg rounded-xl border overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50">
                  <h3 className="font-semibold text-gray-900">Recent Activity</h3>
                </div>
                <div className="p-6 space-y-4">
                  {families.length > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="text-sm text-gray-600">
                        {families.length} family group{families.length !== 1 ? 's' : ''} created
                      </span>
                    </div>
                  )}
                  {upcomingClasses.length > 0 ? (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-sm text-gray-600">
                          Class scheduled with {upcomingClasses[0]?.studentName}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span className="text-sm text-gray-600">
                          {upcomingClasses.length} upcoming classes
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-sm text-gray-600">No recent activity</span>
                    </div>
                  )}
                  {invoices.length > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                      <span className="text-sm text-gray-600">
                        {invoices.filter(inv => inv.status === 'paid').length} invoices paid
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'children' && (
          <div className="bg-white shadow-lg rounded-xl border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-purple-50 to-purple-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Children's Progress
              </h2>
              <button 
                onClick={() => setShowAddChildModal(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Child
              </button>
            </div>
            <div className="overflow-x-auto">
              {children.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No children added yet</p>
                  <button 
                    onClick={() => setShowAddChildModal(true)}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Your First Child
                  </button>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Next Class</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {children.map((child) => (
                      <tr key={child.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                              {child.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{child.name}</div>
                              <div className="text-sm text-gray-500">Age: {child.age}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                            {child.level}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[120px]">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${child.progress || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{child.progress || 0}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{child.teacherName || 'Not assigned'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{child.nextClass || 'Not scheduled'}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleEditChild(child)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            {!child.studentAccount ? (
                              <button 
                                onClick={() => handleCreateAccount(child)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
                                title="Create Account"
                              >
                                <UserPlus className="h-4 w-4" />
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleChangePassword(child)}
                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" 
                                title="Change Password"
                              >
                                <Key className="h-4 w-4" />
                              </button>
                            )}
                            <button 
                              onClick={() => handleRemoveChild(child.id, child.name)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                              title="Remove"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'classes' && (
          <div className="bg-white shadow-lg rounded-xl border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-blue-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                All Classes Schedule
              </h2>
            </div>
            <div className="p-6">
              {upcomingClasses.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No classes scheduled</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingClasses.map((cls) => (
                    <div key={cls.id} className="border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{cls.studentName}</h3>
                          <p className="text-sm text-gray-600">{cls.teacherName}</p>
                        </div>
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
                          {cls.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(cls.date)}</span>
                        <span className="mx-2">•</span>
                        <BookOpen className="h-4 w-4" />
                        <span>{cls.subject || 'Quran'}</span>
                      </div>
                      <button
                        onClick={() => window.open(cls.zoomLink, '_blank')}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2"
                      >
                        <Video className="h-4 w-4" />
                        Join Class
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-6">
            {/* Payment Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white shadow-lg rounded-xl border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-100 p-3 rounded-xl">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Paid Invoices</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {invoices.filter(inv => inv.status === 'paid').length}
                </p>
              </div>

              <div className="bg-white shadow-lg rounded-xl border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-yellow-100 p-3 rounded-xl">
                    <AlertCircle className="h-6 w-6 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Pending</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {invoices.filter(inv => inv.status === 'pending').length}
                </p>
              </div>

              <div className="bg-white shadow-lg rounded-xl border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Total Paid</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  ${invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0)}
                </p>
              </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-white shadow-lg rounded-xl border overflow-hidden">
              <div className="px-6 py-4 border-b bg-gradient-to-r from-emerald-50 to-emerald-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-600" />
                  Payment History
                </h2>
              </div>
              <div className="overflow-x-auto">
                {invoices.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No invoices yet</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {invoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <span className="font-medium text-gray-900">{invoice.month} {invoice.year}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-lg font-semibold text-gray-900">${invoice.amount}</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(invoice.dueDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(invoice.status)}`}>
                              {invoice.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {invoice.status === 'pending' ? (
                              <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium">
                                Pay Now
                              </button>
                            ) : (
                              <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2">
                                <Download className="h-4 w-4" />
                                Receipt
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddChildModal 
        isOpen={showAddChildModal} 
        onClose={() => setShowAddChildModal(false)} 
      />
      
      <EditChildModal 
        isOpen={showEditChildModal} 
        onClose={() => {
          setShowEditChildModal(false);
          setSelectedChild(null);
        }}
        child={selectedChild}
      />
      
      <CreateStudentAccountModal 
        isOpen={showCreateAccountModal} 
        onClose={() => {
          setShowCreateAccountModal(false);
          setSelectedChild(null);
        }}
        child={selectedChild}
      />
      
      <ChangePasswordModal 
        isOpen={showChangePasswordModal} 
        onClose={() => {
          setShowChangePasswordModal(false);
          setSelectedChild(null);
        }}
        child={selectedChild}
      />
    </div>
  );
}