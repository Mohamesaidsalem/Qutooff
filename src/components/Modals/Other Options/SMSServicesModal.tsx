import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Send, Users, Calendar, CheckCircle, Clock, Search, Filter } from 'lucide-react';
import { ref, onValue, off, push, set } from 'firebase/database';
import { database } from '../../../firebase/config';

interface SMSServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SMSMessage {
  id: string;
  recipientType: 'all' | 'parents' | 'teachers' | 'students' | 'individual';
  recipients: string[];
  recipientNames: string[];
  message: string;
  status: 'pending' | 'sent' | 'failed' | 'scheduled';
  scheduledDate?: string;
  sentAt?: string;
  sentBy: string;
  createdAt: string;
}

interface Recipient {
  id: string;
  name: string;
  phone: string;
  type: 'parent' | 'teacher' | 'student';
}

const SMSServicesModal: React.FC<SMSServicesModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<SMSMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<SMSMessage[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [showSendForm, setShowSendForm] = useState(false);

  // Form states
  const [recipientType, setRecipientType] = useState<SMSMessage['recipientType']>('all');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [messageText, setMessageText] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [sendNow, setSendNow] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);

    // Load messages
    const messagesRef = ref(database, 'smsMessages');
    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messagesList: SMSMessage[] = Object.entries(data).map(([id, msg]: [string, any]) => ({
          id,
          ...msg,
        }));
        messagesList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setMessages(messagesList);
        setFilteredMessages(messagesList);
      } else {
        setMessages([]);
        setFilteredMessages([]);
      }
      setLoading(false);
    });

    // Load recipients (parents, teachers, students)
    const employeesRef = ref(database, 'employees');
    const familiesRef = ref(database, 'families');
    const childrenRef = ref(database, 'children');

    onValue(employeesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const teachers = Object.entries(data)
          .filter(([_, emp]: [string, any]) => emp.role === 'teacher')
          .map(([id, teacher]: [string, any]) => ({
            id,
            name: teacher.name || 'Unknown',
            phone: teacher.phone || '',
            type: 'teacher' as const,
          }));
        setRecipients((prev) => [...prev, ...teachers]);
      }
    });

    onValue(familiesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parents = Object.entries(data).map(([id, family]: [string, any]) => ({
          id,
          name: family.name || 'Unknown',
          phone: family.phone || '',
          type: 'parent' as const,
        }));
        setRecipients((prev) => [...prev, ...parents]);
      }
    });

    const timeout = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => {
      off(messagesRef);
      off(employeesRef);
      off(familiesRef);
      clearTimeout(timeout);
    };
  }, [isOpen]);

  useEffect(() => {
    let filtered = messages;

    if (searchTerm) {
      filtered = filtered.filter(
        (msg) =>
          msg.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          msg.recipientNames.some((name) => name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((msg) => msg.status === statusFilter);
    }

    setFilteredMessages(filtered);
  }, [searchTerm, statusFilter, messages]);

  const handleSendSMS = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageText.trim()) {
      alert('Please enter a message');
      return;
    }

    if (recipientType === 'individual' && selectedRecipients.length === 0) {
      alert('Please select at least one recipient');
      return;
    }

    let finalRecipients: string[] = [];
    let finalRecipientNames: string[] = [];

    if (recipientType === 'all') {
      finalRecipients = recipients.map((r) => r.id);
      finalRecipientNames = recipients.map((r) => r.name);
    } else if (recipientType === 'individual') {
      finalRecipients = selectedRecipients;
      finalRecipientNames = recipients
        .filter((r) => selectedRecipients.includes(r.id))
        .map((r) => r.name);
    } else {
      // Convert plural to singular for matching
      const typeMap: { [key: string]: 'parent' | 'teacher' | 'student' } = {
        'parents': 'parent',
        'teachers': 'teacher',
        'students': 'student'
      };
      const singularType = typeMap[recipientType];
      const filtered = recipients.filter((r) => r.type === singularType);
      finalRecipients = filtered.map((r) => r.id);
      finalRecipientNames = filtered.map((r) => r.name);
    }

    const newMessage = {
      recipientType,
      recipients: finalRecipients,
      recipientNames: finalRecipientNames,
      message: messageText,
      status: sendNow ? 'sent' : 'scheduled',
      scheduledDate: sendNow ? undefined : scheduleDate,
      sentAt: sendNow ? new Date().toISOString() : undefined,
      sentBy: 'Admin',
      createdAt: new Date().toISOString(),
    };

    try {
      const messagesRef = ref(database, 'smsMessages');
      await push(messagesRef, newMessage);
      alert(`SMS ${sendNow ? 'sent' : 'scheduled'} successfully to ${finalRecipients.length} recipient(s)!`);
      resetForm();
    } catch (error) {
      console.error('Error sending SMS:', error);
      alert('Failed to send SMS. Please try again.');
    }
  };

  const resetForm = () => {
    setRecipientType('all');
    setSelectedRecipients([]);
    setMessageText('');
    setScheduleDate('');
    setSendNow(true);
    setShowSendForm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateStats = () => {
    return {
      total: messages.length,
      sent: messages.filter((m) => m.status === 'sent').length,
      scheduled: messages.filter((m) => m.status === 'scheduled').length,
      failed: messages.filter((m) => m.status === 'failed').length,
    };
  };

  const stats = calculateStats();
  const characterCount = messageText.length;
  const smsCount = Math.ceil(characterCount / 160);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-600 to-pink-700 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <MessageSquare className="h-6 w-6 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">SMS Services</h2>
              <p className="text-pink-100 text-sm">Send notifications and updates via SMS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-pink-800 rounded-full p-1 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-600 font-medium">Total Sent</div>
              <div className="text-2xl font-bold text-blue-900 mt-2">{stats.total}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-sm text-green-600 font-medium">Delivered</div>
              <div className="text-2xl font-bold text-green-900 mt-2">{stats.sent}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="text-sm text-purple-600 font-medium">Scheduled</div>
              <div className="text-2xl font-bold text-purple-900 mt-2">{stats.scheduled}</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="text-sm text-red-600 font-medium">Failed</div>
              <div className="text-2xl font-bold text-red-900 mt-2">{stats.failed}</div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              >
                <option value="all">All Status</option>
                <option value="sent">Sent</option>
                <option value="scheduled">Scheduled</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <button
              onClick={() => setShowSendForm(!showSendForm)}
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-medium flex items-center whitespace-nowrap"
            >
              <Send className="h-5 w-5 mr-2" />
              Send New SMS
            </button>
          </div>

          {/* Send SMS Form */}
          {showSendForm && (
            <div className="mb-6 bg-gray-50 p-6 rounded-lg border-2 border-pink-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Send SMS Message</h3>
              <form onSubmit={handleSendSMS} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recipients <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={recipientType}
                      onChange={(e) => setRecipientType(e.target.value as SMSMessage['recipientType'])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                      required
                    >
                      <option value="all">All Users</option>
                      <option value="parents">All Parents</option>
                      <option value="teachers">All Teachers</option>
                      <option value="students">All Students</option>
                      <option value="individual">Select Individual</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery
                    </label>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={sendNow}
                          onChange={() => setSendNow(true)}
                          className="h-4 w-4 text-pink-600"
                        />
                        <span className="ml-2 text-sm">Send Now</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={!sendNow}
                          onChange={() => setSendNow(false)}
                          className="h-4 w-4 text-pink-600"
                        />
                        <span className="ml-2 text-sm">Schedule</span>
                      </label>
                    </div>
                  </div>
                </div>

                {!sendNow && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Schedule Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                      required={!sendNow}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    rows={4}
                    placeholder="Type your message here..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    required
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{characterCount} characters</span>
                    <span>{smsCount} SMS</span>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {sendNow ? 'Send Now' : 'Schedule SMS'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Messages History */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading messages...</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No messages sent yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="border-2 border-gray-200 rounded-lg p-4 hover:border-pink-300 transition-all bg-white"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          msg.status
                        )}`}
                      >
                        {msg.status.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-600">
                        To: {msg.recipientType === 'individual' ? msg.recipientNames.join(', ') : msg.recipientType.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <p className="text-gray-900 mb-2">{msg.message}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {msg.recipients.length} recipient(s)
                    </div>
                    {msg.sentAt && (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Sent at {new Date(msg.sentAt).toLocaleTimeString()}
                      </div>
                    )}
                    {msg.scheduledDate && (
                      <div className="flex items-center text-blue-600">
                        <Clock className="h-4 w-4 mr-1" />
                        Scheduled for {new Date(msg.scheduledDate).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t">
          <div className="text-sm text-gray-600">
            {filteredMessages.length} of {messages.length} messages
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

export default SMSServicesModal;