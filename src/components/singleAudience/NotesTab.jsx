import React from 'react';
import { StickyNote, Plus, Clock, MessageSquare, Trash2, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

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
    openDeleteModal,
    confirmDeleteNote,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen
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

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                {isLoadingNotes ? (
                    <div className="md:col-span-2 flex justify-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : notesList.length > 0 ? (
                    notesList.map((note, index) => {
                        // Maximum Discovery for individual note fields
                        const title = note.note_name || note.title || note.note_title || note.header || note.subject || note.topic || note.name || `Note #${index + 1}`;
                        const content = note.comments || note.content || note.note_body || note.note || note.text || note.body || note.comment || note.message || 'No comment found';
                        const timestamp = note.created_at || note.timestamp || note.date || note.updated_at || note.time;
                        const author = note.author || note.user || (note.id ? 'Self' : 'Team');

                        // Robust ID discovery for deletion
                        const deleteId = note.note_id || note.id || note._id || index;

                        return (
                            <div key={`${deleteId}-${index}`} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between relative overflow-hidden">
                                {/* {note.isGlobal && (
                                    <div className="absolute top-0 right-0 bg-amber-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-tighter">
                                        Global
                                    </div>
                                )} */}
                                <div>
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-50 text-indigo-500 rounded-lg">
                                                <StickyNote size={16} />
                                            </div>
                                            <h4 className="font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">{title}</h4>
                                        </div>
                                        <button
                                            onClick={() => openDeleteModal(deleteId)}
                                            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">{content}</p>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-auto">
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        <Clock size={12} /> {timestamp ? new Date(timestamp).toLocaleDateString() : 'Recent'}
                                    </div>
                                    {/* <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        <MessageSquare size={12} /> {author}
                                    </div> */}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="md:col-span-2 text-center py-10 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-400 text-sm">No notes found for this lead.</p>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                title="Confirm Deletion"
                footer={(
                    <div className="flex justify-end gap-3 w-full">
                        <Button
                            variant="secondary"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={confirmDeleteNote}
                            disabled={isSubmitting}
                            className="bg-red-500 hover:bg-red-600 border-red-500 text-white"
                        >
                            {isSubmitting ? 'Deleting...' : 'Delete Note'}
                        </Button>
                    </div>
                )}
            >
                <div className="flex flex-col items-center text-center py-4">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Delete this note?</h3>
                    <p className="text-sm text-gray-500 leading-relaxed max-w-[280px]">
                        This action cannot be undone. This note will be permanently removed from your records.
                    </p>
                </div>
            </Modal>
        </div>
    );
};

export default NotesTab;
