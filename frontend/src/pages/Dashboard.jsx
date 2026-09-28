import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Folder, Plus, FileText } from 'lucide-react';

const WorkspaceCard = ({ workspace }) => {
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [showAddProject, setShowAddProject] = useState(false);

  useEffect(() => {
    api.get(`/projects/${workspace._id}`).then(res => setProjects(res.data)).catch(console.error);
  }, [workspace._id]);

  const createProject = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/projects/${workspace._id}`, { name: newProjectName });
      setProjects([...projects, res.data]);
      setNewProjectName('');
      setShowAddProject(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center gap-3 mb-4 border-b pb-4">
        <Folder className="h-6 w-6 text-indigo-500" />
        <h2 className="text-xl font-semibold text-gray-800">{workspace.name}</h2>
      </div>
      
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Projects</h3>
        {projects.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No projects yet</p>
        ) : (
          <ul className="space-y-2">
            {projects.map(proj => (
              <li key={proj._id}>
                <Link to={`/project/${proj._id}`} className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 p-2 rounded hover:bg-indigo-50 transition-colors">
                  <FileText className="h-4 w-4" />
                  {proj.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showAddProject ? (
        <form onSubmit={createProject} className="mt-4">
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Project Name"
            required
            className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm mb-2"
          />
          <div className="flex gap-2">
            <button type="submit" className="bg-indigo-600 text-white px-3 py-1.5 rounded text-sm hover:bg-indigo-700">Add</button>
            <button type="button" onClick={() => setShowAddProject(false)} className="text-gray-500 px-3 py-1.5 rounded text-sm hover:bg-gray-100">Cancel</button>
          </div>
        </form>
      ) : (
        <button onClick={() => setShowAddProject(true)} className="text-sm text-indigo-600 font-medium hover:text-indigo-800 flex items-center gap-1 mt-2">
          <Plus className="h-4 w-4" /> New Project
        </button>
      )}
    </div>
  );
};

const Dashboard = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [error, setError] = useState('');

  const fetchWorkspaces = async () => {
    try {
      const res = await api.get('/workspaces');
      setWorkspaces(res.data);
    } catch (err) {
      setError('Failed to load workspaces');
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const createWorkspace = async (e) => {
    e.preventDefault();
    try {
      await api.post('/workspaces', { name: newWorkspaceName });
      setNewWorkspaceName('');
      fetchWorkspaces();
    } catch (err) {
      setError('Failed to create workspace');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
      {error && <div className="bg-red-50 text-red-500 p-3 rounded mb-4 text-sm">{error}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {workspaces.map((ws) => (
          <WorkspaceCard key={ws._id} workspace={ws} />
        ))}

        <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300 flex flex-col justify-center items-center h-[280px]">
          <form onSubmit={createWorkspace} className="w-full text-center">
            <input
              type="text"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              placeholder="New Workspace Name"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 mb-3"
            />
            <button
              type="submit"
              className="flex items-center justify-center gap-2 w-full bg-white text-indigo-600 border border-indigo-600 py-2 px-4 rounded-md hover:bg-indigo-50"
            >
              <Plus className="h-4 w-4" />
              Create Workspace
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
