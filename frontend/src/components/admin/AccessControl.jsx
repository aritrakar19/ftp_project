import { useState, useEffect } from 'react';
import { Key, FolderOpen, Shield, User as UserIcon } from 'lucide-react';
import api from '../../api/axios';

const AccessControl = () => {
  const [galleries, setGalleries] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [galRes, usrRes] = await Promise.all([
        api.get('/galleries'),
        api.get('/admin/users')
      ]);
      setGalleries(galRes.data);
      // Filter out admins from access control, since they already have full access?
      // Actually, standard admin/user management implies admins have all access, but let's show all for now.
      setUsers(usrRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleToggleAccess = async (galleryId, userId, hasAccess) => {
    try {
      if (hasAccess) {
        await api.post('/admin/access/revoke', { targetId: galleryId, userId, type: 'gallery' });
      } else {
        await api.post('/admin/access/grant', { targetId: galleryId, userId, type: 'gallery' });
      }
      fetchData(); // Reload access data
    } catch (err) {
      alert('Failed to update access');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Access Control</h2>
          <p className="text-sm text-gray-400">Manage which galleries each user can download from.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : users.map(user => (
          <div key={user._id} className="glass-strong rounded-2xl p-5 border border-white/10 flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">{user.name}</h3>
                <p className="text-xs text-gray-400">{user.email} • {user.role}</p>
              </div>
            </div>

            <hr className="border-white/10" />
            
            <div>
              <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <FolderOpen className="w-4 h-4" /> Granted Galleries
              </h4>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                {galleries.map(gallery => {
                  const hasAccess = gallery.allowedUsers?.includes(user._id);
                  return (
                    <div key={gallery._id} className="flex justify-between items-center bg-black/20 px-3 py-2 rounded-lg">
                      <div className="flex items-center gap-3">
                        {gallery.resolvedCover ? (
                           <img src={`http://localhost:5001${gallery.resolvedCover}`} className="w-8 h-8 rounded-md object-cover" />
                        ) : (
                           <div className="w-8 h-8 rounded-md bg-white/5 flex items-center justify-center">
                             <Key className="w-4 h-4 text-gray-500" />
                           </div>
                        )}
                        <span className="text-sm text-gray-300">{gallery.title}</span>
                      </div>
                      
                      <button
                        onClick={() => handleToggleAccess(gallery._id, user._id, hasAccess)}
                        className={`text-xs px-3 py-1 font-semibold rounded-lg ${hasAccess ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'}`}
                      >
                        {hasAccess ? 'Revoke Access' : 'Grant Access'}
                      </button>
                    </div>
                  );
                })}
                {galleries.length === 0 && (
                  <p className="text-sm text-gray-500">No galleries available.</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccessControl;
