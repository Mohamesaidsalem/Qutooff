import React, { useState, useEffect } from 'react';
import { CreditCard, Users, DollarSign, TrendingUp, Calendar, CheckCircle, XCircle, Clock, AlertCircle, Plus, UserPlus } from 'lucide-react';
import { ref, onValue, off, update, push, set } from 'firebase/database';
import { database } from '../../firebase/config';

interface Subscription {
  id: string;
  studentId: string;
  courseId: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  startDate: string;
  endDate: string;
  amount: number;
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
  paymentMethod: string;
  createdAt: string;
  lastPayment: string;
}

interface SubscriptionManagementProps {
  children?: any[];
  courses?: any[];
}

export default function SubscriptionManagement({}: SubscriptionManagementProps) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [children, setChildren] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollData, setEnrollData] = useState({
    studentId: '',
    courseId: '',
    paymentMethod: 'card',
    startDate: new Date().toISOString().split('T')[0]
  });

  // ✅ Load All Data with Timeout
  useEffect(() => {
    console.log('🔄 Starting data load...');
    
    // Set timeout to stop loading after 3 seconds
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
      console.log('⏱️ Loading timeout - stopping loader');
    }, 3000);

    let dataLoaded = 0;
    const totalCollections = 3;

    const checkAllLoaded = () => {
      dataLoaded++;
      console.log(`📊 Data loaded: ${dataLoaded}/${totalCollections}`);
      if (dataLoaded >= totalCollections) {
        clearTimeout(loadingTimeout);
        setLoading(false);
        console.log('✅ All data loaded successfully');
      }
    };

    // Load Children
    const childrenRef = ref(database, 'children');
    const unsubChildren = onValue(
      childrenRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const childrenArray = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));
          setChildren(childrenArray.filter(c => c.isActive !== false));
          console.log('✅ Children loaded:', childrenArray.length);
        } else {
          setChildren([]);
          console.log('ℹ️ No children data found');
        }
        checkAllLoaded();
      },
      (error) => {
        console.error('❌ Error loading children:', error);
        setChildren([]);
        checkAllLoaded();
      }
    );

    // Load Courses
    const coursesRef = ref(database, 'courses');
    const unsubCourses = onValue(
      coursesRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const coursesArray = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));
          setCourses(coursesArray);
          console.log('✅ Courses loaded:', coursesArray.length);
        } else {
          setCourses([]);
          console.log('ℹ️ No courses data found');
        }
        checkAllLoaded();
      },
      (error) => {
        console.error('❌ Error loading courses:', error);
        setCourses([]);
        checkAllLoaded();
      }
    );

    // Load Subscriptions
    const subscriptionsRef = ref(database, 'subscriptions');
    const unsubSubscriptions = onValue(
      subscriptionsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const subscriptionsArray = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));
          setSubscriptions(subscriptionsArray);
          console.log('✅ Subscriptions loaded:', subscriptionsArray.length);
        } else {
          setSubscriptions([]);
          console.log('ℹ️ No subscriptions data found');
        }
        checkAllLoaded();
      },
      (error) => {
        console.error('❌ Error loading subscriptions:', error);
        setSubscriptions([]);
        checkAllLoaded();
      }
    );

    return () => {
      clearTimeout(loadingTimeout);
      off(childrenRef, 'value', unsubChildren);
      off(coursesRef, 'value', unsubCourses);
      off(subscriptionsRef, 'value', unsubSubscriptions);
    };
  }, []);

  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();

    const course = courses.find(c => c.id === enrollData.courseId);
    if (!course) {
      alert('Course not found');
      return;
    }

    const existingSubscription = subscriptions.find(
      sub => sub.studentId === enrollData.studentId && 
             sub.courseId === enrollData.courseId && 
             sub.status === 'active'
    );

    if (existingSubscription) {
      alert('Student is already enrolled in this course!');
      return;
    }

    try {
      const startDate = new Date(enrollData.startDate);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + (course.duration * 7));

      const subscriptionData = {
        studentId: enrollData.studentId,
        courseId: enrollData.courseId,
        status: 'pending',
        startDate: enrollData.startDate,
        endDate: endDate.toISOString().split('T')[0],
        amount: course.price,
        paymentStatus: 'pending',
        paymentMethod: enrollData.paymentMethod,
        createdAt: new Date().toISOString(),
        lastPayment: ''
      };

      const subscriptionsRef = ref(database, 'subscriptions');
      const newSubRef = push(subscriptionsRef);
      await set(newSubRef, subscriptionData);

      const courseRef = ref(database, `courses/${enrollData.courseId}`);
      await update(courseRef, {
        currentStudents: (course.currentStudents || 0) + 1
      });

      alert('Student enrolled successfully! Subscription created.');
      setShowEnrollModal(false);
      setEnrollData({
        studentId: '',
        courseId: '',
        paymentMethod: 'card',
        startDate: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error enrolling student:', error);
      alert('Error enrolling student. Please try again.');
    }
  };

  const handleUpdateSubscription = async (subscriptionId: string, updates: any) => {
    try {
      const subscriptionRef = ref(database, `subscriptions/${subscriptionId}`);
      await update(subscriptionRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      alert('Subscription updated successfully!');
    } catch (error) {
      console.error('Error updating subscription:', error);
      alert('Error updating subscription. Please try again.');
    }
  };

  const totalRevenue = subscriptions
    .filter(sub => sub.paymentStatus === 'paid')
    .reduce((acc, sub) => acc + sub.amount, 0);

  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active').length;
  const pendingPayments = subscriptions.filter(sub => sub.paymentStatus === 'pending').length;
  const monthlyRevenue = subscriptions
    .filter(sub => {
      const subDate = new Date(sub.createdAt);
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      return subDate.getMonth() === currentMonth && 
             subDate.getFullYear() === currentYear &&
             sub.paymentStatus === 'paid';
    })
    .reduce((acc, sub) => acc + sub.amount, 0);

  const filteredSubscriptions = subscriptions.filter(sub => {
    const statusMatch = filterStatus === 'all' || sub.status === filterStatus;
    const paymentMatch = filterPayment === 'all' || sub.paymentStatus === filterPayment;
    return statusMatch && paymentMatch;
  });

  const stats = [
    { name: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'bg-green-500', change: '+12%' },
    { name: 'Active Subscriptions', value: activeSubscriptions.toString(), icon: Users, color: 'bg-blue-500', change: '+5' },
    { name: 'Monthly Revenue', value: `$${monthlyRevenue.toFixed(2)}`, icon: TrendingUp, color: 'bg-emerald-500', change: '+18%' },
    { name: 'Pending Payments', value: pendingPayments.toString(), icon: AlertCircle, color: 'bg-orange-500', change: '-2' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'expired': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-gray-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'refunded': return <AlertCircle className="h-4 w-4 text-blue-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  // Empty State
  if (!loading && subscriptions.length === 0 && children.length === 0 && courses.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Subscription & Payment Management</h2>
            <p className="mt-2 text-sm text-gray-600">Monitor subscriptions, payments, and revenue analytics</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-12 text-center border-2 border-dashed border-gray-300">
          <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-600 mb-6">
            Start by adding students and courses to create subscriptions and manage payments.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Subscription & Payment Management</h2>
          <p className="mt-2 text-sm text-gray-600">
            Monitor subscriptions, payments, and revenue analytics
          </p>
        </div>
        <button
          onClick={() => setShowEnrollModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-sm"
          disabled={children.length === 0 || courses.length === 0}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Enroll Student
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item) => (
          <div key={item.name} className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-lg ${item.color}`}>
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {item.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {item.value}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        <TrendingUp className="h-4 w-4 flex-shrink-0 self-center text-green-500" />
                        <span className="ml-1">{item.change}</span>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Payment
            </label>
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">
            Subscriptions ({filteredSubscriptions.length})
          </h3>
        </div>
        
        {filteredSubscriptions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubscriptions.map((subscription) => {
                  const student = children.find(c => c.id === subscription.studentId);
                  const course = courses.find(c => c.id === subscription.courseId);
                  
                  return (
                    <tr key={subscription.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {student?.name || 'Unknown Student'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {student?.email || 'No email'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {course?.title || 'Unknown Course'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {course?.level || 'No level'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(subscription.status)}
                          <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            subscription.status === 'active' ? 'bg-green-100 text-green-800' :
                            subscription.status === 'expired' ? 'bg-red-100 text-red-800' :
                            subscription.status === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {subscription.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getPaymentStatusIcon(subscription.paymentStatus)}
                          <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            subscription.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                            subscription.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            subscription.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {subscription.paymentStatus}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${subscription.amount.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {subscription.paymentMethod}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {subscription.startDate}
                        </div>
                        <div className="text-sm text-gray-500">
                          to {subscription.endDate}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {subscription.status === 'pending' && (
                            <button
                              onClick={() => handleUpdateSubscription(subscription.id, { status: 'active' })}
                              className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 px-2 py-1 rounded text-xs transition-colors"
                            >
                              Activate
                            </button>
                          )}
                          {subscription.status === 'active' && (
                            <button
                              onClick={() => handleUpdateSubscription(subscription.id, { status: 'cancelled' })}
                              className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-2 py-1 rounded text-xs transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                          {subscription.paymentStatus === 'pending' && (
                            <button
                              onClick={() => handleUpdateSubscription(subscription.id, { paymentStatus: 'paid', lastPayment: new Date().toISOString() })}
                              className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded text-xs transition-colors"
                            >
                              Mark Paid
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-medium">No subscriptions found</p>
            <p className="text-sm">Enroll students in courses to create subscriptions</p>
          </div>
        )}
      </div>

      {/* Revenue Chart Placeholder */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Analytics</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-medium">Revenue Chart</p>
            <p className="text-sm">Advanced analytics coming soon...</p>
          </div>
        </div>
      </div>

      {/* Enroll Student Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Enroll Student in Course</h2>
                <button
                  onClick={() => {
                    setShowEnrollModal(false);
                    setEnrollData({
                      studentId: '',
                      courseId: '',
                      paymentMethod: 'card',
                      startDate: new Date().toISOString().split('T')[0]
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleEnrollStudent} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Student *
                  </label>
                  <select
                    value={enrollData.studentId}
                    onChange={(e) => setEnrollData({ ...enrollData, studentId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Choose a student...</option>
                    {children.map(child => (
                      <option key={child.id} value={child.id}>
                        {child.name} - {child.level || 'No level'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Course *
                  </label>
                  <select
                    value={enrollData.courseId}
                    onChange={(e) => setEnrollData({ ...enrollData, courseId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Choose a course...</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.title} - ${course.price} ({course.duration} weeks)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={enrollData.startDate}
                    onChange={(e) => setEnrollData({ ...enrollData, startDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method *
                  </label>
                  <select
                    value={enrollData.paymentMethod}
                    onChange={(e) => setEnrollData({ ...enrollData, paymentMethod: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="card">Credit/Debit Card</option>
                    <option value="paypal">PayPal</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>

                {enrollData.courseId && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">Enrollment Summary</h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p><strong>Course:</strong> {courses.find(c => c.id === enrollData.courseId)?.title}</p>
                      <p><strong>Price:</strong> ${courses.find(c => c.id === enrollData.courseId)?.price}</p>
                      <p><strong>Duration:</strong> {courses.find(c => c.id === enrollData.courseId)?.duration} weeks</p>
                      <p><strong>Status:</strong> Pending (awaiting payment)</p>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEnrollModal(false);
                      setEnrollData({
                        studentId: '',
                        courseId: '',
                        paymentMethod: 'card',
                        startDate: new Date().toISOString().split('T')[0]
                      });
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    Enroll Student
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}