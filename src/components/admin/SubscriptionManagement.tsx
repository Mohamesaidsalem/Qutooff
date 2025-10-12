import React, { useState, useEffect } from 'react';
import { CreditCard, Users, DollarSign, TrendingUp, Calendar, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { ref, onValue, off, update } from 'firebase/database';
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
  children: any[];
  courses: any[];
}

export default function SubscriptionManagement({ children, courses }: SubscriptionManagementProps) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');

  // Load subscriptions from Firebase
  useEffect(() => {
    const subscriptionsRef = ref(database, 'subscriptions');
    const unsubscribe = onValue(subscriptionsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const subscriptionsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setSubscriptions(subscriptionsArray);
      } else {
        setSubscriptions([]);
      }
      setLoading(false);
    });

    return () => off(subscriptionsRef, 'value', unsubscribe);
  }, []);

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

  // Calculate statistics
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

  // Filter subscriptions
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
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-gray-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'refunded':
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
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
      </div>

      {filteredSubscriptions.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-medium">No subscriptions found</p>
          <p className="text-sm">Subscriptions will appear here once students enroll in courses</p>
        </div>
      )}

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
    </div>
  );
}