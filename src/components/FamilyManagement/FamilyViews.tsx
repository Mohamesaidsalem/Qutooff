import React from 'react';
import {
  Users, Home, Eye, Trash2, Globe, ArrowRight, Edit,
  Mail, Phone, Clock, MapPin, GraduationCap, Baby,
  TrendingUp, User, Calendar, LinkIcon, X
} from 'lucide-react';
import { Child, Family, getFamilyChildren, isIndependentAccount } from './familyHelpers';

// ============================================
// FAMILY TABLE VIEW
// ============================================

interface FamilyTableViewProps {
  families: Family[];
  children: Child[];
  searchTerm: string;
  onViewDetails: (family: Family) => void;
  onDeleteFamily: (familyId: string, familyName: string) => void;
}

export const FamilyTableView: React.FC<FamilyTableViewProps> = ({
  families,
  children,
  searchTerm,
  onViewDetails,
  onDeleteFamily
}) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Family</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Parent</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Contact</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Timezone</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Students</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {families.map((family) => (
            <tr key={family.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="font-medium text-gray-900">{family.name}</div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <img
                    src={family.parentImage || 'https://i.pravatar.cc/150?img=1'}
                    alt={family.parentName}
                    className="h-8 w-8 rounded-full"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{family.parentName}</div>
                    <div className="text-xs text-gray-500">{family.parentEmail}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">{family.parentPhone}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1 text-sm">
                  <Globe className="h-3 w-3 text-gray-600" />
                  {family.timezone}
                </div>
              </td>
              <td className="px-4 py-3 text-center font-bold text-blue-600">
                {family.children?.length || 0}
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-1">
                  <button
                    onClick={() => onViewDetails(family)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDeleteFamily(family.id, family.name)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {families.length === 0 && (
        <div className="text-center py-12">
          <Home className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {searchTerm ? `No families found for "${searchTerm}"` : 'No families found'}
          </p>
        </div>
      )}
    </div>
  );
};

// ============================================
// FAMILY CARDS VIEW
// ============================================

interface FamilyCardsViewProps {
  families: Family[];
  children: Child[];
  searchTerm: string;
  onViewDetails: (family: Family) => void;
}

export const FamilyCardsView: React.FC<FamilyCardsViewProps> = ({
  families,
  children,
  searchTerm,
  onViewDetails
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {families.map((family) => (
        <div 
          key={family.id} 
          className="bg-white rounded-lg shadow border hover:shadow-md transition-all cursor-pointer"
          onClick={() => onViewDetails(family)}
        >
          <div className="p-4 bg-blue-500 text-white rounded-t-lg">
            <h3 className="font-bold truncate">{family.name}</h3>
            <div className="flex items-center gap-1 text-xs opacity-90 mt-1">
              <Globe className="h-3 w-3" />
              {family.timezone}
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <img
                src={family.parentImage || 'https://i.pravatar.cc/150?img=1'}
                alt={family.parentName}
                className="h-10 w-10 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{family.parentName}</p>
                <p className="text-xs text-gray-500 truncate">{family.parentEmail}</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center gap-1 text-sm">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="font-medium">{getFamilyChildren(family, children).length}</span>
                <span className="text-gray-500 text-xs">students</span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      ))}

      {families.length === 0 && (
        <div className="col-span-full text-center py-12">
          <Home className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {searchTerm ? `No families found for "${searchTerm}"` : 'No families found'}
          </p>
        </div>
      )}
    </div>
  );
};

// ============================================
// INDEPENDENT STUDENTS LIST
// ============================================

interface IndependentStudentsListProps {
  students: Child[];
  searchTerm: string;
  onViewDetails: (student: Child) => void;
  onEditStudent: (student: Child) => void;
  onAssignToFamily: (student: Child) => void;
  onDeleteStudent: (studentId: string, studentName: string) => void;
}

export const IndependentStudentsList: React.FC<IndependentStudentsListProps> = ({
  students,
  searchTerm,
  onViewDetails,
  onEditStudent,
  onAssignToFamily,
  onDeleteStudent
}) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Student</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Details</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Contact</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Timezone</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Teacher</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Progress</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {students.map((student) => (
            <tr key={student.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gray-500 flex items-center justify-center text-white font-bold text-sm">
                    {student.name.charAt(0)}
                  </div>
                  <div className="font-medium text-gray-900">{student.name}</div>
                </div>
              </td>
              <td className="px-4 py-3 text-sm">
                <div>{student.age} years</div>
                <div className="text-gray-500">{student.level}</div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {student.email && <div>{student.email}</div>}
                {student.phone && <div>{student.phone}</div>}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1 text-sm">
                  <Clock className="h-3 w-3 text-gray-600" />
                  {student.timezone || 'Not set'}
                </div>
              </td>
              <td className="px-4 py-3 text-sm">{student.teacherName}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${student.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium">{student.progress}%</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-1">
                  <button
                    onClick={() => onViewDetails(student)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onEditStudent(student)}
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onAssignToFamily(student)}
                    className="p-1.5 text-purple-600 hover:bg-purple-50 rounded"
                    title="Assign to Family"
                  >
                    <LinkIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDeleteStudent(student.id, student.name)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {students.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {searchTerm ? `No students found for "${searchTerm}"` : 'No independent students'}
          </p>
        </div>
      )}
    </div>
  );
};

// ============================================
// FAMILY DETAILS VIEW
// ============================================

interface FamilyDetailsViewProps {
  family: Family;
  children: Child[];
  onBack: () => void;
  onDeleteFamily: (familyId: string, familyName: string) => void;
  onEditParent: () => void;
  onEditStudent: (student: Child) => void;
  onAddStudent: () => void;
  onDeleteStudent: (familyId: string, studentId: string, studentName: string) => void;
  onShowFamilyTree: () => void;
}

export const FamilyDetailsView: React.FC<FamilyDetailsViewProps> = ({
  family,
  children,
  onBack,
  onDeleteFamily,
  onEditParent,
  onEditStudent,
  onAddStudent,
  onDeleteStudent,
  onShowFamilyTree
}) => {
  const familyChildren = getFamilyChildren(family, children);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow hover:shadow-md transition-all border border-gray-200"
        >
          <ArrowRight className="h-5 w-5 text-blue-600 rotate-180" />
          <span className="font-medium text-gray-900">Back to List</span>
        </button>
      </div>

      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{family.name}</h2>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                {family.timezone}
              </div>
              {family.address && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {family.address}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => onDeleteFamily(family.id, family.name)}
            className="text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Parent Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Parent Information</h3>
            <button
              onClick={onEditParent}
              className="text-blue-600 hover:bg-blue-50 p-1.5 rounded"
            >
              <Edit className="h-4 w-4" />
            </button>
          </div>

          <div className="text-center mb-4">
            <img
              src={family.parentImage || 'https://i.pravatar.cc/150?img=1'}
              alt={family.parentName}
              className="h-20 w-20 rounded-full mx-auto mb-3 border-2 border-gray-200"
            />
            <h4 className="font-bold text-gray-900">{family.parentName}</h4>
            <p className="text-sm text-gray-600">Parent/Guardian</p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <Mail className="h-4 w-4 text-gray-600" />
              <span className="truncate">{family.parentEmail}</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <Phone className="h-4 w-4 text-gray-600" />
              <span>{family.parentPhone}</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
              <Globe className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">{family.timezone}</span>
            </div>
            {family.address && (
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <MapPin className="h-4 w-4 text-gray-600" />
                <span className="text-xs">{family.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Students Card */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">
              Students ({familyChildren.length})
            </h3>
            {!isIndependentAccount(family) && (
              <button
                onClick={onAddStudent}
                className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 flex items-center gap-1 text-sm"
              >
                <Users className="h-4 w-4" />
                Add Student
              </button>
            )}
          </div>

          {familyChildren.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
              <Baby className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No students yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {familyChildren.map((child) => (
                <div key={child.id} className="border rounded-lg p-4 hover:border-blue-300 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                        {child.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{child.name}</h4>
                        <p className="text-xs text-gray-600">{child.age} yrs • {child.level}</p>
                        {child.timezone && (
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            {child.timezone}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => onEditStudent(child)}
                        className="text-blue-600 hover:bg-blue-50 p-1.5 rounded"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeleteStudent(family.id, child.id, child.name)}
                        className="text-red-600 hover:bg-red-50 p-1.5 rounded"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-bold text-blue-600">{child.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full"
                          style={{ width: `${child.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {child.teacherName && child.teacherName !== 'Not Assigned' && (
                      <div className="flex items-center gap-2 text-xs bg-gray-50 p-2 rounded">
                        <GraduationCap className="h-3 w-3 text-gray-600" />
                        <span className="text-gray-700">{child.teacherName}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Family Tree */}
      {familyChildren.length > 0 && !isIndependentAccount(family) && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Family Tree</h3>
              <p className="text-sm text-gray-600">Visual representation of family structure</p>
            </div>
            <button
              onClick={onShowFamilyTree}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
            >
              <Eye className="h-4 w-4" />
              Full Screen
            </button>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <SimpleFamilyTree family={family} children={children} />
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// SIMPLE FAMILY TREE
// ============================================

interface SimpleFamilyTreeProps {
  family: Family;
  children: Child[];
}

export const SimpleFamilyTree: React.FC<SimpleFamilyTreeProps> = ({
  family,
  children
}) => {
  const familyChildren = getFamilyChildren(family, children);

  return (
    <div className="flex flex-col items-center gap-8 py-6">
      {/* Parent Node */}
      <div className="relative">
        <div className="bg-white rounded-xl shadow-md p-6 text-center max-w-sm border-2 border-blue-200">
          <img
            src={family.parentImage || 'https://i.pravatar.cc/150?img=1'}
            alt={family.parentName}
            className="h-20 w-20 rounded-full object-cover border-2 border-blue-500 mx-auto mb-3"
          />
          <h4 className="text-xl font-bold text-gray-900 mb-1">{family.parentName}</h4>
          <p className="text-sm text-gray-600 mb-2">Parent/Guardian</p>
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <Mail className="h-3 w-3" />
            <span className="truncate">{family.parentEmail}</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-1">
            <Globe className="h-3 w-3" />
            <span>{family.timezone}</span>
          </div>
        </div>
        {familyChildren.length > 0 && (
          <div className="absolute left-1/2 -bottom-8 w-0.5 h-8 bg-gray-300 transform -translate-x-1/2"></div>
        )}
      </div>

      {/* Children Nodes */}
      {familyChildren.length > 0 && (
        <div className="relative">
          {familyChildren.length > 1 && (
            <div 
              className="absolute top-0 left-1/2 h-0.5 bg-gray-300"
              style={{ 
                width: `${(familyChildren.length - 1) * 240}px`,
                transform: 'translateX(-50%)'
              }}
            ></div>
          )}
          
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            {familyChildren.map((child, index) => (
              <div key={child.id} className="relative">
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gray-300"></div>
                
                <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200 hover:border-blue-400 transition-all text-center w-56">
                  <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  
                  <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg mx-auto mb-2">
                    {child.name.charAt(0)}
                  </div>
                  
                  <h4 className="font-bold text-gray-900 mb-1">{child.name}</h4>
                  <p className="text-xs text-gray-600 mb-2">
                    {child.age} years • {child.level}
                  </p>
                  
                  {child.timezone && (
                    <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-2">
                      <Clock className="h-3 w-3" />
                      <span>{child.timezone}</span>
                    </div>
                  )}
                  
                  <div className="mb-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500">Progress</span>
                      <span className="text-xs font-bold text-blue-600">{child.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full transition-all"
                        style={{ width: `${child.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {child.teacherName && child.teacherName !== 'Not Assigned' && (
                    <div className="bg-gray-50 rounded p-2 text-xs">
                      <GraduationCap className="h-3 w-3 inline mr-1 text-gray-600" />
                      <span className="text-gray-700">{child.teacherName}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// FULL SCREEN TREE VIEWER
// ============================================

interface FullScreenTreeViewerProps {
  family: Family;
  children: Child[];
  onClose: () => void;
}

export const FullScreenTreeViewer: React.FC<FullScreenTreeViewerProps> = ({
  family,
  children,
  onClose
}) => {
  return (
    <div className="fixed inset-0 bg-gray-900 z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="hover:bg-gray-100 p-2 rounded-lg transition-all">
              <X className="h-6 w-6" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{family.name} - Family Tree</h2>
              <p className="text-sm text-gray-600">Complete family structure view</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <SimpleFamilyTree family={family} children={children} />
      </div>
    </div>
  );
};