import React, { useState } from 'react'; 

import { 
  FileText, 
  Send, 
  DollarSign, 
  BarChart3, 
  Settings,
  Download,
  Eye,
  Plus,
  Filter
} from 'lucide-react';

interface Invoice {
  id: string;
  studentId: string;
  amount: number;
  month: string;
  year: number;
  status: 'pending' | 'sent' | 'paid';
  createdAt: string;
  dueDate: string;
}

interface InvoiceSectionProps {
  teachers: any[];
  children: any[];
}

export default function InvoiceSection(props: InvoiceSectionProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  const handleSendMonthlyInvoice = async () => {
    setLoading(true);
    try {
      // Logic to send monthly invoices
      alert(`Monthly invoices for ${selectedMonth}/${selectedYear} sent successfully!`);
    } catch (error) {
      alert('Error sending invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMonthlySalary = async () => {
    setLoading(true);
    try {
      // Logic to generate monthly salary reports
      alert(`Monthly salary report for ${selectedMonth}/${selectedYear} generated successfully!`);
    } catch (error) {
      alert('Error generating salary report');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTestReports = async () => {
    setLoading(true);
    try {
      // Logic to generate test reports
      alert('Test reports generated successfully!');
    } catch (error) {
      alert('Error generating test reports');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Invoice Section</h2>
          <p className="mt-2 text-sm text-gray-600">
            Manage invoices, salaries, and financial reports
          </p>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Invoice Details */}
        <div className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Details</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Invoice Details</h3>
          <p className="text-sm text-gray-600 mb-4">View and manage invoice details</p>
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            <Eye className="h-4 w-4 inline mr-2" />
            View Details
          </button>
        </div>

        {/* Send Monthly Invoice */}
        <div className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Send className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Monthly</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Send Monthly Invoice</h3>
          <div className="space-y-2 mb-4">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full text-sm border border-gray-300 rounded px-2 py-1"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full text-sm border border-gray-300 rounded px-2 py-1"
            >
              {Array.from({ length: 5 }, (_, i) => (
                <option key={i} value={new Date().getFullYear() - 2 + i}>
                  {new Date().getFullYear() - 2 + i}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleSendMonthlyInvoice}
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Invoices'}
          </button>
        </div>

        {/* Generate Monthly Salary */}
        <div className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-emerald-600" />
            </div>
            <span className="text-sm text-gray-500">Salary</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Generate Monthly Salary</h3>
          <p className="text-sm text-gray-600 mb-4">Generate salary reports for teachers</p>
          <button
            onClick={handleGenerateMonthlySalary}
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            <Download className="h-4 w-4 inline mr-2" />
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>

        {/* Test Reports */}
        <div className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">Reports</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Test Reports</h3>
          <p className="text-sm text-gray-600 mb-4">Generate comprehensive test reports</p>
          <button
            onClick={handleGenerateTestReports}
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            <BarChart3 className="h-4 w-4 inline mr-2" />
            {loading ? 'Generating...' : 'Generate Reports'}
          </button>
        </div>

        {/* Rules */}
        <div className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Settings className="h-6 w-6 text-orange-600" />
            </div>
            <span className="text-sm text-gray-500">Settings</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Rules</h3>
          <p className="text-sm text-gray-600 mb-4">Configure invoice and payment rules</p>
          <button className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors">
            <Settings className="h-4 w-4 inline mr-2" />
            Manage Rules
          </button>
        </div>
      </div>

      {/* Recent Invoices Table */}
      <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Recent Invoices</h3>
            <div className="flex gap-2">
              <button className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded">
                <Filter className="h-4 w-4" />
              </button>
              <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                <Plus className="h-4 w-4 inline mr-1" />
                New Invoice
              </button>
            </div>
          </div>
        </div>
        <div className="p-6 text-center text-gray-500">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-medium">No invoices found</p>
          <p className="text-sm">Invoices will appear here once generated</p>
        </div>
      </div>
    </div>
  );
}