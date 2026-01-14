import { useState, useEffect } from 'react';
import { notes, auth } from '../api';
import { LogOut, Plus, Trash2, StickyNote, X, Edit, Save } from 'lucide-react';

const Dashboard = () => {
    const [userNotes, setUserNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState(null); // Track which note is being edited
    const [newNoteTitle, setNewNoteTitle] = useState('');
    const [newNoteContent, setNewNoteContent] = useState('');
    const [activeNote, setActiveNote] = useState(null);


    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const data = await notes.getAll();
            setUserNotes(data);
        } catch (err) {
            console.error('Failed to fetch notes:', err);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setNewNoteTitle('');
        setNewNoteContent('');
        setIsCreating(false);
        setEditingId(null);
    };

    const handleSaveNote = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                // Update existing note
                const updatedNote = await notes.update(editingId, newNoteTitle, newNoteContent);
                setUserNotes(userNotes.map(n => n.id === editingId ? updatedNote : n));
            } else {
                // Create new note
                const newNote = await notes.create(newNoteTitle, newNoteContent);
                setUserNotes([newNote, ...userNotes]);
            }
            resetForm();
        } catch (err) {
            console.error('Failed to save note:', err);
        }
    };

    const handleEditClick = (note) => {
        setNewNoteTitle(note.title);
        setNewNoteContent(note.content);
        setEditingId(note.id);
        setIsCreating(true); // Re-use the creation modal for editing
    };

    const handleDeleteNote = async (id) => {
        if (!window.confirm('Are you sure you want to delete this note?')) return;
        try {
            await notes.delete(id);
            setUserNotes(userNotes.filter(n => n.id !== id));
        } catch (err) {
            console.error('Failed to delete note:', err);
        }
    };

    return (
        <div className="fade-in">
            <header className="dashboard-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '8px', display: 'flex' }}>
                        <StickyNote color="white" size={24} />
                    </div>
                    <h1>My Notes</h1>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => { resetForm(); setIsCreating(true); }} disabled={isCreating}>
                        <Plus size={18} /> New Note
                    </button>

                    <button className="secondary" onClick={auth.logout}>
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </header>

            {isCreating && (
                <div className="glass-panel" style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid var(--primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3>{editingId ? 'Edit Note' : 'Create New Note'}</h3>
                        <button className="icon-btn secondary" onClick={resetForm}>
                            <X size={18} />
                        </button>
                    </div>

                    <form onSubmit={handleSaveNote}>
                        <div className="form-group">
                            <input
                                type="text"
                                placeholder="Note Title"
                                value={newNoteTitle}
                                onChange={(e) => setNewNoteTitle(e.target.value)}
                                required
                                autoFocus
                                style={{ fontSize: '1.2rem', fontWeight: 'bold' }}
                            />
                        </div>

                        <div className="form-group">
                            <textarea
                                placeholder="Write your note here..."
                                value={newNoteContent}
                                onChange={(e) => setNewNoteContent(e.target.value)}
                                required
                                rows={5}
                                style={{ resize: 'vertical' }}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button type="button" className="secondary" onClick={resetForm}>Cancel</button>
                            <button type="submit">
                                {editingId ? <><Save size={18} /> Update Note</> : 'Save Note'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="flex-center" style={{ padding: '3rem' }}>
                    <div className="glass-panel" style={{ padding: '1rem 2rem' }}>Loading notes...</div>
                </div>
            ) : userNotes.length === 0 ? (
                <div className="flex-center" style={{ flexDirection: 'column', padding: '3rem', opacity: 0.7 }}>
                    <StickyNote size={64} style={{ marginBottom: '1rem', color: 'var(--text-muted)' }} />
                    <h3>No notes yet</h3>
                    <p>Click "New Note" to get started!</p>
                </div>
            ) : (
                <div className="notes-grid">
                    {userNotes.map((note) => (
                        <div
                            key={note.id}
                            className="glass-panel note-card fade-in"
                            onClick={() => setActiveNote(note)}
                        >
                            <div>
                                <div className="note-title">{note.title}</div>
                                <div className="note-content">{note.content}</div>
                            </div>

                            <div className="note-footer" style={{ gap: '0.5rem' }}>
                                <button
                                    className="icon-btn secondary"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditClick(note);
                                    }}
                                    title="Edit Note"
                                >
                                    <Edit size={16} />
                                </button>
                               <button
                                    className="icon-btn danger"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteNote(note.id);
                                    }}
                                    title="Delete Note"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeNote && (
                <div className="glass-panel" style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid var(--primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3>Edit Note</h3>
                        <button className="icon-btn secondary" onClick={() => setActiveNote(null)}>
                            <X size={18} />
                        </button>
                    </div>

                    <form onSubmit={handleSaveNote}>
                        <div className="form-group">
                            <input
                                type="text"
                                placeholder="Note Title"
                                value={activeNote.title}
                                onChange={(e) => setActiveNote({ ...activeNote, title: e.target.value })}
                                required
                                autoFocus
                                style={{ fontSize: '1.2rem', fontWeight: 'bold' }}
                            />
                        </div>

                        <div className="form-group">
                            <textarea
                                placeholder="Write your note here..."
                                value={activeNote.content}
                                onChange={(e) => setActiveNote({ ...activeNote, content: e.target.value })}
                                required
                                rows={5}
                                style={{ resize: 'vertical' }}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                            <button type="button" className="secondary" onClick={() => setActiveNote(null)}>
                                Cancel
                            </button>
                            <button type="submit">
                                <Save size={18} /> Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            )}
            {activeNote && (
  <div className="note-modal-overlay" onClick={() => setActiveNote(null)}>
    <div
      className="glass-panel note-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="note-modal-header">
            <div className="note-modal-title">
            {activeNote.title}
            </div>
        <button
          className="icon-btn secondary"
          onClick={() => setActiveNote(null)}
          aria-label='Close note'
        >
          <X size={18} />
        </button>
      </div>

      <div className="note-modal-content">
        {activeNote.content}
      </div>
    </div>
  </div>
)}
        </div>
    );
};

export default Dashboard;
