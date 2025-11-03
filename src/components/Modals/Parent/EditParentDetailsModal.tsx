import React, { useState } from 'react';
import { XCircle, Save } from 'lucide-react';
import { ref, update } from 'firebase/database';
import { database } from '../../../firebase/config';

export interface ParentData {
  id: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  mobile?: string;
  skype?: string;
  fee: number;
  country: string;
  city: string;
  timezone: string;
  paymentMode?: string;
  invoiceType: string;
  invoiceCycle?: string;
  currency?: string;
  belongTo?: string;
  notificationsSettings?: string;
  data?: string;
  manager?: string;
}

interface EditParentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentData: ParentData;
  onUpdate?: (familyId: string, data: Partial<ParentData>) => void | Promise<void>;
}

const COUNTRIES = [
  'AUS - Australia', 'USA - United States', 'UK - United Kingdom', 
  'CAN - Canada', 'UAE - United Arab Emirates', 'SAU - Saudi Arabia',
  'EGY - Egypt', 'PAK - Pakistan', 'IND - India'
];

const TIMEZONES = [
  'Australia/Brisbane', 'Australia/Sydney', 'Australia/Melbourne',
  'America/New_York', 'America/Los_Angeles', 'America/Chicago',
  'Europe/London', 'Europe/Paris', 'Asia/Dubai', 'Asia/Riyadh',
  'Asia/Cairo', 'Asia/Karachi', 'Asia/Kolkata'
];

const PAYMENT_MODES = ['PayPal', 'Bank Transfer', 'Credit Card', 'Cash', 'Stripe'];
const INVOICE_TYPES = ['Monthly', 'Non-Recurring', 'Quarterly', 'Yearly'];
const INVOICE_CYCLES = ['1st of every month', '15th of every month', 'Custom'];
const CURRENCIES = ['$ - USD', '€ - EUR', '£ - GBP', 'AED - UAE Dirham', 'SAR - Saudi Riyal'];
const NOTIFICATION_SETTINGS = ['Email', 'SMS', 'WhatsApp', 'None'];

export default function EditParentDetailsModal({
  isOpen,
  onClose,
  parentData,
  onUpdate
}: EditParentDetailsModalProps) {
  const [formData, setFormData] = useState({
    parentName: parentData.parentName || '',
    parentEmail: parentData.parentEmail || '',
    parentPhone: parentData.parentPhone || '',
    mobile: parentData.mobile || '',
    skypeId: parentData.skype || '',
    fee: parentData.fee || 0,
    country: parentData.country || 'AUS',
    city: parentData.city || 'Australian Eastern Standard Time (AEST)',
    timezone: parentData.timezone || 'Australia/Brisbane',
    data: parentData.data || new Date().toISOString().split('T')[0],
    paymentMode: parentData.paymentMode || 'PayPal',
    invoiceType: parentData.invoiceType || 'Monthly',
    invoiceCycle: parentData.invoiceCycle || '1st of every month',
    belongTo: parentData.belongTo || '',
    currency: parentData.currency || '$',
    notificationsSettings: parentData.notificationsSettings || 'Email',
    manager: parentData.manager || 'Gehad Husam'
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const familyRef = ref(database, `families/${parentData.id}`);
      const updateData = {
        parentName: formData.parentName,
        parentEmail: formData.parentEmail,
        parentPhone: formData.parentPhone,
        mobile: formData.mobile,
        skype: formData.skypeId,
        fee: Number(formData.fee),
        country: formData.country,
        city: formData.city,
        timezone: formData.timezone,
        data: formData.data,
        paymentMode: formData.paymentMode,
        invoiceType: formData.invoiceType,
        invoiceCycle: formData.invoiceCycle,
        belongTo: formData.belongTo,
        currency: formData.currency,
        notificationsSettings: formData.notificationsSettings,
        manager: formData.manager,
        updatedAt: new Date().toISOString()
      };
      
      await update(familyRef, updateData);

      alert('✅ Parent details updated successfully!');
      
      // Call onUpdate if provided
      if (onUpdate) {
        await onUpdate(parentData.id, updateData);
      }
      
      onClose();
    } catch (error) {
      console.error('Error updating parent:', error);
      alert('❌ Failed to update parent details');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto my-8">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-white">✏️ Edit Parent Details</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-bold text-blue-900 mb-2">Person Bio Data of {parentData.parentName}</h3>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Parent Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  TelePhone
                </label>
                <input
                  type="tel"
                  value={formData.parentPhone}
                  onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Skype ID
                </label>
                <input
                  type="text"
                  value={formData.skypeId}
                  onChange={(e) => setFormData({ ...formData, skypeId: e.target.value })}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country.split(' - ')[0]}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Time Zone <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Manager
                </label>
                <input
                  type="text"
                  value={formData.manager}
                  onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Invoice Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.invoiceType}
                  onChange={(e) => setFormData({ ...formData, invoiceType: e.target.value })}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  {INVOICE_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Belong to
                </label>
                <input
                  type="text"
                  value={formData.belongTo}
                  onChange={(e) => setFormData({ ...formData, belongTo: e.target.value })}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.parentEmail}
                  onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Mobile
                </label>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Fee
                </label>
                <input
                  type="number"
                  value={formData.fee}
                  onChange={(e) => setFormData({ ...formData, fee: Number(e.target.value) })}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Data
                </label>
                <input
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Payment Mode <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.paymentMode}
                  onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  {PAYMENT_MODES.map((mode) => (
                    <option key={mode} value={mode}>{mode}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Invoice Cycle
                </label>
                <select
                  value={formData.invoiceCycle}
                  onChange={(e) => setFormData({ ...formData, invoiceCycle: e.target.value })}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {INVOICE_CYCLES.map((cycle) => (
                    <option key={cycle} value={cycle}>{cycle}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {CURRENCIES.map((curr) => (
                    <option key={curr} value={curr.split(' - ')[0]}>
                      {curr}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Notifications Settings (Full Width) */}
          <div className="mt-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Notifications Settings
            </label>
            <select
              value={formData.notificationsSettings}
              onChange={(e) => setFormData({ ...formData, notificationsSettings: e.target.value })}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {NOTIFICATION_SETTINGS.map((setting) => (
                <option key={setting} value={setting}>{setting}</option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-xl font-bold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-xl font-bold hover:from-green-700 hover:to-green-800 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}