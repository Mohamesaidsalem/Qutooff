import React, { useState, useEffect } from 'react';
import { X, Bell, User, Calendar, CheckCircle, XCircle, Clock, Filter, Search } from 'lucide-react';
import { ref, onValue, off, update, remove } from 'firebase/database';
import { database } from '../../../firebase/config';

interface NewRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Request {
  id: string;
  type: 'trial' | 'enrollment' | 'reschedule' | 'complaint' | 'support';
  status: 'pending' | 'approved' | 'rejected' | 'in_progress';
  userName: string;
  userEmail: string;
  userPhone: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt?: string;
}

const NewRequestsModal: React.FC<NewRequestsModalProps> = ({ isOpen, onClose }) => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    const requestsRef = ref(database, 'requests');

    const unsubscribe = onValue(requestsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const requestsList: Request[] = Object.entries(data).map(([id, request]: [string, any]) => ({
          id,
          ...request,
        }));
        // Sort by date (newest first)
        requestsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setRequests(requestsList);
        setFilteredRequests(requestsList);
      } else {
        setRequests([]);
        setFilteredRequests([]);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error loading requests:', error);
      setLoading(false);
    });

    const timeout = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => {
      off(requestsRef);
      clearTimeout(timeout);
    };
  }, [isOpen]);

  useEffect(() => {
    let filtered = requests;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (request) =>
          request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter((request) => request.type === typeFilter);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((request) => request.status === statusFilter);
    }

    setFilteredRequests(filtered);
  }, [searchTerm, typeFilter, statusFilter, requests]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'trial': return 'bg-blue-100 text-blue-800';
      case 'enrollment': return 'bg-green-100 text-green-800';
      case 'reschedule': return 'bg-yellow-100 text-yellow-800';
      case 'complaint': return 'bg-red-100 text-red-800';
      case 'support': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const handleUpdateStatus = async (requestId: string, newStatus: Request['status']) => {
    try {
      const requestRef = ref(database, `requests/${requestId}`);
      await update(requestRef, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
      alert(`Request ${newStatus} successfully!`);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error updating request:', error);
      alert('Failed to update request. Please try again.');
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to delete this request?')) return;

    try {
      const requestRef = ref(database, `requests/${requestId}`);
      await remove(requestRef);
      alert('Request deleted successfully!');
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error deleting request:', error);
      alert('Failed to delete request. Please try again.');
    }
  };

  const calculateStats = () => {
    return {
      total: requests.length,
      pending: requests.filter((r) => r.status === 'pending').length,
      approved: requests.filter((r) => r.status === 'approved').length,
      rejected: requests.filter((r) => r.status === 'rejected').length,
    };
  };

  const stats = calculateStats();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Bell className="h-6 w-6 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">New Requests</h2>
              <p className="text-orange-100 text-sm">Manage incoming requests and inquiries</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-orange-800 rounded-full p-1 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-600 font-medium">Total Requests</div>
              <div className="text-2xl font-bold text-blue-900 mt-2">{stats.total}</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="text-sm text-yellow-600 font-medium">Pending</div>
              <div className="text-2xl font-bold text-yellow-900 mt-2">{stats.pending}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-sm text-green-600 font-medium">Approved</div>
              <div className="text-2xl font-bold text-green-900 mt-2">{stats.approved}</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="text-sm text-red-600 font-medium">Rejected</div>
              <div className="text-2xl font-bold text-red-900 mt-2">{stats.rejected}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="trial">Free Trial</option>
              <option value="enrollment">Enrollment</option>
              <option value="reschedule">Reschedule</option>
              <option value="complaint">Complaint</option>
              <option value="support">Support</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Requests List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No requests found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div
                  key={request.id}
                  className="border-2 border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-all bg-white"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                            request.priority
                          )}`}
                        >
                          {request.priority.toUpperCase()}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(
                            request.type
                          )}`}
                        >
                          {request.type.charAt(0).toUpperCase() + request.type.slice(1)}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            request.status
                          )}`}
                        >
                          {request.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{request.subject}</h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3 text-sm text-gray-600">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-400" />
                          {request.userName}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {new Date(request.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-gray-500">{request.userEmail}</div>
                      </div>

                      <p className="text-gray-600 text-sm mb-2">{request.message}</p>

                      {request.userPhone && (
                        <div className="text-sm text-gray-500">
                          📞 Phone: {request.userPhone}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(request.id, 'in_progress')}
                            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors flex items-center text-sm"
                            title="Mark as In Progress"
                          >
                            <Clock className="h-4 w-4 mr-1" />
                            In Progress
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(request.id, 'approved')}
                            className="p-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition-colors flex items-center text-sm"
                            title="Approve"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(request.id, 'rejected')}
                            className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors flex items-center text-sm"
                            title="Reject"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </button>
                        </>
                      )}
                      {request.status === 'in_progress' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(request.id, 'approved')}
                            className="p-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition-colors flex items-center text-sm"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(request.id, 'rejected')}
                            className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors flex items-center text-sm"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteRequest(request.id)}
                        className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                        title="Delete Request"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t">
          <div className="text-sm text-gray-600">
            Showing {filteredRequests.length} of {requests.length} requests
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewRequestsModal;