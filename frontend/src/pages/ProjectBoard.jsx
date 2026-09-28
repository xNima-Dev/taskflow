import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import KanbanBoard from '../components/KanbanBoard';
import StatsDashboard from '../components/StatsDashboard';
import { ArrowLeft } from 'lucide-react';

const ProjectBoard = () => {
  const { projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/tasks/project/${projectId}`);
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to load tasks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      // Optimistic UI update
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      await api.put(`/tasks/${taskId}`, { status: newStatus });
    } catch (err) {
      console.error(err);
      fetchTasks(); // Revert on failure
    }
  };

  if (loading) return <div className="text-center py-8">Loading project...</div>;

  return (
    <div className="flex flex-col h-full space-y-6">
      <div>
        <Link to="/" className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mb-4 text-sm font-medium">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Board</h1>
      </div>

      <StatsDashboard tasks={tasks} />

      <div className="flex-1 bg-white p-6 rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <KanbanBoard tasks={tasks} projectId={projectId} onTaskStatusChange={handleTaskStatusChange} fetchTasks={fetchTasks} />
      </div>
    </div>
  );
};

export default ProjectBoard;
