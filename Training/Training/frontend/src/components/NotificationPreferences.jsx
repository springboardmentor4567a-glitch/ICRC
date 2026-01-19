import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/api';

export default function NotificationPreferences() {
  const [preferences, setPreferences] = useState({
    notify_claim_updates: true,
    notify_policy_updates: true,
    notify_promotions: false,
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const userId = localStorage.getItem('user_id');
      
      if (!userId || !token) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/users/${userId}/notification-preferences`,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      } else if (response.status === 404) {
        // User not found, keep defaults
        console.log('Using default preferences');
      } else {
        setError('Failed to load preferences');
      }
    } catch (err) {
      setError('Failed to load preferences');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const userId = localStorage.getItem('user_id');
      
      if (!userId || !token) {
        setError('User not authenticated');
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/users/${userId}/notification-preferences`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(preferences),
        }
      );
      
      if (response.ok) {
        setSaved(true);
        setError('');
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError('Failed to save preferences');
      }
    } catch (err) {
      setError('Failed to save preferences');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading preferences...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-2 text-gray-800">Email Notification Preferences</h2>
      <p className="text-gray-600 mb-6">Control when you receive email notifications from Insurance ASIS</p>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded flex items-start">
          <span className="mr-2">⚠️</span>
          <span>{error}</span>
        </div>
      )}
      
      {saved && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded flex items-start">
          <span className="mr-2">✓</span>
          <span>Preferences saved successfully!</span>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">Claim Status Updates</h3>
            <p className="text-sm text-gray-600 mt-1">
              Get notified when your claims are submitted, reviewed, or approved/rejected
            </p>
          </div>
          <label className="flex items-center cursor-pointer ml-4 flex-shrink-0">
            <input
              type="checkbox"
              checked={preferences.notify_claim_updates}
              onChange={() => handleToggle('notify_claim_updates')}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
            />
          </label>
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">Policy Updates</h3>
            <p className="text-sm text-gray-600 mt-1">
              Get notified about policy renewals, price changes, coverage updates, and expiration notices
            </p>
          </div>
          <label className="flex items-center cursor-pointer ml-4 flex-shrink-0">
            <input
              type="checkbox"
              checked={preferences.notify_policy_updates}
              onChange={() => handleToggle('notify_policy_updates')}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
            />
          </label>
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-800">Promotional Offers</h3>
            <p className="text-sm text-gray-600 mt-1">
              Get notified about special offers, discounts, and new insurance products
            </p>
          </div>
          <label className="flex items-center cursor-pointer ml-4 flex-shrink-0">
            <input
              type="checkbox"
              checked={preferences.notify_promotions}
              onChange={() => handleToggle('notify_promotions')}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
            />
          </label>
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <button
          onClick={handleSave}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Save Preferences
        </button>
        <button
          onClick={fetchPreferences}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Reset
        </button>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded text-sm text-gray-700">
        <p className="font-semibold mb-2">📧 About Email Notifications</p>
        <p>
          We respect your preferences and will only send you emails for the notifications you've enabled. 
          You can change these settings anytime from this page.
        </p>
      </div>
    </div>
  );
}
