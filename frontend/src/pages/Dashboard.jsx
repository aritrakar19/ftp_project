import { useState, useEffect } from 'react';
import { Plus, Image as ImageIcon, Download, Settings, Users, ArrowUpRight } from 'lucide-react';
import UploadModal from '../components/UploadModal';
import api from '../api/axios';

const StatCard = ({ title, value, icon: Icon, trend }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:border-indigo-100 transition-colors">
    <div className="flex justify-between items-start mb-4">
      <div className="bg-indigo-50 p-3 rounded-xl">
        <Icon className="w-6 h-6 text-indigo-600" />
      </div>
      {trend && (
        <span className="flex items-center text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
          {trend}
          <ArrowUpRight className="w-3 h-3 ml-1" />
        </span>
      )}
    </div>
    <p className="text-gray-500 font-medium text-sm mb-1">{title}</p>
    <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</h3>
  </div>
);

const Dashboard = () => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [stats, setStats] = useState({ totalImages: 0 });

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/images');
      setStats({ totalImages: data.count || 0 });
    } catch (error) {
      console.error('Failed to fetch stats', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage your gallery, users, and settings</p>
          </div>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="bg-indigo-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-indigo-700 transition-all flex items-center shadow-md transform hover:-translate-y-0.5 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="w-5 h-5 mr-2" />
            Upload Photo
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Photos" value={stats.totalImages} icon={ImageIcon} trend="+12%" />
          <StatCard title="Total Downloads" value="24" icon={Download} trend="+5%" />
          <StatCard title="Active Users" value="2" icon={Users} />
          <StatCard title="Storage Used" value="4.2 GB" icon={Settings} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center mt-12 bg-gradient-to-br from-indigo-50 to-white">
          <div className="bg-indigo-100 w-20 h-20 rounded-2xl mx-auto flex items-center justify-center mb-6 transform rotate-3">
            <ImageIcon className="w-10 h-10 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Ready to expand your gallery?</h2>
          <p className="text-gray-500 max-w-lg mx-auto mb-8">
            Upload new high-resolution photos, tag them for easy search, and organize them into beautiful collections.
          </p>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="bg-indigo-600 text-white font-semibold flex items-center shadow-lg transform hover:-translate-y-1 transition-all focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 px-6 py-3 rounded-lg mx-auto"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Photo
          </button>
        </div>
      </div>

      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        onUploadSuccess={fetchStats}
      />
    </>
  );
};

export default Dashboard;
