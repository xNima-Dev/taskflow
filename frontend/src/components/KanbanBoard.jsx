import React, { useState } from 'react';
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api from '../utils/api';
import { Plus } from 'lucide-react';

const COLUMNS = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done', title: 'Done' }
];

const SortableTask = ({ task }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-3 rounded shadow-sm border border-gray-200 mb-2 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      <h4 className="font-medium text-gray-800">{task.title}</h4>
      {task.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>}
      <div className="mt-2 flex justify-between items-center text-xs">
        <span className={`px-2 py-0.5 rounded-full ${
          task.priority === 'high' ? 'bg-red-100 text-red-700' :
          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
        }`}>
          {task.priority || 'medium'}
        </span>
      </div>
    </div>
  );
};

const Column = ({ column, tasks, children, setNodeRef }) => {
  return (
    <div ref={setNodeRef} className="bg-gray-50 flex flex-col rounded-lg p-4 min-w-[300px] max-w-[350px] flex-1 min-h-[400px]">
      <h3 className="font-semibold text-gray-700 mb-4">{column.title} <span className="text-gray-400 font-normal text-sm ml-1">({tasks.length})</span></h3>
      <div className="flex-1 overflow-y-auto">
        <SortableContext items={tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
          <div className="min-h-[200px]">
            {tasks.map(task => (
              <SortableTask key={task._id} task={task} />
            ))}
          </div>
        </SortableContext>
        {children}
      </div>
    </div>
  );
};

const KanbanBoard = ({ tasks, projectId, onTaskStatusChange, fetchTasks }) => {
  const [activeTask, setActiveTask] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskColumn, setNewTaskColumn] = useState('todo');
  const [newTaskTitle, setNewTaskTitle] = useState('');

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
    if (!newTaskTitle.trim()) return;
    try {
      await api.post(`/tasks/project/${projectId}`, {
        title: newTaskTitle,
        status: newTaskColumn
      });
      setNewTaskTitle('');
      setShowAddModal(false);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-6 h-full items-start overflow-x-auto pb-4">
        {COLUMNS.map(column => {
          const columnTasks = tasks.filter(t => t.status === column.id);
          // Passing column.id to Droppable for dropping onto empty columns
          return (
            <DroppableColumn key={column.id} column={column} tasks={columnTasks}>
              <button 
                onClick={() => { setNewTaskColumn(column.id); setShowAddModal(true); }}
                className="w-full mt-2 flex items-center justify-center gap-1 text-gray-500 hover:bg-gray-200 py-2 rounded text-sm transition-colors"
              >
                <Plus className="h-4 w-4" /> Add Task
              </button>
            </DroppableColumn>
          );
        })}
      </div>

      <DragOverlay>
        {activeTask ? <SortableTask task={activeTask} /> : null}
      </DragOverlay>

      {/* Simple Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
            <h3 className="font-bold text-lg mb-4">New Task</h3>
            <form onSubmit={handleCreateTask}>
              <input
                autoFocus
                type="text"
                placeholder="Task title..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 mb-4"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DndContext>
  );
};

import { useDroppable } from '@dnd-kit/core';

const DroppableColumn = ({ column, tasks, children }) => {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  return (
    <Column column={column} tasks={tasks} setNodeRef={setNodeRef}>
      {children}
    </Column>
  );
};

export default KanbanBoard;
