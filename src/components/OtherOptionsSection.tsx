import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  TestTube, 
  Globe, 
  MessageSquare, 
  AlertTriangle,
  Eye,
  List,
  Send,
  Phone,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

interface Request {
  id: string;
  type: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  userId: string;
}

interface TestStatus {
  id: string;
  studentId: string;
  testName: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  score?: number;
  date: string;
}

interface Country {
  id: string;
  name: string;
  code: string;
  flag: string;
  timezone: string;
  currency: string;
}

interface Complaint {
  id: string;
  userId: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
}

export default function OtherOptionsSection() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [testStatuses, setTestStatuses] = useState<TestStatus[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('requests');

  const handleSendSMS = async () => {
    setLoading(true);
    try {
      // Logic to send SMS
      alert('SMS sent successfully!');
    } catch (error) {
      alert('Error sending SMS');
    } finally {
      setLoading(false);
    }
  };

  const otherOptions = [
    {
      id: 'requests',
      title: 'New Requests',
      description: 'View and manage new requests',
      icon: FileText,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100',
      count: requests.filter(r => r.status === 'pending').length
    },
    {
      id: 'tests',
      title: 'See Test Status',
      description: 'Monitor test progress and results',
      icon: TestTube,
      color: 'bg-green-500',
      bgColor: 'bg-green-100',
      count: testStatuses.filter(t => t.status === 'in-progress').length
    },
    {
      id: 'countries',
      title: 'List of Countries',
      description: 'Manage country database',
      icon: Globe,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-100',
      count: countries.length
    },
    {
      id: 'sms',
      title: 'SMS Services',
      description: 'Send SMS notifications',
      icon: MessageSquare,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-100',
      count: 0
    },
    {
      id: 'complaints',
      title: 'Complaints',
      description: 'Handle customer complaints',
      icon: AlertTriangle,
      color: 'bg-red-500',
      bgColor: 'bg-red-100',
      count: complaints.filter(c => c.status === 'open').length
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'scheduled':
      case 'open':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'approved':
      case 'completed':
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
      case 'cancelled':
      case 'closed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
      case 'scheduled':
      case 'open':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
      case 'completed':
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
      case 'cancelled':
      case 'closed':
        return 'bg-red-100 text-red-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'requests':
        return (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-lg font-medium">No new requests</p>
                <p className="text-sm">New requests will appear here</p>
              </div>
            ) : (
              requests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{request.type}</h4>
                      <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(request.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center ml-4">
                      {getStatusIcon(request.status)}
                      <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      case 'tests':
        return (
          <div className="space-y-4">
            {testStatuses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <TestTube className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-lg font-medium">No test statuses</p>
                <p className="text-sm">Test statuses will appear here</p>
              </div>
            ) : (
              testStatuses.map((test) => (
                <div key={test.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{test.testName}</h4>
                      <p className="text-sm text-gray-600 mt-1">Student ID: {test.studentId}</p>
                      {test.score && (
                        <p className="text-sm text-green-600 mt-1">Score: {test.score}%</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(test.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center ml-4">
                      {getStatusIcon(test.status)}
                      <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(test.status)}`}>
                        {test.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      case 'countries':
        return (
          <div className="space-y-4">
            {countries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Globe className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-lg font-medium">No countries added</p>
                <p className="text-sm">Countries will appear here once added</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {countries.map((country) => (
                  <div key={country.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{country.flag}</span>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{country.name}</h4>
                        <p className="text-sm text-gray-600">Code: {country.code}</p>
                        <p className="text-xs text-gray-500">
                          {country.timezone} • {country.currency}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'complaints':
        return (
          <div className="space-y-4">
            {complaints.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-lg font-medium">No complaints</p>
                <p className="text-sm">Complaints will appear here</p>
              </div>
            ) : (
              complaints.map((complaint) => (
                <div key={complaint.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="font-medium text-gray-900">{complaint.subject}</h4>
                        <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                          complaint.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          complaint.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          complaint.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {complaint.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{complaint.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(complaint.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center ml-4">
                      {getStatusIcon(complaint.status)}
                      <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(complaint.status)}`}>
                        {complaint.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Other Options</h2>
          <p className="mt-2 text-sm text-gray-600">
            Additional system management and monitoring tools
          </p>
        </div>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {otherOptions.map((option) => (
          <div 
            key={option.id} 
            className={`bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
              activeTab === option.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setActiveTab(option.id)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${option.bgColor}`}>
                <option.icon className={`h-6 w-6 text-${option.color.split('-')[1]}-600`} />
              </div>
              {option.count > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {option.count}
                </span>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{option.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{option.description}</p>
            <button className={`w-full ${option.color} text-white py-2 px-4 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center`}>
              <Eye className="h-4 w-4 mr-2" />
              View
            </button>
          </div>
        ))}

        {/* SMS Services Special Card */}
        <div className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-orange-100">
              <Phone className="h-6 w-6 text-orange-600" />
            </div>
            <span className="text-sm text-gray-500">Service</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">SMS Services</h3>
          <p className="text-sm text-gray-600 mb-4">Send bulk SMS notifications</p>
          <button
            onClick={handleSendSMS}
            disabled={loading}
            className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            <Send className="h-4 w-4 mr-2" />
            {loading ? 'Sending...' : 'Send SMS'}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">
            {otherOptions.find(opt => opt.id === activeTab)?.title || 'Details'}
          </h3>
          <p className="text-sm text-gray-600">
            {otherOptions.find(opt => opt.id === activeTab)?.description || 'View details'}
          </p>
        </div>
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}