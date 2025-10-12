import React, { useState } from 'react';
import { ChevronDown, Settings, Shield } from 'lucide-react';

const DropdownDemo: React.FC = () => {
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);

  const handleDropdownItemClick = (action: string) => {
    setShowOptionsDropdown(false);
    alert(`تم النقر على: ${action}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            تجربة القائمة المنسدلة للإدارة
          </h1>
          <p className="text-gray-600 mb-6">
            هذه صفحة تجريبية لاختبار القائمة المنسدلة متعددة الأعمدة للنظام الإداري
          </p>
          
          {/* Mock Header */}
          <div className="bg-white border-b border-gray-200 p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold text-emerald-600">
                Quraan Academy
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-4">
                  <div className="text-gray-600 hover:text-blue-600 font-medium transition-colors flex items-center">
                    <Settings className="h-4 w-4 mr-1" /> System
                  </div>
                  
                  {/* Options Dropdown */}
                  <div 
                    className="relative"
                    onMouseEnter={() => setShowOptionsDropdown(true)}
                    onMouseLeave={() => setShowOptionsDropdown(false)}
                  >
                    <button className="text-gray-600 hover:text-blue-600 font-medium transition-colors flex items-center">
                      Options
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </button>
                    
                    {showOptionsDropdown && (
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-gray-900 text-white rounded-lg shadow-lg z-50 p-6 min-w-[800px] animate-fadeInDown">
                        <div className="grid grid-cols-4 gap-8">
                          {/* Invoice Section */}
                          <div className="flex flex-col min-w-[160px]">
                            <h3 className="text-sm font-semibold text-white mb-3 pb-2 border-b border-gray-700 uppercase tracking-wide">Invoice Section</h3>
                            <button onClick={() => handleDropdownItemClick('تفاصيل الفاتورة')} className="block text-sm py-2 px-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200 ease-in-out">
                              Invoice Details
                            </button>
                            <button onClick={() => handleDropdownItemClick('إرسال الفاتورة الشهرية')} className="block text-sm py-2 px-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200 ease-in-out">
                              Send Monthly Invoice
                            </button>
                            <button onClick={() => handleDropdownItemClick('إنشاء الراتب الشهري')} className="block text-sm py-2 px-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200 ease-in-out">
                              Generate Monthly Salary
                            </button>
                            <button onClick={() => handleDropdownItemClick('تقارير الاختبارات')} className="block text-sm py-2 px-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200 ease-in-out">
                              Test Reports
                            </button>
                            <button onClick={() => handleDropdownItemClick('القواعد')} className="block text-sm py-2 px-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200 ease-in-out flex items-center gap-2">
                              <span>Rules</span>
                              <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">New</span>
                            </button>
                          </div>

                          {/* Weekly Classes */}
                          <div className="flex flex-col min-w-[160px]">
                            <h3 className="text-sm font-semibold text-white mb-3 pb-2 border-b border-gray-700 uppercase tracking-wide">Weekly Classes</h3>
                            <button onClick={() => handleDropdownItemClick('إنشاء الصفوف الأسبوعية')} className="block text-sm py-2 px-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200 ease-in-out">
                              Create Weekly Classes
                            </button>
                            <button onClick={() => handleDropdownItemClick('تحديث الصفوف الأسبوعية')} className="block text-sm py-2 px-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200 ease-in-out">
                              Update Weekly Classes
                            </button>
                            <button onClick={() => handleDropdownItemClick('جدولة صف متقدم')} className="block text-sm py-2 px-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200 ease-in-out">
                              Schedule Advance Class
                            </button>
                            <button onClick={() => handleDropdownItemClick('العطل الرسمية')} className="block text-sm py-2 px-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200 ease-in-out">
                              Public Holidays
                            </button>
                            <button onClick={() => handleDropdownItemClick('تقرير راتب الصفوف')} className="block text-sm py-2 px-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200 ease-in-out">
                              Salary Class Report
                            </button>
                            <button onClick={() => handleDropdownItemClick('تقرير الصفوف اليومية')} className="block text-sm py-2 px-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200 ease-in-out">
                              Daily Class Report
                            </button>
                          </div>

                          {/* Add Options */}
                          <div className="flex flex-col min-w-[160px]">
                            <h3 className="text-sm font-semibold text-white mb-3 pb-2 border-b border-gray-700 uppercase tracking-wide">Add Options</h3>
                            <button onClick={() => handleDropdownItemClick('إضافة موظف جديد')} className="block text-sm py-2 px-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200 ease-in-out">
                              Add New Employee
                            </button>
                            <button onClick={() => handleDropdownItemClick('إضافة عائلة جديدة')} className="block text-sm py-2 px-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200 ease-in-out">
                              Add New Family
                            </button>
                            <button onClick={() => handleDropdownItemClick('إضافة دولة جديدة')} className="block text-sm py-2 px-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200 ease-in-out">
                              Add New Country
                            </button>
                            <button onClick={() => handleDropdownItemClick('إضافة مهمة جديدة')} className="block text-sm py-2 px-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200 ease-in-out">
                              Add New Task
                            </button>
                            <button onClick={() => handleDropdownItemClick('إضافة مورد جديد')} className="block text-sm py-2 px-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200 ease-in-out">
                              Add New Vendor
                            </button>
                            <button onClick={() => handleDropdownItemClick('إضافة سنة جديدة')} className="block text-sm py-2 px-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200 ease-in-out">
                              Add New Year
                            </button>
                          </div>

                          {/* Other Options */}
                          <div className="flex flex-col min-w-[160px]">
                            <h3 className="text-sm font-semibold text-white mb-3 pb-2 border-b border-gray-700 uppercase tracking-wide">Other Options</h3>
                            <button onClick={() => handleDropdownItemClick('الطلبات الجديدة')} className="block text-sm py-2 px-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200 ease-in-out">
                              New Requests
                            </button>
                            <button onClick={() => handleDropdownItemClick('حالة الاختبار')} className="block text-sm py-2 px-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200 ease-in-out">
                              See Test Status
                            </button>
                            <button onClick={() => handleDropdownItemClick('قائمة الدول')} className="block text-sm py-2 px-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200 ease-in-out">
                              List of Country
                            </button>
                            <button onClick={() => handleDropdownItemClick('خدمات الرسائل النصية')} className="block text-sm py-2 px-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200 ease-in-out">
                              SMS Services
                            </button>
                            <button onClick={() => handleDropdownItemClick('الشكاوى')} className="block text-sm py-2 px-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200 ease-in-out">
                              Complaints
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <span className="text-sm font-bold px-2 py-1 rounded-full text-purple-600 bg-purple-50">
                      <Shield className="h-3 w-3 inline mr-1" />
                      Admin
                    </span>
                    <div className="text-xs text-gray-500 mt-1">Test User</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-3">
            كيفية الاستخدام:
          </h2>
          <ul className="list-disc list-inside text-blue-800 space-y-2">
            <li>مرر الماوس فوق كلمة "Options" في الشريط العلوي</li>
            <li>ستظهر القائمة المنسدلة بأربعة أعمدة</li>
            <li>انقر على أي عنصر لرؤية رسالة تأكيد</li>
            <li>القائمة ستختفي عند إبعاد الماوس عنها</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DropdownDemo;