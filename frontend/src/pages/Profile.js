import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const initials = (user?.name || user?.email || 'U')
    .split(' ')
    .map(s => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Manage your account settings</p>
      </div>

      <div className="overflow-hidden rounded-2xl shadow-xl bg-white">
        <div className="h-28 bg-gradient-to-r from-purple-600 to-blue-600"></div>
        <div className="px-6 pb-6 -mt-10">
          <div className="flex items-center">
            <div className="h-20 w-20 rounded-full bg-white shadow ring-4 ring-white flex items-center justify-center text-xl font-semibold text-gray-900">
              <div className="h-18 w-18 rounded-full bg-gray-100 flex items-center justify-center">
                {initials}
              </div>
            </div>
            <div className="ml-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-gray-900">{user?.name || 'User'}</h2>
                <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800 border border-green-200">
                  {user?.plan || 'Free'}
                </span>
              </div>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="card">
              <p className="text-xs text-gray-500">Storage</p>
              <p className="text-lg font-semibold text-gray-900">{user?.maxStorage ? `${Math.round(user.maxStorage / (1024*1024*1024))} GB` : '—'}</p>
            </div>
            <div className="card">
              <p className="text-xs text-gray-500">Daily Uploads</p>
              <p className="text-lg font-semibold text-gray-900">{user?.maxDailyUploads || '—'}</p>
            </div>
            <div className="card">
              <p className="text-xs text-gray-500">Member Since</p>
              <p className="text-lg font-semibold text-gray-900">{user?.createdAt ? new Date(user.createdAt._seconds ? user.createdAt._seconds * 1000 : user.createdAt).toLocaleDateString() : '—'}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/billing" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200">Manage Plan</a>
            <a href="#" className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-800 hover:bg-gray-50">Edit Profile</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
