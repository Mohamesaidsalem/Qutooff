import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ref, onValue, update, off } from 'firebase/database';
import { database } from '../../firebase/config';
import { 
  ArrowLeft, Users, DollarSign, Calendar, Clock, Mail, Phone,
  User, Briefcase, CheckCircle, UserX, Save, Edit, Upload, FileText
} from 'lucide-react';
import { convertFromUTC, getTimezoneDisplayName } from '../../utils/timezone';

interface Teacher {
  id: string;
  name: string;
  fatherName?: string;
  cnc?: string;
  email: string;
  nationality?: string;
  phone: string;
  altPhone?: string;
  gender?: string;
  status?: string;
  qualification?: string;
  experience?: string;
  address?: string;
  job?: string;
  zoom?: string;
  groupId?: string;
  hourlyRate: number;
  username?: string;
  timezone: string;
  registrationDate?: string;
  assistant?: string;
  profilePicture?: string;
  documents?: any[];
  specialization: string;
  country: string;
  city: string;
  bio: string;
  isActive: boolean;
}

export default function TeacherProfile() {
  const { teacherId } = useParams();
  const navigate = useNavigate();

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [salaryRecords, setSalaryRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Edit Mode States
  const [editMode, setEditMode] = useState(false);
  const [editedTeacher, setEditedTeacher] = useState<any>({});

  // Salary Generation States
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [salaryAdjustment, setSalaryAdjustment] = useState(0);
  const [salaryNote, setSalaryNote] = useState('');

  useEffect(() => {
    if (!teacherId) return;

    const teacherRef = ref(database, `teachers/${teacherId}`);
    const classesRef = ref(database, 'classes');
    const childrenRef = ref(database, 'children');
    const salaryRef = ref(database, `salaries/${teacherId}`);

    const unsubscribeTeacher = onValue(teacherRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = { id: teacherId, ...snapshot.val() };
        setTeacher(data);
        setEditedTeacher(data);
      }
      setLoading(false);
    });

    const unsubscribeClasses = onValue(classesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const classesArray = Object.keys(data)
          .map(key => ({ id: key, ...data[key] }))
          .filter(cls => cls.teacherId === teacherId);
        setClasses(classesArray);
      } else {
        setClasses([]);
      }
    });

    const unsubscribeChildren = onValue(childrenRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const childrenArray = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        const studentIds = [...new Set(classes.map(cls => cls.studentId))];
        const teacherStudents = childrenArray.filter(child => studentIds.includes(child.id));
        setStudents(teacherStudents);
      } else {
        setStudents([]);
      }
    });

    const unsubscribeSalary = onValue(salaryRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const salaryArray = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setSalaryRecords(salaryArray);
      } else {
        setSalaryRecords([]);
      }
    });

    return () => {
      off(teacherRef);
      off(classesRef);
      off(childrenRef);
      off(salaryRef);
    };
  }, [teacherId, classes.length]);

  const handleUpdateProfile = async () => {
    if (!teacher || !teacherId) return;

    try {
      await update(ref(database, `teachers/${teacherId}`), {
        ...editedTeacher,
        updatedAt: new Date().toISOString()
      });
      setTeacher(editedTeacher);
      setEditMode(false);
      alert('✅ Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('❌ Error updating profile');
    }
  };

  const calculateMonthlyStats = (month: string) => {
    const monthClasses = classes.filter(cls => {
      const classDate = cls.utcDate || cls.date;
      return classDate?.startsWith(month) && cls.status === 'completed';
    });

    const totalHours = monthClasses.reduce((sum, cls) => sum + (cls.duration / 60), 0);
    const totalEarnings = totalHours * (teacher?.hourlyRate || 0);

    return {
      totalClasses: monthClasses.length,
      totalHours: totalHours.toFixed(2),
      totalEarnings: totalEarnings.toFixed(2)
    };
  };

  const handleGenerateSalary = async () => {
    if (!teacher) return;

    const stats = calculateMonthlyStats(selectedMonth);
    const finalSalary = parseFloat(stats.totalEarnings) + salaryAdjustment;

    const salaryRecord = {
      teacherId: teacher.id,
      teacherName: teacher.name,
      month: selectedMonth,
      totalClasses: stats.totalClasses,
      totalHours: parseFloat(stats.totalHours),
      hourlyRate: teacher.hourlyRate,
      baseSalary: parseFloat(stats.totalEarnings),
      adjustment: salaryAdjustment,
      finalSalary: finalSalary,
      note: salaryNote,
      status: 'pending',
      generatedAt: new Date().toISOString(),
      generatedBy: 'admin'
    };

    try {
      const newSalaryRef = ref(database, `salaries/${teacher.id}/${Date.now()}`);
      await update(newSalaryRef, salaryRecord);
      alert('✅ Salary generated successfully!');
      setSalaryAdjustment(0);
      setSalaryNote('');
    } catch (error) {
      console.error('Error generating salary:', error);
      alert('❌ Error generating salary');
    }
  };

  const handleDeactivateAccount = async () => {
    if (!window.confirm('⚠️ Are you sure you want to deactivate this teacher account?')) return;
    
    try {
      await update(ref(database, `teachers/${teacherId}`), { isActive: false });
      alert('✅ Teacher account deactivated');
      setTeacher({ ...teacher, isActive: false } as Teacher);
    } catch (error) {
      console.error('Error deactivating account:', error);
      alert('❌ Error deactivating account');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading teacher profile...</p>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-xl text-gray-600">Teacher not found</p>
          <button onClick={() => navigate('/admin/teachers')} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Back to Teachers
          </button>
        </div>
      </div>
    );
  }

  const currentMonthStats = calculateMonthlyStats(new Date().toISOString().slice(0, 7));

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Breadcrumb */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center text-sm text-gray-600">
          <button onClick={() => navigate('/admin')} className="hover:text-blue-600">Home</button>
          <span className="mx-2">&gt;</span>
          <button onClick={() => navigate('/admin/teachers')} className="hover:text-blue-600">List of Teacher Accounts</button>
          <span className="mx-2">&gt;</span>
          <span className="text-gray-900 font-medium">Teacher Account Profile</span>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-8">
        <button onClick={() => navigate('/admin/teachers')} className="flex items-center text-white hover:text-gray-200 mb-4">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Teachers
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center text-blue-600 font-bold text-4xl shadow-lg overflow-hidden">
              {teacher.profilePicture ? (
                <img src={teacher.profilePicture} alt={teacher.name} className="h-full w-full object-cover" />
              ) : (
                teacher.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{teacher.name}</h1>
              <p className="text-blue-100 mt-1">{teacher.specialization || 'Quran Teacher'}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="flex items-center"><Mail className="h-4 w-4 mr-1" />{teacher.email}</span>
                <span className="flex items-center"><Phone className="h-4 w-4 mr-1" />{teacher.phone}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">${teacher.hourlyRate}</div>
            <div className="text-blue-100">per hour</div>
            <div className={`mt-2 px-4 py-1 rounded-full inline-block ${teacher.isActive ? 'bg-green-500' : 'bg-red-500'}`}>
              {teacher.isActive ? 'Active' : 'Inactive'}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 -mt-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Students</p>
                <p className="text-3xl font-bold">{students.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">This Month Classes</p>
                <p className="text-3xl font-bold">{currentMonthStats.totalClasses}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Hours Taught</p>
                <p className="text-3xl font-bold">{currentMonthStats.totalHours}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Monthly Earnings</p>
                <p className="text-3xl font-bold">${currentMonthStats.totalEarnings}</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-lg">
                <DollarSign className="h-8 w-8 text-amber-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview', icon: User },
                { id: 'documents', label: 'Documents', icon: FileText },
                { id: 'students', label: 'Students', icon: Users },
                { id: 'salary', label: 'Salary Record', icon: DollarSign },
                { id: 'schedule', label: 'Schedule', icon: Calendar },
                { id: 'generate', label: 'Generate Salary', icon: CheckCircle },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Overview Tab with Inline Editing */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Personal Bio Data */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold flex items-center">
                        <User className="h-5 w-5 mr-2 text-blue-600" />
                        Personal Bio Data
                      </h3>
                      {!editMode ? (
                        <button
                          onClick={() => {
                            setEditMode(true);
                            setEditedTeacher(teacher);
                          }}
                          className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                      ) : (
                        <div className="flex gap-3">
                          <button onClick={handleUpdateProfile} className="text-green-600 hover:text-green-800 flex items-center text-sm font-medium">
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditMode(false);
                              setEditedTeacher(teacher);
                            }}
                            className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      {[
                        { label: 'Name', key: 'name' },
                        { label: 'Father Name', key: 'fatherName' },
                        { label: 'CNC', key: 'cnc' },
                        { label: 'Email', key: 'email', type: 'email' },
                        { label: 'Nationality', key: 'nationality' },
                        { label: 'Phone', key: 'phone', type: 'tel' },
                        { label: 'Alt Phone', key: 'altPhone', type: 'tel' },
                        { label: 'Gender', key: 'gender', type: 'select', options: ['Male', 'Female'] },
                        { label: 'Qualification', key: 'qualification' },
                        { label: 'Experience', key: 'experience' },
                        { label: 'City', key: 'city' },
                        { label: 'Country', key: 'country' },
                        { label: 'Address', key: 'address', multiline: true },
                      ].map(field => (
                        <div key={field.key} className="flex flex-col border-b pb-3 last:border-0">
                          <span className="text-sm text-gray-600 mb-1">{field.label}:</span>
                          {editMode ? (
                            field.type === 'select' ? (
                              <select
                                value={editedTeacher[field.key] || ''}
                                onChange={e => setEditedTeacher({ ...editedTeacher, [field.key]: e.target.value })}
                                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="">Select {field.label}</option>
                                {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            ) : field.multiline ? (
                              <textarea
                                value={editedTeacher[field.key] || ''}
                                onChange={e => setEditedTeacher({ ...editedTeacher, [field.key]: e.target.value })}
                                rows={3}
                                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            ) : (
                              <input
                                type={field.type || 'text'}
                                value={editedTeacher[field.key] || ''}
                                onChange={e => setEditedTeacher({ ...editedTeacher, [field.key]: e.target.value })}
                                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            )
                          ) : (
                            <span className="font-medium text-gray-900">
                              {editedTeacher[field.key] || 'N/A'}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Official Details */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center">
                      <Briefcase className="h-5 w-5 mr-2 text-green-600" />
                      Official Details
                    </h3>
                    <div className="space-y-4">
                      {[
                        { label: 'Job', key: 'job' },
                        { label: 'Specialization', key: 'specialization' },
                        { label: 'Zoom Link', key: 'zoom', type: 'url' },
                        { label: 'Group ID', key: 'groupId' },
                        { label: 'Hourly Rate ($)', key: 'hourlyRate', type: 'number' },
                        { label: 'Username', key: 'username' },
                        { label: 'Timezone', key: 'timezone' },
                        { label: 'Assistant', key: 'assistant' },
                        { label: 'Registration Date', key: 'registrationDate', type: 'date', readOnly: true },
                        { label: 'Active Status', key: 'isActive', type: 'boolean' },
                      ].map(field => (
                        <div key={field.key} className="flex flex-col border-b pb-3 last:border-0">
                          <span className="text-sm text-gray-600 mb-1">{field.label}:</span>
                          {editMode && !field.readOnly ? (
                            field.type === 'boolean' ? (
                              <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={!!editedTeacher[field.key]}
                                  onChange={e => setEditedTeacher({ ...editedTeacher, [field.key]: e.target.checked })}
                                  className="h-5 w-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <span className="font-medium">{editedTeacher[field.key] ? 'Active' : 'Inactive'}</span>
                              </label>
                            ) : field.type === 'number' ? (
                              <input
                                type="number"
                                value={editedTeacher[field.key] || 0}
                                onChange={e => setEditedTeacher({ ...editedTeacher, [field.key]: parseFloat(e.target.value) || 0 })}
                                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            ) : (
                              <input
                                type={field.type || 'text'}
                                value={editedTeacher[field.key] || ''}
                                onChange={e => setEditedTeacher({ ...editedTeacher, [field.key]: e.target.value })}
                                className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            )
                          ) : (
                            <span className="font-medium text-gray-900">
                              {field.key === 'isActive' ? (editedTeacher[field.key] ? '✅ Active' : '❌ Inactive') :
                               field.key === 'hourlyRate' ? `$${editedTeacher[field.key]}` :
                               field.key === 'registrationDate' && editedTeacher[field.key] ? new Date(editedTeacher[field.key]).toLocaleDateString() :
                               field.key === 'timezone' && editedTeacher[field.key] ? getTimezoneDisplayName(editedTeacher[field.key]) :
                               editedTeacher[field.key] || 'N/A'}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bio Section */}
                {(editMode || teacher.bio) && (
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <h3 className="text-lg font-bold mb-3 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-blue-600" />
                      Biography
                    </h3>
                    {editMode ? (
                      <textarea
                        value={editedTeacher.bio || ''}
                        onChange={e => setEditedTeacher({ ...editedTeacher, bio: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Add teacher biography..."
                      />
                    ) : (
                      <p className="text-gray-700">{teacher.bio || 'No biography added yet'}</p>
                    )}
                  </div>
                )}

                {/* Deactivate Account */}
                <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                  <h3 className="text-xl font-bold text-red-600 mb-3 flex items-center">
                    <UserX className="h-5 w-5 mr-2" />
                    Deactivate Account
                  </h3>
                  <p className="text-gray-700 mb-4">
                    This will deactivate the teacher's account. They won't be able to access the system.
                  </p>
                  <button
                    onClick={handleDeactivateAccount}
                    disabled={!teacher.isActive}
                    className={`px-6 py-2 rounded-lg font-medium ${
                      teacher.isActive 
                        ? 'bg-red-600 text-white hover:bg-red-700' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {teacher.isActive ? 'Deactivate Account' : 'Already Deactivated'}
                  </button>
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold">Uploaded Documents</h3>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload New Document
                  </button>
                </div>

                <div className="grid gap-4">
                  {teacher.documents && teacher.documents.length > 0 ? (
                    teacher.documents.map((doc: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between border">
                        <div className="flex items-center space-x-4">
                          <div className="bg-blue-100 p-3 rounded-lg">
                            <FileText className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{doc.name}</h4>
                            <p className="text-sm text-gray-600">{doc.type} • {doc.size}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-600">
                            View
                          </button>
                          <button className="text-red-600 hover:text-red-800 px-3 py-1 rounded border border-red-600">
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No documents uploaded yet</p>
                      <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                        Upload First Document
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Students Tab */}
            {activeTab === 'students' && (
              <div>
                <h3 className="text-2xl font-bold mb-6">Students ({students.length})</h3>
                <div className="grid gap-4">
                  {students.map(student => {
                    const studentClasses = classes.filter(c => c.studentId === student.id);
                    const completedClasses = studentClasses.filter(c => c.status === 'completed');
                    
                    return (
                      <div key={student.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between border hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                            {student.name?.charAt(0).toUpperCase() || 'S'}
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">{student.name}</h4>
                            <p className="text-sm text-gray-600">{student.level || 'Beginner'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            Total Classes: <span className="font-bold text-gray-900">{studentClasses.length}</span>
                          </p>
                          <p className="text-sm text-gray-600">
                            Completed: <span className="font-bold text-green-600">{completedClasses.length}</span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {students.length === 0 && (
                    <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p>No students assigned yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Salary Records Tab */}
            {activeTab === 'salary' && (
              <div>
                <h3 className="text-2xl font-bold mb-6">Salary Records</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border rounded-lg">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Month</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Classes</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Hours</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Rate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Base</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Adjust</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Final</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {salaryRecords.map(record => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap font-medium">{record.month}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{record.totalClasses}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{record.totalHours}</td>
                          <td className="px-6 py-4 whitespace-nowrap">${record.hourlyRate}</td>
                          <td className="px-6 py-4 whitespace-nowrap">${record.baseSalary}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={record.adjustment >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {record.adjustment >= 0 ? '+' : ''}{record.adjustment}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-bold text-green-600">${record.finalSalary}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              record.status === 'paid' ? 'bg-green-100 text-green-800' : 
                              record.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {salaryRecords.length === 0 && (
                    <div className="text-center py-12 text-gray-500 bg-gray-50">
                      <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p>No salary records yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Schedule Tab */}
            {activeTab === 'schedule' && (
              <div>
                <h3 className="text-2xl font-bold mb-6">Upcoming Schedule</h3>
                <div className="space-y-4">
                  {classes
                    .filter(cls => cls.status === 'scheduled')
                    .sort((a, b) => {
                      const dateA = new Date(a.utcDate + ' ' + a.utcTime);
                      const dateB = new Date(b.utcDate + ' ' + b.utcTime);
                      return dateA.getTime() - dateB.getTime();
                    })
                    .map(cls => {
                      const { localDate, localTime } = convertFromUTC(cls.utcDate, cls.utcTime);
                      const student = students.find(s => s.id === cls.studentId);
                      
                      return (
                        <div key={cls.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between border hover:shadow-md transition-shadow">
                          <div className="flex items-center space-x-4">
                            <div className="bg-green-100 p-3 rounded-lg">
                              <Calendar className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-lg">{student?.name || 'Unknown Student'}</h4>
                              <p className="text-sm text-gray-600">{cls.subject || 'Quran Class'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">{localDate}</p>
                            <p className="text-sm text-gray-600">{localTime} • {cls.duration} min</p>
                          </div>
                        </div>
                      );
                    })}
                  {classes.filter(c => c.status === 'scheduled').length === 0 && (
                    <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p>No scheduled classes</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Generate Salary Tab */}
            {activeTab === 'generate' && (
              <div className="max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold mb-6 text-center">Generate Monthly Salary</h3>
                
                <div className="bg-gray-50 rounded-xl p-6 mb-6 border">
                  <label className="block text-sm font-medium mb-2">Select Month</label>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-6 border border-blue-200">
                  <h4 className="font-bold text-lg mb-4 flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
                    Salary Breakdown
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-blue-200">
                      <span className="text-gray-700">Total Classes:</span>
                      <span className="font-bold text-gray-900">{calculateMonthlyStats(selectedMonth).totalClasses}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-blue-200">
                      <span className="text-gray-700">Total Hours:</span>
                      <span className="font-bold text-gray-900">{calculateMonthlyStats(selectedMonth).totalHours} hrs</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-blue-200">
                      <span className="text-gray-700">Hourly Rate:</span>
                      <span className="font-bold text-gray-900">${teacher.hourlyRate}/hr</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-blue-200">
                      <span className="text-gray-700">Base Salary:</span>
                      <span className="font-bold text-gray-900">${calculateMonthlyStats(selectedMonth).totalEarnings}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-blue-200">
                      <span className="text-gray-700">Adjustment:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">$</span>
                        <input
                          type="number"
                          value={salaryAdjustment}
                          onChange={(e) => setSalaryAdjustment(parseFloat(e.target.value) || 0)}
                          className="w-32 px-3 py-2 border rounded-lg text-right focus:ring-2 focus:ring-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between py-4 text-xl font-bold text-green-600 bg-white rounded-lg px-4 mt-4">
                      <span>Final Salary:</span>
                      <span>
                        ${(parseFloat(calculateMonthlyStats(selectedMonth).totalEarnings) + salaryAdjustment).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                  <textarea
                    value={salaryNote}
                    onChange={(e) => setSalaryNote(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Add any notes about this salary payment (bonuses, deductions, etc)..."
                  />
                </div>

                <button
                  onClick={handleGenerateSalary}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4 rounded-lg hover:from-green-700 hover:to-green-800 flex items-center justify-center text-lg font-semibold shadow-lg"
                >
                  <CheckCircle className="h-6 w-6 mr-2" />
                  Generate Salary Record
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}