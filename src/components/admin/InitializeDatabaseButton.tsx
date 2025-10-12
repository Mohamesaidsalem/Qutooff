import React, { useState } from 'react';
import { Database, Loader, CheckCircle, XCircle } from 'lucide-react';
import initializeFirebaseData from '../../utils/InitializeFirebaseData';

/**
 * Component with button to initialize Firebase database
 * Add this temporarily to your admin dashboard or a settings page
 */
export default function InitializeDatabaseButton() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleInitialize = async () => {
    if (!window.confirm('⚠️ This will create default data in Firebase. Continue?')) {
      return;
    }

    setLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      await initializeFirebaseData();
      setStatus('success');
      setMessage('✅ Database initialized successfully! Please refresh the page.');
      
      // Auto refresh after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      setStatus('error');
      setMessage(`❌ Error: ${error.message}`);
      console.error('Initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-blue-200 p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-blue-100 p-3 rounded-xl">
          <Database className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Initialize Database</h2>
          <p className="text-sm text-gray-600">Create default teachers, sample data, and test accounts</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h3 className="font-semibold text-blue-900 mb-2">This will create:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✅ 3 Default Teachers</li>
          <li>✅ 2 Sample Children (for testing)</li>
          <li>✅ 3 Sample Classes</li>
          <li>✅ 2 Sample Invoices</li>
        </ul>
      </div>

      {status === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="text-sm text-green-800">{message}</p>
        </div>
      )}

      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-center gap-3">
          <XCircle className="h-5 w-5 text-red-600" />
          <p className="text-sm text-red-800">{message}</p>
        </div>
      )}

      <button
        onClick={handleInitialize}
        disabled={loading || status === 'success'}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader className="h-5 w-5 animate-spin" />
            Initializing Database...
          </>
        ) : status === 'success' ? (
          <>
            <CheckCircle className="h-5 w-5" />
            Completed! Refreshing...
          </>
        ) : (
          <>
            <Database className="h-5 w-5" />
            Initialize Firebase Database
          </>
        )}
      </button>

      <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-xs text-yellow-800">
          <strong>⚠️ Note:</strong> Run this only once! Sample data uses test parent ID "parent-test-001". 
          Replace with actual parent IDs after user registration.
        </p>
      </div>
    </div>
  );
}