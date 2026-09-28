import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Folder, Plus, FileText, Users, UserPlus, Shield, X, AlertCircle } from 'lucide-react';

const WorkspaceCard = ({ workspace, onUpdate, currentUserId }) => {
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [showAddProject, setShowAddProject] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [cardError, setCardError] = useState('');
  const [cardSuccess, setCardSuccess] = useState('');

  const currentUserMembership = workspace.members.find(
    (m) => (m.user?._id || m.user) === currentUserId
  );
  const isAdmin = currentUserMembership?.role === 'admin' || (workspace.owner?._id || workspace.owner) === currentUserId;

  useEffect(() => {
    api.get(`/projects/${workspace._id}`)
      .then(res => setProjects(res.data))
      .catch(err => setCardError(err.response?.data?.message || 'Failed to load projects'));
  }, [workspace._id]);

  const createProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    try {
      setCardError('');
      const res = await api.post(`/projects/${workspace._id}`, {
        name: newProjectName.trim(),
        description: newProjectDesc.trim()
      });
      setProjects([...projects, res.data]);
      setNewProjectName('');
      setNewProjectDesc('');
      setShowAddProject(false);
    } catch (err) {
      setCardError(err.response?.data?.message || 'Failed to create project');
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    try {
      setCardError('');
      await api.post(`/workspaces/${workspace._id}/members`, {
        email: inviteEmail.trim(),
        role: inviteRole
      });
      setInviteEmail('');
      setShowInviteModal(false);
      setCardSuccess('Member successfully invited!');
      setTimeout(() => setCardSuccess(''), 4000);
      onUpdate();
    } catch (err) {
      setCardError(err.response?.data?.message || 'Failed to invite member');
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-200 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        {/* Workspace Header */}
        <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Folder className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">{workspace.name}</h2>
              <span className="text-[11px] text-gray-500 font-medium">
                Owner: {workspace.owner?.name || workspace.owner?.email || 'Admin'}
              </span>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
            isAdmin ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {isAdmin ? 'Admin' : 'Member'}
          </span>
        </div>

        {/* Feedback messages */}
        {cardError && (
          <div className="p-2.5 mb-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex justify-between items-center">
            <span>{cardError}</span>
            <button onClick={() => setCardError('')}><X className="h-3 w-3" /></button>
          </div>
        )}
        {cardSuccess && (
          <div className="p-2.5 mb-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-xs">
            {cardSuccess}
          </div>
        )}

        {/* Projects List */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Projects</h3>
            <span className="text-xs text-gray-400 font-medium">{projects.length}</span>
          </div>

          {projects.length === 0 ? (
            <p className="text-xs text-gray-400 italic py-2">No projects yet in this workspace</p>
          ) : (
            <ul className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {projects.map(proj => (
                <li key={proj._id}>
                  <Link
                    to={`/project/${proj._id}`}
                    className="flex items-center justify-between text-gray-700 hover:text-indigo-600 p-2 rounded-lg hover:bg-indigo-50/70 text-xs font-medium transition-colors"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <FileText className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" />
                      <span className="truncate">{proj.name}</span>
                    </span>
                    <span className="text-[11px] text-indigo-500 hover:underline">Board →</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Workspace Team Members */}
        <div className="mb-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-gray-400" />
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Team</h3>
            </div>
            {isAdmin && (
              <button
                onClick={() => {
                  setCardError('');
                  setShowInviteModal(true);
                }}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                title="Invite team member"
              >
                <UserPlus className="h-3 w-3" /> Invite
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {workspace.members.map((m, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 text-gray-700"
                title={m.user?.email}
              >
                {m.role === 'admin' && <Shield className="h-2.5 w-2.5 text-indigo-600" />}
                {m.user?.name || m.user?.email || 'User'}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Add Project Form / Button */}
      <div className="pt-3 border-t border-gray-100">
        {showAddProject ? (
          <form onSubmit={createProject} className="space-y-2">
            <input
              autoFocus
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Project Name *"
              required
              className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
            />
            <input
              type="text"
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
              placeholder="Description (optional)"
              className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-indigo-700"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowAddProject(false)}
                className="text-gray-500 px-3 py-1.5 rounded-lg text-xs hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowAddProject(true)}
            className="text-xs text-indigo-600 font-semibold hover:text-indigo-800 flex items-center gap-1 py-1"
          >
            <Plus className="h-3.5 w-3.5" /> New Project
          </button>
        )}
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-sm text-gray-900">Invite Team Member</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Enter the registered email of the user you want to add to <strong>{workspace.name}</strong>.
            </p>

            <form onSubmit={handleInviteMember} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">User Email *</label>
                <input
                  autoFocus
                  type="email"
                  placeholder="colleague@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="member">Member (Can view & manage tasks)</option>
                  <option value="admin">Admin (Can invite members & manage projects)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
                >
                  Add to Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchWorkspaces = async () => {
    try {
      setError('');
      const res = await api.get('/workspaces');
      setWorkspaces(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const createWorkspace = async (e) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    try {
      setError('');
      await api.post('/workspaces', { name: newWorkspaceName.trim() });
      setNewWorkspaceName('');
      fetchWorkspaces();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create workspace');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Workspaces</h1>
          <p className="text-sm text-gray-500 mt-1">Manage team projects, assign tasks, and collaborate.</p>
        </div>
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

      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">Loading your workspaces...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((ws) => (
            <WorkspaceCard
              key={ws._id}
              workspace={ws}
              onUpdate={fetchWorkspaces}
              currentUserId={currentUser.id || currentUser._id}
            />
          ))}

          {/* New Workspace Creation Card */}
          <div className="bg-gray-50/80 p-6 rounded-xl border-2 border-dashed border-gray-300 flex flex-col justify-center items-center min-h-[260px] hover:border-indigo-400 transition-colors">
            <form onSubmit={createWorkspace} className="w-full text-center space-y-3">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full inline-flex mb-1">
                <Plus className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-700">Create New Workspace</h3>
              <input
                type="text"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                placeholder="e.g. Engineering Team"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
              <button
                type="submit"
                className="flex items-center justify-center gap-1.5 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg text-xs shadow-xs transition-colors"
              >
                Create Workspace
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
