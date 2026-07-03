import { useState, useEffect, useRef } from 'react';
import client from '../api/client';
import { useApp } from '../context/AppContext';
import { 
  Pin, 
  Trash2, 
  Edit3, 
  Plus, 
  Search, 
  X, 
  Grid, 
  FolderPlus, 
  Loader, 
  Check, 
  Calendar, 
  HelpCircle,
  FileText,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

interface Note {
  _id: string;
  userId: string;
  title: string;
  content: string;
  color: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

// Warm, premium 3D paper colors
const NOTE_COLORS = [
  { id: 'clay', name: 'Terracotta Clay', bg: 'bg-[#FAF6F0]', border: 'border-[#EADCC0]', text: 'text-[#5C3E2D]', swatch: 'bg-[#EADCC0]' },
  { id: 'sand', name: 'Sienna Sand', bg: 'bg-[#FCFAF2]', border: 'border-[#ECE1C4]', text: 'text-[#615234]', swatch: 'bg-[#ECE1C4]' },
  { id: 'blue', name: 'Powder Slate', bg: 'bg-[#F2F6F8]', border: 'border-[#CADAE2]', text: 'text-[#2D4550]', swatch: 'bg-[#CADAE2]' },
  { id: 'sage', name: 'Pale Olive Sage', bg: 'bg-[#F4F7F4]', border: 'border-[#CBDBCB]', text: 'text-[#3E523E]', swatch: 'bg-[#CBDBCB]' },
  { id: 'lavender', name: 'Dusty Lavender', bg: 'bg-[#F7F5F9]', border: 'border-[#DDD4E4]', text: 'text-[#4A3D54]', swatch: 'bg-[#DDD4E4]' },
];

export default function DashboardPage() {
  const { user, addToast } = useApp();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColorFilter, setSelectedColorFilter] = useState<string | null>(null);
  
  // Slide-over states
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formColor, setFormColor] = useState('clay');
  const [formPinned, setFormPinned] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Delete modal state
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const res = await client.get('/notes');
      setNotes(res.data);
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Failed to fetch notes', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateSlideOver = () => {
    setEditingNote(null);
    setFormTitle('');
    setFormContent('');
    setFormColor('clay');
    setFormPinned(false);
    setIsSlideOverOpen(true);
  };

  const openEditSlideOver = (note: Note) => {
    setEditingNote(note);
    setFormTitle(note.title);
    setFormContent(note.content);
    setFormColor(note.color);
    setFormPinned(note.pinned);
    setIsSlideOverOpen(true);
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() && !formContent.trim()) {
      addToast('Note must have a title or content', 'error');
      return;
    }

    setIsSaving(true);
    const originalNotes = [...notes];

    try {
      if (editingNote) {
        // Optimistic Update
        const updatedFields = {
          title: formTitle,
          content: formContent,
          color: formColor,
          pinned: formPinned,
          updatedAt: new Date().toISOString()
        };
        setNotes((prev) => 
          prev.map((n) => (n._id === editingNote._id ? { ...n, ...updatedFields } : n))
        );
        setIsSlideOverOpen(false);

        await client.put(`/notes/${editingNote._id}`, updatedFields);
        addToast('Note updated successfully', 'success');
      } else {
        // Create Note
        const tempId = 'temp-' + Math.random().toString(36).substr(2, 9);
        const newTempNote: Note = {
          _id: tempId,
          userId: user?._id || '',
          title: formTitle,
          content: formContent,
          color: formColor,
          pinned: formPinned,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // Insert optimistic node
        setNotes((prev) => [newTempNote, ...prev]);
        setIsSlideOverOpen(false);

        const res = await client.post('/notes', {
          title: formTitle,
          content: formContent,
          color: formColor,
          pinned: formPinned
        });

        // Swap out the temp ID for the server ID
        setNotes((prev) => 
          prev.map((n) => (n._id === tempId ? res.data : n))
        );
        addToast('Note created successfully', 'success');
      }
    } catch (err: any) {
      // Rollback on failure
      setNotes(originalNotes);
      addToast(err.response?.data?.error || 'Failed to save note', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Optimistic Toggle Pin
  const togglePin = async (note: Note) => {
    const originalNotes = [...notes];
    const newPinned = !note.pinned;

    setNotes((prev) => 
      prev.map((n) => (n._id === note._id ? { ...n, pinned: newPinned } : n))
    );

    try {
      await client.put(`/notes/${note._id}`, { pinned: newPinned });
      addToast(newPinned ? 'Note pinned' : 'Note unpinned', 'success');
    } catch (err: any) {
      setNotes(originalNotes);
      addToast(err.response?.data?.error || 'Failed to update pin state', 'error');
    }
  };

  // Confirm and Delete Note
  const confirmDelete = (id: string) => {
    setDeletingNoteId(id);
  };

  const executeDelete = async () => {
    if (!deletingNoteId) return;
    const targetId = deletingNoteId;
    const originalNotes = [...notes];

    // Optimistic delete
    setNotes((prev) => prev.filter((n) => n._id !== targetId));
    setDeletingNoteId(null);

    try {
      await client.delete(`/notes/${targetId}`);
      addToast('Note deleted successfully', 'success');
    } catch (err: any) {
      setNotes(originalNotes);
      addToast(err.response?.data?.error || 'Failed to delete note', 'error');
    }
  };

  // Filter & Search Notes
  const filteredNotes = notes.filter((note) => {
    const matchesSearch = 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesColor = selectedColorFilter ? note.color === selectedColorFilter : true;
    return matchesSearch && matchesColor;
  });

  // Sort: Pinned first, then creation date desc
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const pinnedCount = sortedNotes.filter(n => n.pinned).length;
  const unpinnedCount = sortedNotes.length - pinnedCount;

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-gray-900 pb-20 relative">
      {/* Absolute high-end microdot grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(#000 1.2px, transparent 1.2px)`,
          backgroundSize: '28px 28px',
        }}
      />

      {/* Main Workspace Header */}
      <div className="border-b border-gray-100 bg-white/70 backdrop-blur-md relative z-10 sticky top-[73px]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Welcome User details */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#264653]/5 flex items-center justify-center font-bold text-[#264653] border border-[#264653]/10">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <h1 className="text-lg font-serif font-bold text-gray-900 tracking-tight">
                {user?.name}'s Vault
              </h1>
              <p className="text-[11px] text-gray-500 font-semibold tracking-wide uppercase">
                Tactile Workspace
              </p>
            </div>
          </div>

          {/* Search and Quick Filters */}
          <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
            <div className="relative flex-1 sm:flex-initial">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                className="pl-9 pr-4 py-2 bg-gray-50 hover:bg-gray-100/70 focus:bg-white rounded-xl border border-gray-200/80 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#264653]/5 focus:border-[#264653] transition-all w-full sm:w-64"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Create Button */}
            <button
              onClick={openCreateSlideOver}
              className="py-2 px-4 bg-[#264653] hover:bg-[#1e3742] text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-[#264653]/5 hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              New Note
            </button>
          </div>
        </div>

        {/* Color Palette filter bar */}
        <div className="max-w-7xl mx-auto px-6 pb-3 pt-1 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-2">
            Filter Tones:
          </span>
          <button
            onClick={() => setSelectedColorFilter(null)}
            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
              selectedColorFilter === null 
                ? 'bg-[#264653] text-white' 
                : 'bg-gray-100 hover:bg-gray-200/70 text-gray-600'
            }`}
          >
            All Papers
          </button>
          {NOTE_COLORS.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedColorFilter(c.id)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                selectedColorFilter === c.id 
                  ? 'bg-[#264653] text-white' 
                  : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-100 shadow-sm'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${c.swatch} border border-black/10`} />
              {c.name.split(' ')[1]}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-10 relative z-10">
        
        {/* Loading state / skeletons */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className="bg-white rounded-3xl border border-gray-150 p-6 min-h-[220px] animate-pulse flex flex-col justify-between"
              >
                <div>
                  <div className="h-5 bg-gray-200 rounded-lg w-2/3 mb-4" />
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-100 rounded-md w-full" />
                    <div className="h-3 bg-gray-100 rounded-md w-11/12" />
                    <div className="h-3 bg-gray-100 rounded-md w-4/5" />
                  </div>
                </div>
                <div className="flex justify-between items-center pt-6 border-t border-gray-50">
                  <div className="h-3 bg-gray-100 rounded-md w-1/4" />
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100" />
                    <div className="w-8 h-8 rounded-full bg-gray-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedNotes.length === 0 ? (
          /* Empty Workspace State */
          <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto py-16 bg-white border border-gray-100 rounded-3xl p-8 shadow-[0_10px_30px_rgba(0,0,0,0.01)]">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-5 border border-gray-100">
              <FolderPlus className="w-7 h-7 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold font-serif text-gray-950">
              Your Tactile Desk is Bare
            </h3>
            <p className="text-sm text-gray-500 mt-2 font-medium">
              Create a physical style card with custom depth-based styling to start organizing your thoughts.
            </p>
            <button
              onClick={openCreateSlideOver}
              className="mt-6 px-6 py-3 bg-[#264653] hover:bg-[#1a303a] text-white font-bold rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-[#264653]/10 hover:shadow-xl transition-all"
            >
              <Plus className="w-4 h-4" />
              Create First 3D Note
            </button>
          </div>
        ) : (
          /* Notes Render Container */
          <div className="space-y-12">
            
            {/* Pinned notes list */}
            {pinnedCount > 0 && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-2">
                  <Pin className="w-4 h-4 text-[#264653] fill-[#264653]" />
                  <span className="text-xs font-black uppercase tracking-wider text-[#264653]">
                    Pinned Thoughts ({pinnedCount})
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {sortedNotes.filter(n => n.pinned).map((note) => (
                    <NoteCard 
                      key={note._id} 
                      note={note} 
                      onTogglePin={() => togglePin(note)} 
                      onEdit={() => openEditSlideOver(note)}
                      onDelete={() => confirmDelete(note._id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* General notes list */}
            {unpinnedCount > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-gray-400">
                    Workspace Notes ({unpinnedCount})
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {sortedNotes.filter(n => !n.pinned).map((note) => (
                    <NoteCard 
                      key={note._id} 
                      note={note} 
                      onTogglePin={() => togglePin(note)} 
                      onEdit={() => openEditSlideOver(note)}
                      onDelete={() => confirmDelete(note._id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Slide-Over Drawer panel */}
      {isSlideOverOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Overlay Backdrop with Blur */}
          <div 
            className="absolute inset-0 bg-[#0E1518]/30 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsSlideOverOpen(false)}
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md">
              <div className="h-full flex flex-col bg-white shadow-2xl relative">
                
                {/* Header of Drawer */}
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-lg font-serif font-bold text-gray-900">
                    {editingNote ? 'Refine Note Card' : 'Sculpt New Note'}
                  </h3>
                  <button 
                    onClick={() => setIsSlideOverOpen(false)}
                    className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSaveNote} className="flex-1 overflow-y-auto p-6 space-y-6">
                  
                  {/* Title Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Title Reference
                    </label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Note heading..."
                      className="w-full px-4 py-3 bg-[#FAFAF8] rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#264653]/10 focus:border-[#264653] transition-all"
                      maxLength={100}
                    />
                  </div>

                  {/* Body Content Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Body Narrative
                    </label>
                    <textarea
                      value={formContent}
                      onChange={(e) => setFormContent(e.target.value)}
                      placeholder="Compose your secure insights here..."
                      rows={8}
                      className="w-full px-4 py-3 bg-[#FAFAF8] rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#264653]/10 focus:border-[#264653] transition-all resize-none leading-relaxed"
                    />
                  </div>

                  {/* Paper Tone Select */}
                  <div className="space-y-2.5">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">
                      Tactile Material Tone
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {NOTE_COLORS.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setFormColor(c.id)}
                          className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                            formColor === c.id 
                              ? 'border-[#264653] bg-[#264653]/5 ring-2 ring-[#264653]/10' 
                              : 'border-gray-200 bg-white hover:bg-gray-50'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded-full ${c.swatch} border border-black/10 flex-shrink-0`} />
                          <span className="text-xs font-bold text-gray-800">{c.name.split(' ')[1]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pin Option */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-gray-900 block">
                        Affix to Vault Ceiling
                      </span>
                      <span className="text-[11px] text-gray-400 font-medium block">
                        Keeps this note card permanently at the top.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormPinned(!formPinned)}
                      className={`w-11 h-6 rounded-full p-1 transition-all duration-300 ${
                        formPinned ? 'bg-[#264653]' : 'bg-gray-200'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-all duration-300 ${
                        formPinned ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                </form>

                {/* Footer Controls */}
                <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsSlideOverOpen(false)}
                    className="flex-1 py-3 border border-gray-200 font-bold rounded-xl text-xs hover:bg-gray-50 text-gray-600 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNote}
                    disabled={isSaving}
                    className="flex-1 py-3 bg-[#264653] hover:bg-[#1a303a] disabled:bg-gray-200 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#264653]/5 hover:shadow-xl transition-all"
                  >
                    {isSaving ? <Loader className="w-3.5 h-3.5 animate-spin" /> : 'Save Note Card'}
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingNoteId && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-6">
          <div 
            className="absolute inset-0 bg-[#0E1518]/40 backdrop-blur-xs transition-opacity"
            onClick={() => setDeletingNoteId(null)}
          />
          
          <div className="bg-white rounded-3xl border border-gray-100 p-6 max-w-sm w-full relative z-10 shadow-2xl animate-scale-in">
            <div className="flex items-center gap-3 text-rose-600 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="text-base font-serif font-bold text-gray-900">
                Incinerate Note?
              </h4>
            </div>
            
            <p className="text-xs text-gray-500 font-medium leading-relaxed mb-6">
              This action is absolute. This thought record will be permanently deleted from the vault system.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeletingNoteId(null)}
                className="flex-1 py-2.5 border border-gray-200 text-xs font-bold rounded-xl hover:bg-gray-50 text-gray-500 transition-all"
              >
                Retain Note
              </button>
              <button
                onClick={executeDelete}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-rose-600/10"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/* Individual Note Card with Interactive 3D Parallax Tilt */
function NoteCard({ 
  note, 
  onTogglePin, 
  onEdit, 
  onDelete 
}: { 
  note: Note; 
  onTogglePin: () => void; 
  onEdit: () => void; 
  onDelete: () => void; 
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const matchedColor = NOTE_COLORS.find(c => c.id === note.color) || NOTE_COLORS[0];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    
    // Relative mouse coords within card
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Divide to limit rotate degree
    setCoords({ x: x / (rect.width / 15), y: y / (rect.height / 15) });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCoords({ x: 0, y: 0 });
  };

  const formatNoteDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: isHovered 
          ? `perspective(1000px) rotateX(${-coords.y}deg) rotateY(${coords.x}deg) translateY(-4px)` 
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)',
        transition: isHovered ? 'none' : 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
      }}
      className={`rounded-3xl border p-6 min-h-[220px] shadow-[0_4px_20px_rgba(0,0,0,0.015)] hover:shadow-[0_20px_40px_rgba(38,70,83,0.06)] flex flex-col justify-between transition-shadow duration-300 relative group overflow-hidden ${matchedColor.bg} ${matchedColor.border}`}
    >
      {/* 3D ambient light overlay */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle 220px at ${coords.x * 10 + 50}% ${coords.y * 10 + 50}%, rgba(255,255,255,0.6) 0%, transparent 100%)`
        }}
      />

      {/* Note top header with title and pin */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className={`font-serif font-bold text-base leading-tight flex-1 tracking-tight truncate ${matchedColor.text}`}>
            {note.title || <span className="italic opacity-40 font-sans text-sm font-medium">Untitled Note</span>}
          </h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin();
            }}
            className={`p-1.5 rounded-lg border hover:bg-black/5 transition-colors ${
              note.pinned 
                ? 'border-gray-200 text-[#264653]' 
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Pin className={`w-3.5 h-3.5 ${note.pinned ? 'fill-[#264653]' : ''}`} />
          </button>
        </div>

        {/* Note body with elegant depth */}
        <p className="text-xs text-gray-600 leading-relaxed font-medium line-clamp-5 whitespace-pre-wrap">
          {note.content || <span className="italic opacity-30">No additional content entered...</span>}
        </p>
      </div>

      {/* Card footer date + actions */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-black/[0.03] relative z-10">
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatNoteDate(note.createdAt)}
        </span>

        {/* Card actions visible on hover */}
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-black/[0.04] transition-colors"
            title="Edit note"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete note"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
