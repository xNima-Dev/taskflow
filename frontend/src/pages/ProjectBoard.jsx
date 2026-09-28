import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import KanbanBoard from '../components/KanbanBoard';
import StatsDashboard from '../components/StatsDashboard';
import { ArrowLeft, AlertCircle, Users, RefreshCw } from 'lucide-react';

const ProjectBoard = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProjectAndTasks = useCallback(async () => {
    try {
      setError('');
      const [projRes, tasksRes] = await Promise.all([
        api.get(`/projects/detail/${projectId}`),
        api.get(`/tasks/project/${projectId}`)
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load project details or tasks');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProjectAndTasks();
  }, [fetchProjectAndTasks]);

  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      // Optimistic UI update
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      await api.put(`/tasks/${taskId}`, { status: newStatus });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task status');
      fetchProjectAndTasks(); // Revert on failure
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3 text-gray-500">
        <RefreshCw className="h-6 w-6 animate-spin text-indigo-600" />
        <p className="text-sm font-medium">Loading project workspace...</p>
      </div>
    );
  }

  const members = project?.workspace?.members || [];

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/" className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 mb-2 text-xs font-semibold">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Workspaces
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{project?.name || 'Project Board'}</h1>
          {project?.description && (
            <p className="text-sm text-gray-500 mt-1">{project.description}</p>
          )}
        </div>

        {/* Team Members Pill */}
        {members.length > 0 && (
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-2xs self-start sm:self-auto">
            <Users className="h-4 w-4 text-indigo-500" />
            <span className="text-xs font-medium text-gray-700">Team:</span>
            <div className="flex -space-x-1.5">
              {members.slice(0, 4).map((m, idx) => (
                <div
                  key={idx}
                  className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-indigo-700"
                  title={`${m.user?.name || m.user?.email} (${m.role})`}
                >
                  {(m.user?.name || m.user?.email || 'M').charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
            {members.length > 4 && (
              <span className="text-[11px] text-gray-500 font-medium">+{members.length - 4}</span>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center justify-between p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-xs underline hover:text-red-900">Dismiss</button>
        </div>
      )}

      {/* Analytics KPI Dashboard */}
      <StatsDashboard tasks={tasks} />

      {/* Kanban Board with full task management */}
      <div className="flex-1 bg-white p-6 rounded-xl shadow-xs border border-gray-200 overflow-x-auto">
        <KanbanBoard
          tasks={tasks}
          projectId={projectId}
          members={members}
          onTaskStatusChange={handleTaskStatusChange}
          fetchTasks={fetchProjectAndTasks}
          onError={(msg) => setError(msg)}
        />
      </div>
    </div>
  );
};

export default ProjectBoard;
