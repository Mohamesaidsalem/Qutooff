import React, { useState, useEffect } from 'react';
import { X, Shield, Plus, Edit2, Trash2, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { ref, onValue, off, push, set, update, remove } from 'firebase/database';
import { database } from '../../../firebase/config';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Rule {
  id: string;
  title: string;
  description: string;
  category: 'attendance' | 'payment' | 'behavior' | 'academic' | 'general';
  severity: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [filteredRules, setFilteredRules] = useState<Rule[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<Rule['category']>('general');
  const [formSeverity, setFormSeverity] = useState<Rule['severity']>('medium');
  const [formIsActive, setFormIsActive] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    const rulesRef = ref(database, 'rules');

    const unsubscribe = onValue(rulesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const rulesList: Rule[] = Object.entries(data).map(([id, rule]: [string, any]) => ({
          id,
          ...rule,
        }));
        setRules(rulesList);
        setFilteredRules(rulesList);
      } else {
        setRules([]);
        setFilteredRules([]);
      }
      setLoading(false);
    });

    return () => {
      off(rulesRef);
    };
  }, [isOpen]);

  useEffect(() => {
    if (categoryFilter === 'all') {
      setFilteredRules(rules);
    } else {
      setFilteredRules(rules.filter((rule) => rule.category === categoryFilter));
    }
  }, [categoryFilter, rules]);

  const resetForm = () => {
    setFormTitle('');
    setFormDescription('');
    setFormCategory('general');
    setFormSeverity('medium');
    setFormIsActive(true);
    setEditingRule(null);
    setShowAddForm(false);
  };

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim() || !formDescription.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const newRule = {
      title: formTitle,
      description: formDescription,
      category: formCategory,
      severity: formSeverity,
      isActive: formIsActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const rulesRef = ref(database, 'rules');
      await push(rulesRef, newRule);
      alert('Rule added successfully!');
      resetForm();
    } catch (error) {
      console.error('Error adding rule:', error);
      alert('Failed to add rule. Please try again.');
    }
  };

  const handleEditRule = (rule: Rule) => {
    setEditingRule(rule);
    setFormTitle(rule.title);
    setFormDescription(rule.description);
    setFormCategory(rule.category);
    setFormSeverity(rule.severity);
    setFormIsActive(rule.isActive);
    setShowAddForm(true);
  };

  const handleUpdateRule = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingRule) return;

    if (!formTitle.trim() || !formDescription.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const updatedRule = {
      title: formTitle,
      description: formDescription,
      category: formCategory,
      severity: formSeverity,
      isActive: formIsActive,
      updatedAt: new Date().toISOString(),
    };

    try {
      const ruleRef = ref(database, `rules/${editingRule.id}`);
      await update(ruleRef, updatedRule);
      alert('Rule updated successfully!');
      resetForm();
    } catch (error) {
      console.error('Error updating rule:', error);
      alert('Failed to update rule. Please try again.');
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;

    try {
      const ruleRef = ref(database, `rules/${ruleId}`);
      await remove(ruleRef);
      alert('Rule deleted successfully!');
    } catch (error) {
      console.error('Error deleting rule:', error);
      alert('Failed to delete rule. Please try again.');
    }
  };

  const handleToggleStatus = async (rule: Rule) => {
    try {
      const ruleRef = ref(database, `rules/${rule.id}`);
      await update(ruleRef, {
        isActive: !rule.isActive,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error toggling rule status:', error);
      alert('Failed to update rule status. Please try again.');
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'attendance':
        return 'bg-blue-100 text-blue-800';
      case 'payment':
        return 'bg-green-100 text-green-800';
      case 'behavior':
        return 'bg-purple-100 text-purple-800';
      case 'academic':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">Academy Rules & Regulations</h2>
              <p className="text-red-100 text-sm">Manage system policies and guidelines</p>
            </div>
            <span className="bg-yellow-400 text-red-900 text-xs font-bold px-2 py-1 rounded-full">
              NEW
            </span>
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
          {/* Action Bar */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="attendance">Attendance</option>
                <option value="payment">Payment</option>
                <option value="behavior">Behavior</option>
                <option value="academic">Academic</option>
                <option value="general">General</option>
              </select>
            </div>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Rule
            </button>
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="mb-6 bg-gray-50 p-6 rounded-lg border-2 border-red-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingRule ? 'Edit Rule' : 'Add New Rule'}
              </h3>
              <form onSubmit={editingRule ? handleUpdateRule : handleAddRule} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rule Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Enter rule title..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Enter detailed description..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as Rule['category'])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      required
                    >
                      <option value="general">General</option>
                      <option value="attendance">Attendance</option>
                      <option value="payment">Payment</option>
                      <option value="behavior">Behavior</option>
                      <option value="academic">Academic</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Severity <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formSeverity}
                      onChange={(e) => setFormSeverity(e.target.value as Rule['severity'])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      required
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formIsActive}
                        onChange={(e) => setFormIsActive(e.target.checked)}
                        className="h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Active Rule</span>
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
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingRule ? 'Update Rule' : 'Add Rule'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Rules List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading rules...</p>
            </div>
          ) : filteredRules.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No rules found</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-4 text-red-600 hover:text-red-700 font-medium"
              >
                Add your first rule
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRules.map((rule) => (
                <div
                  key={rule.id}
                  className={`border-2 rounded-lg p-4 transition-all ${
                    rule.isActive
                      ? 'border-gray-200 bg-white hover:border-red-300'
                      : 'border-gray-200 bg-gray-50 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{rule.title}</h3>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(
                            rule.category
                          )}`}
                        >
                          {rule.category.charAt(0).toUpperCase() + rule.category.slice(1)}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(
                            rule.severity
                          )}`}
                        >
                          {rule.severity.toUpperCase()}
                        </span>
                        {rule.isActive ? (
                          <span className="flex items-center text-green-600 text-xs font-medium">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Active
                          </span>
                        ) : (
                          <span className="flex items-center text-gray-500 text-xs font-medium">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{rule.description}</p>
                      <div className="text-xs text-gray-500">
                        Last updated: {new Date(rule.updatedAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleToggleStatus(rule)}
                        className={`p-2 rounded-lg transition-colors ${
                          rule.isActive
                            ? 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                            : 'bg-green-100 hover:bg-green-200 text-green-600'
                        }`}
                        title={rule.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {rule.isActive ? (
                          <AlertCircle className="h-5 w-5" />
                        ) : (
                          <CheckCircle className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEditRule(rule)}
                        className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                        title="Edit Rule"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                        title="Delete Rule"
                      >
                        <Trash2 className="h-5 w-5" />
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
            {filteredRules.length} rule(s) • {rules.filter((r) => r.isActive).length} active
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

export default RulesModal;