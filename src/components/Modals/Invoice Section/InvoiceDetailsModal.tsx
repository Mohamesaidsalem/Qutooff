import React, { useState, useEffect } from 'react';
import { X, FileText, Calendar, DollarSign, User, Search, Download, Eye } from 'lucide-react';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../../../firebase/config';

interface InvoiceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Invoice {
  id: string;
  familyId: string;
  familyName: string;
  month: string;
  year: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  paidDate?: string;
  studentCount: number;
}

const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({ isOpen, onClose }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    const invoicesRef = ref(database, 'invoices');

    const unsubscribe = onValue(invoicesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const invoicesList: Invoice[] = Object.entries(data).map(([id, invoice]: [string, any]) => ({
          id,
          ...invoice,
        }));
        setInvoices(invoicesList);
        setFilteredInvoices(invoicesList);
      } else {
        setInvoices([]);
        setFilteredInvoices([]);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error loading invoices:', error);
      setLoading(false);
    });

    // Set timeout to stop loading after 2 seconds if no response
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => {
      off(invoicesRef);
      clearTimeout(timeout);
    };
  }, [isOpen]);

  useEffect(() => {
    let filtered = invoices;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (invoice) =>
          invoice.familyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((invoice) => invoice.status === statusFilter);
    }

    setFilteredInvoices(filtered);
  }, [searchTerm, statusFilter, invoices]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'pending':
        return 'Pending';
      case 'overdue':
        return 'Overdue';
      default:
        return status;
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    // Logic to download invoice as PDF
    console.log('Downloading invoice:', invoice.id);
    alert(`Downloading invoice ${invoice.id}...`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-white" />
            <h2 className="text-xl font-bold text-white">Invoice Details</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-800 rounded-full p-1 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by family name or invoice ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-600 font-medium">Total Invoices</div>
              <div className="text-2xl font-bold text-blue-900">{invoices.length}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-sm text-green-600 font-medium">Paid</div>
              <div className="text-2xl font-bold text-green-900">
                {invoices.filter((inv) => inv.status === 'paid').length}
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="text-sm text-yellow-600 font-medium">Pending</div>
              <div className="text-2xl font-bold text-yellow-900">
                {invoices.filter((inv) => inv.status === 'pending').length}
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="text-sm text-red-600 font-medium">Overdue</div>
              <div className="text-2xl font-bold text-red-900">
                {invoices.filter((inv) => inv.status === 'overdue').length}
              </div>
            </div>
          </div>

          {/* Invoices Table */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading invoices...</p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No invoices found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Invoice ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Family
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Period
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Due Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">
                        #{invoice.id.substring(0, 8)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          {invoice.familyName}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          {invoice.month} {invoice.year}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                          {invoice.amount.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">{invoice.dueDate}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            invoice.status
                          )}`}
                        >
                          {getStatusText(invoice.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewInvoice(invoice)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDownloadInvoice(invoice)}
                            className="text-green-600 hover:text-green-800 transition-colors"
                            title="Download Invoice"
                          >
                            <Download className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end border-t">
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

export default InvoiceDetailsModal;