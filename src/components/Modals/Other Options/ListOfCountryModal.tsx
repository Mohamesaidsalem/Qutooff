import React, { useState, useEffect } from 'react';
import { X, Globe, Plus, Edit2, Trash2, Save, Search, Users, DollarSign } from 'lucide-react';
import { ref, onValue, off, push, set, update, remove } from 'firebase/database';
import { database } from '../../../firebase/config';

interface ListOfCountryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Country {
  id: string;
  name: string;
  code: string; // ISO code (e.g., EG, SA, US)
  currency: string;
  timezone: string;
  studentCount: number;
  teacherCount: number;
  isActive: boolean;
  createdAt: string;
}

const ListOfCountryModal: React.FC<ListOfCountryModalProps> = ({ isOpen, onClose }) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formCurrency, setFormCurrency] = useState('');
  const [formTimezone, setFormTimezone] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    const countriesRef = ref(database, 'countries');

    const unsubscribe = onValue(countriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const countriesList: Country[] = Object.entries(data).map(([id, country]: [string, any]) => ({
          id,
          name: country.name || 'Unknown',
          code: country.code || '',
          currency: country.currency || '',
          timezone: country.timezone || '',
          studentCount: country.studentCount || 0,
          teacherCount: country.teacherCount || 0,
          isActive: country.isActive !== undefined ? country.isActive : true,
          createdAt: country.createdAt || new Date().toISOString(),
        }));
        countriesList.sort((a, b) => a.name.localeCompare(b.name));
        setCountries(countriesList);
        setFilteredCountries(countriesList);
      } else {
        setCountries([]);
        setFilteredCountries([]);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error loading countries:', error);
      setLoading(false);
    });

    const timeout = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => {
      off(countriesRef);
      clearTimeout(timeout);
    };
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = countries.filter(
        (country) =>
          country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          country.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCountries(filtered);
    } else {
      setFilteredCountries(countries);
    }
  }, [searchTerm, countries]);

  const resetForm = () => {
    setFormName('');
    setFormCode('');
    setFormCurrency('');
    setFormTimezone('');
    setFormIsActive(true);
    setEditingCountry(null);
    setShowAddForm(false);
  };

  const handleAddCountry = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim() || !formCode.trim()) {
      alert('Please fill in country name and code');
      return;
    }

    const newCountry = {
      name: formName,
      code: formCode.toUpperCase(),
      currency: formCurrency,
      timezone: formTimezone,
      studentCount: 0,
      teacherCount: 0,
      isActive: formIsActive,
      createdAt: new Date().toISOString(),
    };

    try {
      const countriesRef = ref(database, 'countries');
      await push(countriesRef, newCountry);
      alert('Country added successfully!');
      resetForm();
    } catch (error) {
      console.error('Error adding country:', error);
      alert('Failed to add country. Please try again.');
    }
  };

  const handleEditCountry = (country: Country) => {
    setEditingCountry(country);
    setFormName(country.name);
    setFormCode(country.code);
    setFormCurrency(country.currency);
    setFormTimezone(country.timezone);
    setFormIsActive(country.isActive);
    setShowAddForm(true);
  };

  const handleUpdateCountry = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingCountry) return;

    if (!formName.trim() || !formCode.trim()) {
      alert('Please fill in country name and code');
      return;
    }

    const updatedCountry = {
      name: formName,
      code: formCode.toUpperCase(),
      currency: formCurrency,
      timezone: formTimezone,
      isActive: formIsActive,
    };

    try {
      const countryRef = ref(database, `countries/${editingCountry.id}`);
      await update(countryRef, updatedCountry);
      alert('Country updated successfully!');
      resetForm();
    } catch (error) {
      console.error('Error updating country:', error);
      alert('Failed to update country. Please try again.');
    }
  };

  const handleDeleteCountry = async (countryId: string, countryName: string) => {
    if (!confirm(`Are you sure you want to delete ${countryName}?`)) return;

    try {
      const countryRef = ref(database, `countries/${countryId}`);
      await remove(countryRef);
      alert('Country deleted successfully!');
    } catch (error) {
      console.error('Error deleting country:', error);
      alert('Failed to delete country. Please try again.');
    }
  };

  const handleToggleStatus = async (country: Country) => {
    try {
      const countryRef = ref(database, `countries/${country.id}`);
      await update(countryRef, { isActive: !country.isActive });
    } catch (error) {
      console.error('Error toggling country status:', error);
      alert('Failed to update country status. Please try again.');
    }
  };

  const calculateStats = () => {
    return {
      total: countries.length,
      active: countries.filter((c) => c.isActive).length,
      totalStudents: countries.reduce((sum, c) => sum + c.studentCount, 0),
      totalTeachers: countries.reduce((sum, c) => sum + c.teacherCount, 0),
    };
  };

  const stats = calculateStats();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Globe className="h-6 w-6 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">List of Countries</h2>
              <p className="text-teal-100 text-sm">Manage countries and regions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-teal-800 rounded-full p-1 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
              <div className="text-sm text-teal-600 font-medium">Total Countries</div>
              <div className="text-2xl font-bold text-teal-900 mt-2">{stats.total}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-sm text-green-600 font-medium">Active Countries</div>
              <div className="text-2xl font-bold text-green-900 mt-2">{stats.active}</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-600 font-medium">Total Students</div>
              <div className="text-2xl font-bold text-blue-900 mt-2">{stats.totalStudents}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="text-sm text-purple-600 font-medium">Total Teachers</div>
              <div className="text-2xl font-bold text-purple-900 mt-2">{stats.totalTeachers}</div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by country name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Country
            </button>
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="mb-6 bg-gray-50 p-6 rounded-lg border-2 border-teal-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingCountry ? 'Edit Country' : 'Add New Country'}
              </h3>
              <form onSubmit={editingCountry ? handleUpdateCountry : handleAddCountry} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g., Egypt"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value)}
                      placeholder="e.g., EG"
                      maxLength={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 uppercase"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <input
                      type="text"
                      value={formCurrency}
                      onChange={(e) => setFormCurrency(e.target.value)}
                      placeholder="e.g., EGP, USD"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <input
                      type="text"
                      value={formTimezone}
                      onChange={(e) => setFormTimezone(e.target.value)}
                      placeholder="e.g., GMT+2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formIsActive}
                        onChange={(e) => setFormIsActive(e.target.checked)}
                        className="h-4 w-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Active Country</span>
                    </label>
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
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingCountry ? 'Update Country' : 'Add Country'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Countries Table */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading countries...</p>
            </div>
          ) : filteredCountries.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Globe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No countries found</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-4 text-teal-600 hover:text-teal-700 font-medium"
              >
                Add your first country
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Country
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Code
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Currency
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Timezone
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Students
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Teachers
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
                  {filteredCountries.map((country) => (
                    <tr key={country.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm">
                        <div className="flex items-center">
                          <Globe className="h-5 w-5 text-teal-600 mr-2" />
                          <span className="font-medium text-gray-900">{country.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <span className="px-2 py-1 bg-teal-100 text-teal-800 text-xs font-semibold rounded">
                          {country.code}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                          {country.currency || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">{country.timezone || 'N/A'}</td>
                      <td className="px-4 py-4 text-sm">
                        <div className="flex items-center text-blue-600 font-medium">
                          <Users className="h-4 w-4 mr-1" />
                          {country.studentCount}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <div className="flex items-center text-purple-600 font-medium">
                          <Users className="h-4 w-4 mr-1" />
                          {country.teacherCount}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleToggleStatus(country)}
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            country.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {country.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditCountry(country)}
                            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                            title="Edit Country"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCountry(country.id, country.name)}
                            className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                            title="Delete Country"
                          >
                            <Trash2 className="h-4 w-4" />
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
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t">
          <div className="text-sm text-gray-600">
            {filteredCountries.length} of {countries.length} countries
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

export default ListOfCountryModal;