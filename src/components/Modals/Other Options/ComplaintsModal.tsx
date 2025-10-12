import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, User, Calendar, MessageCircle, CheckCircle, Clock, XCircle, Search, Eye } from 'lucide-react';
import { ref, onValue, off, update, remove } from 'firebase/database';
import { database } from '../../../firebase/config';

interface ComplaintsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Complaint {
  id: string;
  complainantName: string;
  complainantEmail: string;
  complainantPhone: string;
  complainantType: 'parent' | 'teacher' | 'student';
  category: 'technical' | 'teaching' | 'payment' | 'behavior' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  subject: string;
  description: string;
  status: 'pending' | 'in_review' | 'resolved' | 'rejected';
  response?: string;
  resolvedBy?: string;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
}

const ComplaintsModal: React.FC<ComplaintsModalProps> = ({ isOpen, onClose }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [responseText, setResponseText] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    const complaintsRef = ref(database, 'complaints');

    const unsubscribe = onValue(complaintsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const complaintsList: Complaint[] = Object.entries(data).map(([id, complaint]: [string, any]) => ({
          id,
          ...complaint,
        }));
        // Sort by priority and date
        complaintsList.sort((a, b) => {
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setComplaints(complaintsList);
        setFilteredComplaints(complaintsList);
      } else {
        setComplaints([]);
        setFilteredComplaints([]);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error loading complaints:', error);
      setLoading(false);
    });

    const timeout = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => {
      off(complaintsRef);
      clearTimeout(timeout);
    };
  }, [isOpen]);

  useEffect(() => {
    let filtered = complaints;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (complaint) =>
          complaint.complainantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          complaint.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          complaint.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((complaint) => complaint.category === categoryFilter);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((complaint) => complaint.status === statusFilter);
    }

    // Filter by priority
    if (priorityFilter !== 'all') {
      filtered = filtered.filter((complaint) => complaint.priority === priorityFilter);
    }

    setFilteredComplaints(filtered);
  }, [searchTerm, categoryFilter, statusFilter, priorityFilter, complaints]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical': return 'bg-blue-100 text-blue-800';
      case 'teaching': return 'bg-green-100 text-green-800';
      case 'payment': return 'bg-purple-100 text-purple-800';
      case 'behavior': return 'bg-red-100 text-red-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_review': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'in_review': return <Eye className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const handleUpdateStatus = async (complaintId: string, newStatus: Complaint['status'], response?: string) => {
    try {
      const complaintRef = ref(database, `complaints/${complaintId}`);
      const updates: any = {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      };

      if (response) {
        updates.response = response;
        updates.resolvedBy = 'Admin';
      }

      if (newStatus === 'resolved' || newStatus === 'rejected') {
        updates.resolvedAt = new Date().toISOString();
      }

      await update(complaintRef, updates);
      alert(`Complaint ${newStatus} successfully!`);
      setSelectedComplaint(null);
      setResponseText('');
    } catch (error) {
      console.error('Error updating complaint:', error);
      alert('Failed to update complaint. Please try again.');
    }
  };

  const handleDeleteComplaint = async (complaintId: string) => {
    if (!confirm('Are you sure you want to delete this complaint?')) return;

    try {
      const complaintRef = ref(database, `complaints/${complaintId}`);
      await remove(complaintRef);
      alert('Complaint deleted successfully!');
      setSelectedComplaint(null);
    } catch (error) {
      console.error('Error deleting complaint:', error);
      alert('Failed to delete complaint. Please try again.');
    }
  };

  const calculateStats = () => {
    return {
      total: complaints.length,
      pending: complaints.filter((c) => c.status === 'pending').length,
      inReview: complaints.filter((c) => c.status === 'in_review').length,
      resolved: complaints.filter((c) => c.status === 'resolved').length,
      critical: complaints.filter((c) => c.priority === 'critical').length,
    };
  };

  const stats = calculateStats();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">Complaints Management</h2>
              <p className="text-red-100 text-sm">Handle and resolve user complaints</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-red-800 rounded-full p-1 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-600 font-medium">Total</div>
              <div className="text-2xl font-bold text-blue-900 mt-2">{stats.total}</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="text-sm text-yellow-600 font-medium">Pending</div>
              <div className="text-2xl font-bold text-yellow-900 mt-2">{stats.pending}</div>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <div className="text-sm text-indigo-600 font-medium">In Review</div>
              <div className="text-2xl font-bold text-indigo-900 mt-2">{stats.inReview}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-sm text-green-600 font-medium">Resolved</div>
              <div className="text-2xl font-bold text-green-900 mt-2">{stats.resolved}</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="text-sm text-red-600 font-medium">Critical</div>
              <div className="text-2xl font-bold text-red-900 mt-2">{stats.critical}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search complaints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="technical">Technical</option>
              <option value="teaching">Teaching</option>
              <option value="payment">Payment</option>
              <option value="behavior">Behavior</option>
              <option value="other">Other</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_review">In Review</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Complaints List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading complaints...</p>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No complaints found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredComplaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="border-2 border-gray-200 rounded-lg p-4 hover:border-red-300 transition-all bg-white"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                            complaint.priority
                          )}`}
                        >
                          {complaint.priority.toUpperCase()}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(
                            complaint.category
                          )}`}
                        >
                          {complaint.category.charAt(0).toUpperCase() + complaint.category.slice(1)}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full flex items-center ${getStatusColor(
                            complaint.status
                          )}`}
                        >
                          {getStatusIcon(complaint.status)}
                          <span className="ml-1">{complaint.status.replace('_', ' ').toUpperCase()}</span>
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{complaint.subject}</h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3 text-sm text-gray-600">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-400" />
                          {complaint.complainantName} ({complaint.complainantType})
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-gray-500">{complaint.complainantEmail}</div>
                      </div>

                      <p className="text-gray-600 text-sm mb-2">{complaint.description}</p>

                      {complaint.response && (
                        <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center text-sm font-medium text-green-800 mb-1">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Response:
                          </div>
                          <p className="text-sm text-green-900">{complaint.response}</p>
                          {complaint.resolvedBy && (
                            <div className="text-xs text-green-700 mt-1">
                              Resolved by {complaint.resolvedBy}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      {complaint.status === 'pending' && (
                        <>
                          <button
                            onClick={() => setSelectedComplaint(complaint)}
                            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors flex items-center text-sm whitespace-nowrap"
                            title="Review"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </button>
                        </>
                      )}
                      {complaint.status === 'in_review' && (
                        <>
                          <button
                            onClick={() => setSelectedComplaint(complaint)}
                            className="p-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition-colors flex items-center text-sm whitespace-nowrap"
                            title="Resolve"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Resolve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(complaint.id, 'rejected')}
                            className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors flex items-center text-sm whitespace-nowrap"
                            title="Reject"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteComplaint(complaint.id)}
                        className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                        title="Delete"
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
            {filteredComplaints.length} of {complaints.length} complaints
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>

      {/* Response Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="bg-red-600 px-6 py-4 flex justify-between items-center rounded-t-xl">
              <h3 className="text-lg font-bold text-white">Respond to Complaint</h3>
              <button
                onClick={() => {
                  setSelectedComplaint(null);
                  setResponseText('');
                }}
                className="text-white hover:bg-red-700 rounded-full p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>From:</strong> {selectedComplaint.complainantName}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Subject:</strong> {selectedComplaint.subject}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Description:</strong> {selectedComplaint.description}
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Response
                </label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={4}
                  placeholder="Type your response here..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                {selectedComplaint.status === 'pending' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedComplaint.id, 'in_review')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Mark as In Review
                  </button>
                )}
                <button
                  onClick={() => handleUpdateStatus(selectedComplaint.id, 'resolved', responseText)}
                  disabled={!responseText.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Resolve & Send Response
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintsModal;