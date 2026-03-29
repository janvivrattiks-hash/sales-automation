import React from 'react';
import { StickyNote, Plus, Clock, MessageSquare, Trash2 } from 'lucide-react';
import Button from '../ui/Button';

const NotesTab = ({ 
    notesList, 
    isLoadingNotes, 
    isAddingNote, 
    setIsAddingNote, 
    noteTitle, 
    setNoteTitle, 
    noteContent, 
    setNoteContent, 
    isSubmitting, 
    handleAddNote, 
    handleDeleteNote 
}) => {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-900">Notes & Thoughts</h3>
                {!isAddingNote && (
                    <Button
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => setIsAddingNote(true)}
                    >
                        <Plus size={14} /> Add Note
                    </Button>
                )}
            </div>

            {isAddingNote && (
                <div className="bg-white p-6 rounded-2xl border border-primary/20 shadow-lg shadow-primary/5 mb-6">
                    <form onSubmit={handleAddNote} className="space-y-4">
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Title</label>
                            <input
                                type="text"
                                value={noteTitle}
                                onChange={(e) => setNoteTitle(e.target.value)}
                                placeholder="e.g. Follow-up strategy"
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Content</label>
                            <textarea
                                value={noteContent}
                                onChange={(e) => setNoteContent(e.target.value)}
                                placeholder="Write your thoughts here..."
                                rows="3"
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium"
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsAddingNote(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Saving...' : 'Save Note'}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isLoadingNotes ? (
                    <div className="md:col-span-2 flex justify-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : notesList.length > 0 ? (
                    notesList.map((note) => (
                        <div key={note.id || note._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-50 text-indigo-500 rounded-lg">
                                            <StickyNote size={16} />
                                        </div>
                                        <h4 className="font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">{note.title}</h4>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteNote(note.id || note._id)}
                                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">{note.content}</p>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-auto">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <Clock size={12} /> {new Date(note.created_at || note.timestamp).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <MessageSquare size={12} /> {note.id ? 'Self' : 'Team'}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="md:col-span-2 text-center py-10 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-400 text-sm">No notes found for this lead.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotesTab;
