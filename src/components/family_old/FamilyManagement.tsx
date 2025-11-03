import React, { useState, useMemo, useEffect } from 'react';
import {
  Users, UserPlus, Search, X, Plus, Home, User, ArrowRight,
  TrendingUp, UserCheck, List, Grid
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

// Import helpers
import {
  Family,
  Child,
  isIndependentAccount,
  calculateFamilyStats,
  filterFamilies,
  filterStudents,
  DEFAULT_TIMEZONE
} from './familyHelpers';

// Import Views
import {
  FamilyTableView,
  FamilyCardsView,
  IndependentStudentsList,
  FamilyDetailsView,
  FullScreenTreeViewer
} from './FamilyViews';

// Import Modals
import {
  AssignToFamilyModal,
  EditStudentModal,
  EditParentModal,
  AddFamilyModal,
  AddMemberModal
} from './FamilyModals';

// ============================================
// PROPS INTERFACE
// ============================================
interface FamilyManagementProps {
  onViewProfile?: (parentId: string) => void;
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function FamilyManagement({ onViewProfile }: FamilyManagementProps) {
  const { user } = useAuth();
  const {
    families,
    children,
    addFamily,
    updateFamily,
    removeFamily,
    addChild,
    updateChild,
    removeChild,
    addChildToFamily,
    removeChildFromFamily,
    loading
  } = useData();

  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [activeTab, setActiveTab] = useState<'families' | 'independent'>('families');
  
  // Modal states
  const [showAddFamilyModal, setShowAddFamilyModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showFamilyDetails, setShowFamilyDetails] = useState(false);
  const [showFullScreenTree, setShowFullScreenTree] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [showEditParentModal, setShowEditParentModal] = useState(false);
  
  const [memberType, setMemberType] = useState<'parent' | 'student' | 'individual'>('parent');
  const [selectedStudent, setSelectedStudent] = useState<Child | null>(null);

  // ============================================
  // COMPUTED VALUES (MEMOIZED)
  // ============================================
  
  // Update selected family when families change
  useEffect(() => {
    if (selectedFamily) {
      const updatedFamily = families.find(f => f.id === selectedFamily.id);
      if (updatedFamily) {
        setSelectedFamily(updatedFamily);
      }
    }
  }, [families, selectedFamily?.id]);

  const userFamilies = useMemo(() => {
    if (!user) return [];
    if (user.role === 'admin' || user.role === 'super_admin') return families;
    if (user.role === 'parent') return families.filter(f => f.parentId === user.id);
    return [];
  }, [families, user]);

  const regularFamilies = useMemo(() => {
    return userFamilies.filter(f => !isIndependentAccount(f));
  }, [userFamilies]);

  const independentAccounts = useMemo(() => {
    return userFamilies.filter(f => isIndependentAccount(f));
  }, [userFamilies]);

  const independentStudents = useMemo(() => {
    const familyChildrenIds = families.flatMap(f => f.children || []);
    return children.filter(child => !familyChildrenIds.includes(child.id));
  }, [children, families]);

  const filteredFamilies = useMemo(() => {
    const familiesToFilter = activeTab === 'families' ? regularFamilies : independentAccounts;
    return filterFamilies(familiesToFilter, searchTerm);
  }, [regularFamilies, independentAccounts, activeTab, searchTerm]);

  const filteredIndependentStudents = useMemo(() => {
    const allIndependent = [
      ...independentStudents,
      ...children.filter(child => 
        independentAccounts.some(acc => acc.children?.includes(child.id))
      )
    ];
    return filterStudents(allIndependent, searchTerm);
  }, [independentStudents, independentAccounts, children, searchTerm]);

  const stats = useMemo(() => {
    return calculateFamilyStats(
      regularFamilies,
      independentAccounts,
      filteredIndependentStudents,
      children
    );
  }, [regularFamilies, independentAccounts, filteredIndependentStudents, children]);

  // ============================================
  // EVENT HANDLERS
  // ============================================

  const handleAddFamily = async (formData: any) => {
    if (!user) return;

    try {
      await addFamily({
        name: formData.name,
        parentId: user.id,
        parentName: formData.parentName,
        parentEmail: formData.parentEmail,
        parentPhone: formData.parentPhone,
        parentImage: formData.parentImage,
        timezone: formData.timezone,
        address: formData.parentAddress,
        children: [],
        status: 'active',
      });

      alert('✅ Family added successfully!');
      setShowAddFamilyModal(false);
    } catch (error) {
      console.error('Error adding family:', error);
      alert('❌ Failed to add family');
    }
  };

  const handleAddMember = async (formData: any) => {
    if (!user) return;

    try {
      if (memberType === 'student') {
        const childData: any = {
          name: formData.name,
          age: parseInt(formData.age),
          level: formData.level,
          progress: 0,
          teacherId: '',
          teacherName: 'Not Assigned',
          nextClass: '',
          parentId: selectedFamily?.id || user.id,
          phone: formData.phone || '',
          email: formData.email,
          timezone: formData.timezone,
          password: formData.password,
        };

        const childId = await addChild(childData);

        if (selectedFamily) {
          await addChildToFamily(selectedFamily.id, childId);
        }
        
        alert('✅ Student added successfully!');

      } else if (memberType === 'individual') {
        const familyId = await addFamily({
          name: `${formData.name}'s Account`,
          parentId: '',
          parentName: formData.name,
          parentEmail: formData.email,
          parentPhone: formData.phone || '',
          parentImage: formData.image || '',
          timezone: formData.timezone,
          address: '',
          children: [],
          status: 'active' as const,
        });
        
        const childId = await addChild({
          name: formData.name,
          age: parseInt(formData.age),
          level: formData.level,
          progress: 0,
          teacherId: '',
          teacherName: 'Not Assigned',
          nextClass: '',
          parentId: familyId,
          phone: formData.phone || '',
          email: formData.email,
          timezone: formData.timezone,
          password: formData.password,
        });

        await addChildToFamily(familyId, childId);
        alert('✅ Independent account created!');
      }

      setShowAddMemberModal(false);
    } catch (error) {
      console.error('Error adding member:', error);
      alert('❌ Failed to add member');
    }
  };

  const handleAssignToFamily = async (familyId: string) => {
    if (!selectedStudent) return;

    try {
      const oldFamily = families.find(f => f.children?.includes(selectedStudent.id));
      if (oldFamily) {
        await removeChildFromFamily(oldFamily.id, selectedStudent.id);
      }

      await addChildToFamily(familyId, selectedStudent.id);
      
      await updateChild(selectedStudent.id, {
        parentId: familyId
      });

      alert('✅ Student assigned to family successfully!');
      setShowAssignModal(false);
      setSelectedStudent(null);
    } catch (error) {
      console.error('Error assigning student:', error);
      alert('❌ Failed to assign student');
    }
  };

  const handleDeleteStudent = async (familyId: string, studentId: string, studentName: string) => {
    if (window.confirm(`Remove ${studentName}?`)) {
      try {
        await removeChildFromFamily(familyId, studentId);
        await removeChild(studentId);
        alert('✅ Student removed!');
      } catch (error) {
        console.error('Error removing student:', error);
        alert('❌ Failed to remove student');
      }
    }
  };

  const handleDeleteFamily = async (familyId: string, familyName: string) => {
    if (window.confirm(`Delete ${familyName}?`)) {
      try {
        await removeFamily(familyId);
        setShowFamilyDetails(false);
        setSelectedFamily(null);
        alert('✅ Family deleted!');
      } catch (error) {
        console.error('Error deleting family:', error);
        alert('❌ Failed to delete family');
      }
    }
  };

  // ✅ UPDATED: viewFamilyDetails with navigation support
  const viewFamilyDetails = (family: Family) => {
    // ✅ If onViewProfile prop exists (from AdminDashboard), use it to navigate
    if (onViewProfile) {
      console.log('🔄 Navigating to parent profile:', family.id);
      onViewProfile(family.id);
    } else {
      // Otherwise, show internal details view
      setSelectedFamily(family);
      setShowFamilyDetails(true);
    }
  };

  const viewIndependentStudentDetails = (student: Child) => {
    let studentFamily = families.find(f => f.children?.includes(student.id));
    
    if (studentFamily) {
      viewFamilyDetails(studentFamily);
    } else {
      alert('⚠️ Student family not found');
    }
  };

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Home className="h-8 w-8 text-blue-600" />
            Family Management
          </h1>
          <p className="text-gray-600">Manage families, parents, and students</p>
        </div>

        {/* STATISTICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          
          <div 
            className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500 cursor-pointer hover:shadow-md transition-all"
            onClick={() => { setActiveTab('families'); setShowFamilyDetails(false); }}
          >
            <div className="flex items-center justify-between mb-2">
              <Home className="h-5 w-5 text-blue-600" />
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalFamilies}</p>
            <p className="text-xs text-gray-600">Families</p>
          </div>

          <div 
            className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500 cursor-pointer hover:shadow-md transition-all"
            onClick={() => { setActiveTab('families'); setShowFamilyDetails(false); }}
          >
            <div className="flex items-center justify-between mb-2">
              <Users className="h-5 w-5 text-green-600" />
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
            <p className="text-xs text-gray-600">Students</p>
          </div>

          <div 
            className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500 cursor-pointer hover:shadow-md transition-all"
            onClick={() => { setActiveTab('families'); setShowFamilyDetails(false); }}
          >
            <div className="flex items-center justify-between mb-2">
              <UserCheck className="h-5 w-5 text-purple-600" />
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalParents}</p>
            <p className="text-xs text-gray-600">Parents</p>
          </div>

          <div 
            className="bg-white rounded-lg shadow p-4 border-l-4 border-gray-500 cursor-pointer hover:shadow-md transition-all"
            onClick={() => { setActiveTab('independent'); setShowFamilyDetails(false); }}
          >
            <div className="flex items-center justify-between mb-2">
              <User className="h-5 w-5 text-gray-600" />
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.independentStudents}</p>
            <p className="text-xs text-gray-600">Independent</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.averageProgress}%</p>
            <p className="text-xs text-gray-600">Avg Progress</p>
          </div>

        </div>

        {/* TABS & FILTERS */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b">
            <nav className="flex">
              <button
                onClick={() => { setActiveTab('families'); setShowFamilyDetails(false); }}
                className={`py-3 px-4 text-sm font-medium border-b-2 ${
                  activeTab === 'families'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Families ({regularFamilies.length})
                </div>
              </button>
              <button
                onClick={() => { setActiveTab('independent'); setShowFamilyDetails(false); }}
                className={`py-3 px-4 text-sm font-medium border-b-2 ${
                  activeTab === 'independent'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Independent ({stats.independentStudents})
                </div>
              </button>
            </nav>
          </div>

          <div className="p-4">
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="flex-1 w-full md:w-auto relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={activeTab === 'families' ? "Search families, parents, timezone..." : "Search students, timezone..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {!showFamilyDetails && (
                <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-3 py-1.5 rounded text-sm flex items-center gap-1 ${
                      viewMode === 'table'
                        ? 'bg-white text-blue-600 shadow'
                        : 'text-gray-600'
                    }`}
                  >
                    <List className="h-4 w-4" />
                    Table
                  </button>
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`px-3 py-1.5 rounded text-sm flex items-center gap-1 ${
                      viewMode === 'cards'
                        ? 'bg-white text-blue-600 shadow'
                        : 'text-gray-600'
                    }`}
                  >
                    <Grid className="h-4 w-4" />
                    Cards
                  </button>
                </div>
              )}

              <div className="flex gap-2">
                {activeTab === 'families' && (
                  <button
                    onClick={() => setShowAddFamilyModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Add Family
                  </button>
                )}
                <button
                  onClick={() => {
                    setMemberType('individual');
                    setShowAddMemberModal(true);
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-all flex items-center gap-2 text-sm"
                >
                  <UserPlus className="h-4 w-4" />
                  Add Independent
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        
        {/* FAMILIES TAB */}
        {activeTab === 'families' && !showFamilyDetails && (
          <>
            {viewMode === 'table' && (
              <FamilyTableView
                families={filteredFamilies}
                children={children}
                searchTerm={searchTerm}
                onViewDetails={viewFamilyDetails}
                onDeleteFamily={handleDeleteFamily}
              />
            )}

            {viewMode === 'cards' && (
              <FamilyCardsView
                families={filteredFamilies}
                children={children}
                searchTerm={searchTerm}
                onViewDetails={viewFamilyDetails}
              />
            )}
          </>
        )}

        {/* INDEPENDENT TAB */}
        {activeTab === 'independent' && !showFamilyDetails && (
          <IndependentStudentsList
            students={filteredIndependentStudents}
            searchTerm={searchTerm}
            onViewDetails={viewIndependentStudentDetails}
            onEditStudent={(student) => {
              setSelectedStudent(student);
              setShowEditStudentModal(true);
            }}
            onAssignToFamily={(student) => {
              setSelectedStudent(student);
              setShowAssignModal(true);
            }}
            onDeleteStudent={async (studentId, studentName) => {
              if (window.confirm(`Delete ${studentName}?`)) {
                const studentFamily = families.find(f => f.children?.includes(studentId));
                if (studentFamily) await removeFamily(studentFamily.id);
                await removeChild(studentId);
              }
            }}
          />
        )}

        {/* ✅ UPDATED: Only show FamilyDetailsView if onViewProfile is NOT provided */}
        {showFamilyDetails && selectedFamily && !onViewProfile && (
          <FamilyDetailsView
            family={selectedFamily}
            children={children}
            onBack={() => {
              setShowFamilyDetails(false);
              setSelectedFamily(null);
            }}
            onDeleteFamily={handleDeleteFamily}
            onEditParent={() => setShowEditParentModal(true)}
            onEditStudent={(student) => {
              setSelectedStudent(student);
              setShowEditStudentModal(true);
            }}
            onAddStudent={() => {
              setMemberType('student');
              setShowAddMemberModal(true);
            }}
            onDeleteStudent={handleDeleteStudent}
            onShowFamilyTree={() => setShowFullScreenTree(true)}
          />
        )}

        {/* MODALS */}
        {showFullScreenTree && selectedFamily && (
          <FullScreenTreeViewer
            family={selectedFamily}
            children={children}
            onClose={() => setShowFullScreenTree(false)}
          />
        )}

        {showAssignModal && selectedStudent && (
          <AssignToFamilyModal
            student={selectedStudent}
            families={regularFamilies}
            onClose={() => {
              setShowAssignModal(false);
              setSelectedStudent(null);
            }}
            onAssign={handleAssignToFamily}
          />
        )}

        {showEditStudentModal && selectedStudent && (
          <EditStudentModal
            student={selectedStudent}
            onClose={() => {
              setShowEditStudentModal(false);
              setSelectedStudent(null);
            }}
            onUpdate={async (studentId, data) => {
              try {
                await updateChild(studentId, data);
                alert('✅ Student updated successfully!');
                setShowEditStudentModal(false);
                setSelectedStudent(null);
              } catch (error) {
                console.error('Error updating student:', error);
                alert('❌ Failed to update student');
              }
            }}
          />
        )}

        {showEditParentModal && selectedFamily && (
          <EditParentModal
            family={selectedFamily}
            onClose={() => setShowEditParentModal(false)}
            onUpdate={async (familyId, data) => {
              try {
                await updateFamily(familyId, data);
                alert('✅ Parent information updated successfully!');
                setShowEditParentModal(false);
              } catch (error) {
                console.error('Error updating parent:', error);
                alert('❌ Failed to update parent');
              }
            }}
          />
        )}

        {showAddFamilyModal && (
          <AddFamilyModal
            onClose={() => setShowAddFamilyModal(false)}
            onSubmit={handleAddFamily}
          />
        )}
        

        {showAddMemberModal && (
          <AddMemberModal
            memberType={memberType as 'student' | 'individual'}
            selectedFamily={selectedFamily || undefined}
            onClose={() => setShowAddMemberModal(false)}
            onSubmit={handleAddMember}
          />
        )}

      </div>
    </div>
  );
}