import { Clock, Plus, Trash2, Bell, Pencil, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import DeleteConfirmModal from '../ui/DeleteConfirmModal';

const TasksTab = ({ 
    tasksList, 
    isLoadingTasks, 
    isAddingTask, 
    setIsAddingTask, 
    taskName, 
    setTaskName, 
    taskDueDate, 
    setTaskDueDate, 
    taskStatus, 
    setTaskStatus, 
    taskDescription, 
    setTaskDescription, 
    isSubmitting, 
    handleAddTask,
    openDeleteTaskModal,
    confirmDeleteTask,
    isDeleteTaskDialogOpen,
    setIsDeleteTaskDialogOpen,
    handleEditTask,
    handleTriggerReminders,
    isTriggeringReminders,
    isEditingTask,
    resetTaskForm,
}) => {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-900">Tasks & Actions</h3>
                <div className="flex items-center gap-3">
                    {!isAddingTask && (
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2 border-primary/20 text-primary hover:bg-primary/5"
                                onClick={handleTriggerReminders}
                                disabled={isTriggeringReminders}
                            >
                                <Bell size={14} className={isTriggeringReminders ? 'animate-bounce' : ''} />
                                {isTriggeringReminders ? 'Triggering...' : 'Trigger Reminders'}
                            </Button>
                            <Button
                                size="sm"
                                className="flex items-center gap-2"
                                onClick={() => setIsAddingTask(true)}
                            >
                                <Plus size={14} /> Add Task
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {isAddingTask && (
                <div className="bg-white p-6 rounded-2xl border border-primary/20 shadow-lg shadow-primary/5 mb-6">
                    <form onSubmit={handleAddTask} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Task Name</label>
                            <input
                                type="text"
                                value={taskName}
                                onChange={(e) => setTaskName(e.target.value)}
                                placeholder="e.g. Design mockup"
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Due Date</label>
                            <input
                                type="date"
                                value={taskDueDate}
                                onChange={(e) => setTaskDueDate(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Status</label>
                            <select
                                value={taskStatus}
                                onChange={(e) => setTaskStatus(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium"
                            >
                                <option value="To Do">To Do</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                                <option value="Not Completed">Not Completed</option>
                            </select>
                        </div>
                        <div className="md:col-span-3">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Description</label>
                            <textarea
                                value={taskDescription}
                                onChange={(e) => setTaskDescription(e.target.value)}
                                placeholder="e.g. create pages"
                                rows="2"
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium"
                                required
                            />
                        </div>
                        <div className="md:col-span-3 flex justify-end gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={resetTaskForm}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (isEditingTask ? 'Updating...' : 'Creating...') : (isEditingTask ? 'Update Task' : 'Create Task')}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                {isLoadingTasks ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : tasksList.length > 0 ? (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Task Name</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4">Due Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {tasksList.map(task => (
                                <tr key={task.id || task._id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 font-bold text-gray-900">{task.task_name}</td>
                                    <td className="px-6 py-4 text-gray-600 text-xs italic" title={task.description}>
                                        <div className="max-w-[200px] truncate">{task.description || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-gray-500 font-medium whitespace-nowrap">
                                            <Clock size={12} /> {task.due_date}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border whitespace-nowrap
                                            ${task.status === 'Completed' ? 'bg-green-50 text-green-600 border-green-100' :
                                                task.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                    task.status === 'Not Completed' ? 'bg-red-50 text-red-600 border-red-100' :
                                                        'bg-gray-50 text-gray-600 border-gray-200'}`
                                        }>
                                            {task.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center items-center gap-2">
                                            <button 
                                                onClick={() => handleEditTask(task)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Update Task"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button 
                                                onClick={() => openDeleteTaskModal(task)}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete Task"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-gray-400 text-sm">No tasks found. Click "Add Task" to create one.</p>
                    </div>
                )}
            </div>

            <DeleteConfirmModal 
                isOpen={isDeleteTaskDialogOpen}
                onClose={() => setIsDeleteTaskDialogOpen(false)}
                onConfirm={confirmDeleteTask}
                title="Delete Task?"
                description="Are you sure you want to delete this task? This action cannot be undone and will permanently remove the task from your records."
                isDeleting={isSubmitting}
            />
        </div>
    );
};

export default TasksTab;
