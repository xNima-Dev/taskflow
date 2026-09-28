import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const StatsDashboard = ({ tasks }) => {
  const total = tasks.length;
  
  const statusCounts = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, { todo: 0, 'in-progress': 0, done: 0 });

  const doneCount = statusCounts.done;
  const completionPercent = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  const overdueCount = tasks.filter(t => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < new Date()).length;

  const pieData = [
    { name: 'To Do', value: statusCounts.todo },
    { name: 'In Progress', value: statusCounts['in-progress'] },
    { name: 'Done', value: statusCounts.done }
  ];

  const COLORS = ['#94a3b8', '#60a5fa', '#4ade80'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-gray-500 text-sm font-medium">Total Tasks</h3>
        <p className="text-3xl font-bold text-gray-900 mt-1">{total}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-gray-500 text-sm font-medium">Completion</h3>
        <p className="text-3xl font-bold text-green-600 mt-1">{completionPercent}%</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-gray-500 text-sm font-medium">Overdue</h3>
        <p className="text-3xl font-bold text-red-600 mt-1">{overdueCount}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-32 relative">
        <h3 className="text-gray-500 text-sm font-medium mb-1 absolute z-10">Status Distribution</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={45}
              paddingAngle={5}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatsDashboard;
