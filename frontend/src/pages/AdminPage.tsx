import { useState, useEffect } from 'react';
import client from '../api/client';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Shield, 
  Trash2, 
  Lock, 
  Unlock, 
  RefreshCw,
  SlidersHorizontal,
  Calendar,
  Layers,
  ArrowUpDown
} from 'lucide-react';

interface AdminUser {
  _id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  loginAttempts: number;
  lockUntil: string | null;
  createdAt: string;
}

interface AdminNote {
  _id: string;
  userId: string;
  title: string;
  content: string;
  color: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    email: string;
  };
}

export default function AdminPage() {
  const { user, addToast } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'users' | 'notes'>('users');

  // Guard: if not admin, redirect or block
  useEffect(() => {
    if (user && user.role !== 'admin') {
      addToast('Forbidden: Admin access required', 'error');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Global Admin Table states
  const [userList, setUserList] = useState<AdminUser[]>([]);
  const [noteList, setNoteList] = useState<AdminNote[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination & Filters states
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const limit = 8;

  // Fetch users or notes depending on activeTab
  useEffect(() => {
    setPage(1);
    fetchData(1);
  }, [activeTab, search, sortField, sortOrder]);

  const fetchData = async (targetPage = page) => {
    setIsLoading(true);
    try {
      if (activeTab === 'users') {
        const res = await client.get('/admin/users', {
          params: {
            search,
            sort: sortField,
            order: sortOrder,
            page: targetPage,
            limit
          }
        });
        setUserList(res.data.users);
        setTotalRecords(res.data.totalRecords);
      } else {
        const res = await client.get('/admin/notes', {
          params: {
            search,
            sort: sortField,
            order: sortOrder,
            page: targetPage,
            limit
          }
        });
        setNoteList(res.data.notes);
        setTotalRecords(res.data.totalRecords);
      }
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Failed to fetch administrative data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchData(newPage);
  };

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // User Actions
  const handleToggleLock = async (targetUser: AdminUser) => {
    const isCurrentlyLocked = targetUser.lockUntil ? new Date(targetUser.lockUntil).getTime() > Date.now() : false;
    const shouldLock = !isCurrentlyLocked;

    try {
      const res = await client.put(`/admin/users/${targetUser._id}`, { isLocked: shouldLock });
      setUserList(prev => prev.map(u => u._id === targetUser._id ? res.data : u));
      addToast(shouldLock ? 'User account has been locked' : 'User account has been unlocked', 'success');
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Failed to update user lock status', 'error');
    }
  };

  const handleChangeRole = async (targetUserId: string, currentRole: 'user' | 'admin') => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await client.put(`/admin/users/${targetUserId}`, { role: newRole });
      setUserList(prev => prev.map(u => u._id === targetUserId ? res.data : u));
      addToast(`Role updated to ${newRole}`, 'success');
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Failed to update role', 'error');
    }
  };

  const handleDeleteUser = async (targetUserId: string) => {
    if (!window.confirm('Are you absolutely sure you want to delete this user and all their notes?')) return;
    try {
      await client.delete(`/admin/users/${targetUserId}`);
      setUserList(prev => prev.filter(u => u._id !== targetUserId));
      setTotalRecords(prev => prev - 1);
      addToast('User deleted successfully', 'success');
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Failed to delete user', 'error');
    }
  };

  // Note Actions
  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('Are you sure you want to delete this note from the registry?')) return;
    try {
      await client.delete(`/admin/notes/${noteId}`);
      setNoteList(prev => prev.filter(n => n._id !== noteId));
      setTotalRecords(prev => prev - 1);
      addToast('Note deleted successfully', 'success');
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Failed to delete note', 'error');
    }
  };

  const totalPages = Math.ceil(totalRecords / limit) || 1;

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-6 text-center">
        <div className="bg-white border border-gray-100 rounded-3xl p-8 max-w-sm shadow-xl">
          <Shield className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-serif font-bold text-gray-900">Access Restricted</h2>
          <p className="text-xs text-gray-500 mt-2 font-medium">
            You require administrator authorization privileges to view this control registry.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-24 relative">
      {/* 3D background grid texture */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="max-w-7xl mx-auto px-6 pt-10 relative z-10">
        
        {/* Admin Title & Overview counts */}
        <div className="mb-10">
          <h1 className="text-2xl font-serif font-bold text-gray-950 tracking-tight flex items-center gap-2.5">
            <Shield className="w-6.5 h-6.5 text-[#264653]" />
            Administrative Intelligence Registry
          </h1>
          <p className="text-xs text-gray-500 mt-1 font-semibold tracking-wide uppercase">
            Defense & Audit Control Center
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-gray-200/80 mb-8 gap-1">
          <button
            onClick={() => {
              setActiveTab('users');
              setSortField('createdAt');
              setSortOrder('desc');
            }}
            className={`px-5 py-3 font-serif font-bold text-sm flex items-center gap-2 transition-all border-b-2 -mb-px ${
              activeTab === 'users' 
                ? 'border-[#264653] text-[#264653]' 
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Users className="w-4 h-4" />
            User Accounts Registry
          </button>
          <button
            onClick={() => {
              setActiveTab('notes');
              setSortField('createdAt');
              setSortOrder('desc');
            }}
            className={`px-5 py-3 font-serif font-bold text-sm flex items-center gap-2 transition-all border-b-2 -mb-px ${
              activeTab === 'notes' 
                ? 'border-[#264653] text-[#264653]' 
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <FileText className="w-4 h-4" />
            Global Notes Audit
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={activeTab === 'users' ? 'Search users by name, email...' : 'Search notes by title, content, user...'}
              className="pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#264653]/10 focus:border-[#264653] w-full transition-all"
            />
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
            <SlidersHorizontal className="w-4 h-4 text-gray-400" />
            <span>Total Records Found: <strong className="text-gray-900">{totalRecords}</strong></span>
          </div>
        </div>

        {/* Dynamic Table Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_15px_40px_rgba(38,70,83,0.02)] overflow-hidden relative">
          
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 text-[#264653] animate-spin" />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Syncing Registry...</span>
            </div>
          ) : activeTab === 'users' ? (
            /* User Accounts Registry Table */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100">
                    <th className="py-4 px-6 text-[11px] font-black uppercase text-gray-400 tracking-wider">
                      <button onClick={() => toggleSort('name')} className="flex items-center gap-1.5 hover:text-gray-700">
                        Full Name
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-4 px-6 text-[11px] font-black uppercase text-gray-400 tracking-wider">
                      <button onClick={() => toggleSort('email')} className="flex items-center gap-1.5 hover:text-gray-700">
                        Email Address
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-4 px-6 text-[11px] font-black uppercase text-gray-400 tracking-wider">
                      <button onClick={() => toggleSort('role')} className="flex items-center gap-1.5 hover:text-gray-700">
                        Role Privileges
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-4 px-6 text-[11px] font-black uppercase text-gray-400 tracking-wider">
                      Account Status
                    </th>
                    <th className="py-4 px-6 text-[11px] font-black uppercase text-gray-400 tracking-wider">
                      <button onClick={() => toggleSort('createdAt')} className="flex items-center gap-1.5 hover:text-gray-700">
                        Enrolled On
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-4 px-6 text-[11px] font-black uppercase text-gray-400 tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {userList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-xs font-medium text-gray-400">
                        No registered users found matching the filter query.
                      </td>
                    </tr>
                  ) : (
                    userList.map((u) => {
                      const isLocked = u.lockUntil ? new Date(u.lockUntil).getTime() > Date.now() : false;
                      const isSelf = u._id === user?._id;
                      return (
                        <tr key={u._id} className="hover:bg-gray-50/40 transition-colors">
                          <td className="py-4.5 px-6">
                            <span className="text-xs font-bold text-gray-900 block">{u.name}</span>
                            {isSelf && (
                              <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded-md bg-[#264653]/10 text-[#264653] font-sans text-[9px] font-black uppercase tracking-wider">
                                Current Active Session
                              </span>
                            )}
                          </td>
                          <td className="py-4.5 px-6">
                            <span className="text-xs font-medium text-gray-600 block font-mono">{u.email}</span>
                          </td>
                          <td className="py-4.5 px-6">
                            <button
                              onClick={() => !isSelf && handleChangeRole(u._id, u.role)}
                              disabled={isSelf}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide uppercase transition-all flex items-center gap-1 border ${
                                u.role === 'admin' 
                                  ? 'bg-[#264653]/5 border-[#264653]/10 text-[#264653]' 
                                  : 'bg-gray-50 border-gray-100 text-gray-500 hover:border-gray-300'
                              }`}
                            >
                              <Shield className="w-3 h-3" />
                              {u.role}
                            </button>
                          </td>
                          <td className="py-4.5 px-6">
                            <button
                              onClick={() => !isSelf && handleToggleLock(u)}
                              disabled={isSelf}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide uppercase transition-all flex items-center gap-1 border ${
                                isLocked 
                                  ? 'bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100' 
                                  : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100'
                              }`}
                            >
                              {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                              {isLocked ? 'Locked' : 'Active'}
                            </button>
                          </td>
                          <td className="py-4.5 px-6">
                            <span className="text-xs font-medium text-gray-400 block flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(u.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="py-4.5 px-6 text-right">
                            <button
                              onClick={() => handleDeleteUser(u._id)}
                              disabled={isSelf}
                              className={`p-2 rounded-xl transition-all ${
                                isSelf 
                                  ? 'text-gray-200 cursor-not-allowed' 
                                  : 'text-gray-400 hover:text-rose-600 hover:bg-rose-50'
                              }`}
                              title="Delete User and associated notes"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Global Notes Audit Table */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100">
                    <th className="py-4 px-6 text-[11px] font-black uppercase text-gray-400 tracking-wider">
                      <button onClick={() => toggleSort('title')} className="flex items-center gap-1.5 hover:text-gray-700">
                        Note Title
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-4 px-6 text-[11px] font-black uppercase text-gray-400 tracking-wider">
                      Excerpt Content
                    </th>
                    <th className="py-4 px-6 text-[11px] font-black uppercase text-gray-400 tracking-wider">
                      <button onClick={() => toggleSort('userName')} className="flex items-center gap-1.5 hover:text-gray-700">
                        Author Creator
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-4 px-6 text-[11px] font-black uppercase text-gray-400 tracking-wider">
                      <button onClick={() => toggleSort('color')} className="flex items-center gap-1.5 hover:text-gray-700">
                        Material style
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-4 px-6 text-[11px] font-black uppercase text-gray-400 tracking-wider">
                      <button onClick={() => toggleSort('createdAt')} className="flex items-center gap-1.5 hover:text-gray-700">
                        Created On
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="py-4 px-6 text-[11px] font-black uppercase text-gray-400 tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {noteList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-xs font-medium text-gray-400">
                        No note records found matching query parameters.
                      </td>
                    </tr>
                  ) : (
                    noteList.map((n) => (
                      <tr key={n._id} className="hover:bg-gray-50/40 transition-colors">
                        <td className="py-4 px-6">
                          <span className="text-xs font-bold text-gray-900 block truncate max-w-[160px]" title={n.title}>
                            {n.title || <em className="text-gray-300">Untitled</em>}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-xs font-medium text-gray-500 block truncate max-w-[220px]" title={n.content}>
                            {n.content || <em className="text-gray-300">Blank narrative</em>}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-xs font-bold text-gray-800 block">{n.user.name}</span>
                          <span className="text-[10px] text-gray-400 font-medium block font-mono leading-none mt-0.5">{n.user.email}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gray-50 border border-gray-100 text-[10px] font-bold text-gray-600">
                            <span className={`w-2 h-2 rounded-full border border-black/10`} style={{ backgroundColor: n.color === 'clay' ? '#EADCC0' : n.color === 'sand' ? '#ECE1C4' : n.color === 'blue' ? '#CADAE2' : n.color === 'sage' ? '#CBDBCB' : '#DDD4E4' }} />
                            {n.color}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-xs font-medium text-gray-400 block flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleDeleteNote(n._id)}
                            className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Purge Note from Registry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Footer / Server-Side Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-150 bg-gray-50/50 flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-400">
                Page <strong className="text-gray-800">{page}</strong> of <strong className="text-gray-800">{totalPages}</strong>
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="p-2 border border-gray-200/80 rounded-xl bg-white disabled:bg-gray-100 disabled:text-gray-300 text-gray-600 hover:bg-gray-50 transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="p-2 border border-gray-200/80 rounded-xl bg-white disabled:bg-gray-100 disabled:text-gray-300 text-gray-600 hover:bg-gray-50 transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
