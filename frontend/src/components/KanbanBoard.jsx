import React, { useState } from 'react';
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api from '../utils/api';
import { Plus, Trash2, Calendar, User, AlertCircle } from 'lucide-react';

const COLUMNS = [
  { id: 'todo', title: 'To Do', color: 'border-slate-400' },
  { id: 'in-progress', title: 'In Progress', color: 'border-blue-500' },
  { id: 'done', title: 'Done', color: 'border-green-500' }
];

const SortableTask = ({ task, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const isOverdue = task.status !== 'done' && task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-3.5 rounded-lg shadow-sm border border-gray-200 mb-2.5 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group relative"
    >
      <div className="flex justify-between items-start gap-2">
        <h4 className="font-semibold text-gray-800 text-sm">{task.title}</h4>
        {onDelete && (
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task._id);
            }}
            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded"
            title="Delete task"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {task.description && (
        <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">{task.description}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-1 text-xs pt-2 border-t border-gray-100">
        <span className={`px-2 py-0.5 font-medium rounded-full text-[11px] capitalize ${
          task.priority === 'high' ? 'bg-red-50 text-red-700 border border-red-200' :
          task.priority === 'medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 
          'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
          {task.priority || 'medium'}
        </span>

        {task.dueDate && (
          <span className={`flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded ${
            isOverdue ? 'bg-red-100 text-red-700 font-semibold' : 'text-gray-500'
          }`} title={isOverdue ? 'Overdue!' : 'Due date'}>
            <Calendar className="h-3 w-3" />
            {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        )}

        {task.assigneeId && (
          <span className="flex items-center gap-1 text-[11px] text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded max-w-[110px] truncate" title={`Assigned to ${task.assigneeId.name || task.assigneeId.email}`}>
            <User className="h-3 w-3 text-indigo-500 flex-shrink-0" />
            <span className="truncate">{task.assigneeId.name || task.assigneeId.email}</span>
          </span>
        )}
      </div>
    </div>
  );
};

const DroppableColumn = ({ column, tasks, children }) => {
  const { setNodeRef } = useDroppable({ id: column.id });

  return (
    <div ref={setNodeRef} className={`bg-gray-50 flex flex-col rounded-xl p-4 min-w-[300px] max-w-[340px] flex-1 min-h-[480px] border-t-4 ${column.color} shadow-xs`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-800 text-sm tracking-wide">{column.title}</h3>
        <span className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto">
        <SortableContext items={tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
          <div className="min-h-[160px]">
            {tasks.map(task => (
              <SortableTask key={task._id} task={task} onDelete={children.props?.onDeleteTask} />
            ))}
          </div>
        </SortableContext>
        {children}
      </div>
    </div>
  );
};

const KanbanBoard = ({ tasks, projectId, members = [], onTaskStatusChange, fetchTasks, onError }) => {
  const [activeTask, setActiveTask] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalColumn, setModalColumn] = useState('todo');

  // Full Task Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [formError, setFormError] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveTask(tasks.find(t => t._id === active.id));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const isOverAColumn = COLUMNS.find(c => c.id === overId);
    let newStatus;

    if (isOverAColumn) {
      newStatus = overId;
    } else {
      const overTask = tasks.find(t => t._id === overId);
      if (overTask) {
        newStatus = overTask.status;
      }
    }

    if (newStatus && activeTask && activeTask.status !== newStatus) {
      onTaskStatusChange(activeId, newStatus);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Task title is required');
      return;
    }

    try {
      await api.post(`/tasks/project/${projectId}`, {
        title: title.trim(),
        description: description.trim(),
        status: modalColumn,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        assigneeId: assigneeId || undefined
      });

      // Reset
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      setAssigneeId('');
      setFormError('');
      setShowAddModal(false);
      fetchTasks();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create task');
      if (onError) onError(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchTasks();
    } catch (err) {
      if (onError) onError(err.response?.data?.message || 'Failed to delete task');
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-5 h-full items-start overflow-x-auto pb-4">
        {COLUMNS.map(column => {
          const columnTasks = tasks.filter(t => t.status === column.id);
          return (
            <DroppableColumn key={column.id} column={column} tasks={columnTasks}>
              <div onDeleteTask={handleDeleteTask}>
                <button
                  onClick={() => {
                    setModalColumn(column.id);
                    setFormError('');
                    setShowAddModal(true);
                  }}
                  className="w-full mt-2 flex items-center justify-center gap-1.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 border border-dashed border-gray-300 hover:border-indigo-300 py-2 rounded-lg text-xs font-medium transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Task
                </button>
              </div>
            </DroppableColumn>
          );
        })}
      </div>

      <DragOverlay>
        {activeTask ? <SortableTask task={activeTask} /> : null}
      </DragOverlay>

      {/* Comprehensive Task Creation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <h3 className="font-bold text-lg text-gray-900 mb-1">Create New Task</h3>
            <p className="text-xs text-gray-500 mb-4">Adding task to column <span className="font-semibold capitalize text-indigo-600">{modalColumn}</span></p>

            {formError && (
              <div className="flex items-center gap-2 p-2.5 mb-4 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateTask} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Title *</label>
                <input
                  autoFocus
                  type="text"
                  placeholder="e.g. Implement OAuth login"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Task details and acceptance criteria..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Assignee</label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Unassigned</option>
                  {members.map(m => (
                    <option key={m.user?._id || m.user} value={m.user?._id || m.user}>
                      {m.user?.name || m.user?.email || 'Member'} ({m.role || 'member'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DndContext>
  );
};

export default KanbanBoard;
