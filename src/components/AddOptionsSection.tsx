import React, { useState } from 'react';
import { 
  UserPlus, 
  Users, 
  Globe, 
  CheckSquare, 
  Truck,
  Calendar,
  Plus,
  Building,
  MapPin,
  Briefcase
} from 'lucide-react';

interface AddOptionsSectionProps {
  onAddEmployee: () => void;
  onAddFamily: () => void;
  onAddCountry: () => void;
  onAddTask: () => void;
  onAddVendor: () => void;
  onAddYear: () => void;
}

export default function AddOptionsSection({
  onAddEmployee,
  onAddFamily,
  onAddCountry,
  onAddTask,
  onAddVendor,
  onAddYear
}: AddOptionsSectionProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = async (action: () => void, actionName: string) => {
    setLoading(actionName);
    try {
      await action();
    } catch (error) {
      console.error(`Error in ${actionName}:`, error);
    } finally {
      setLoading(null);
    }
  };

  const addOptions = [
    {
      id: 'employee',
      title: 'Add New Employee',
      description: 'Add new staff members and employees',
      icon: UserPlus,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100',
      action: onAddEmployee
    },
    {
      id: 'family',
      title: 'Add New Family',
      description: 'Register new family accounts',
      icon: Users,
      color: 'bg-green-500',
      bgColor: 'bg-green-100',
      action: onAddFamily
    },
    {
      id: 'country',
      title: 'Add New Country',
      description: 'Add countries to the system',
      icon: Globe,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-100',
      action: onAddCountry
    },
    {
      id: 'task',
      title: 'Add New Task',
      description: 'Create new tasks and assignments',
      icon: CheckSquare,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-100',
      action: onAddTask
    },
    {
      id: 'vendor',
      title: 'Add New Vendor',
      description: 'Register new vendors and suppliers',
      icon: Truck,
      color: 'bg-red-500',
      bgColor: 'bg-red-100',
      action: onAddVendor
    },
    {
      id: 'year',
      title: 'Add New Year',
      description: 'Add new academic year',
      icon: Calendar,
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-100',
      action: onAddYear
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Add Options</h2>
          <p className="mt-2 text-sm text-gray-600">
            Quick access to add new entities to the system
          </p>
        </div>
      </div>

      {/* Add Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {addOptions.map((option) => (
          <div key={option.id} className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${option.bgColor}`}>
                <option.icon className={`h-6 w-6 text-${option.color.split('-')[1]}-600`} />
              </div>
              <span className="text-sm text-gray-500">Add</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{option.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{option.description}</p>
            <button
              onClick={() => handleAction(option.action, option.id)}
              disabled={loading === option.id}
              className={`w-full ${option.color} text-white py-2 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center`}
            >
              <Plus className="h-4 w-4 mr-2" />
              {loading === option.id ? 'Adding...' : 'Add New'}
            </button>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">System Statistics</h3>
          <p className="text-sm text-gray-600">Overview of system entities</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Building className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-600">Employees</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-600">Families</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <MapPin className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-sm text-gray-600">Countries</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <CheckSquare className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">0</div>
              <div className="text-sm text-gray-600">Tasks</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <Briefcase className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">0</div>
              <div className="text-sm text-gray-600">Vendors</div>
            </div>
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <Calendar className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-indigo-600">1</div>
              <div className="text-sm text-gray-600">Academic Years</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}