
'use client';

import { useState, useEffect } from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function CookieSettingsModal({ onClose, onSave }) {
  const [settings, setSettings] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (consent) {
      setSettings(JSON.parse(consent));
    }
  }, []);

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setSettings((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSave = () => {
    onSave(settings);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gray-800/80 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-2xl shadow-purple-500/10 max-w-md w-full mx-4 p-8 text-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold">Cookie Settings</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <p className="text-gray-300 mb-6">Manage your cookie preferences. You can enable or disable different types of cookies below.</p>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
            <div>
              <h4 className="font-semibold">Necessary Cookies</h4>
              <p className="text-sm text-gray-400">These cookies are essential for the website to function and cannot be disabled.</p>
            </div>
            <input
              type="checkbox"
              name="necessary"
              checked={settings.necessary}
              disabled
              className="form-checkbox h-5 w-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 cursor-not-allowed"
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
            <div>
              <h4 className="font-semibold">Analytics Cookies</h4>
              <p className="text-sm text-gray-400">These cookies help us understand how you use our website.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="analytics"
                checked={settings.analytics}
                onChange={handleCheckboxChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-purple-500/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
            <div>
              <h4 className="font-semibold">Marketing Cookies</h4>
              <p className="text-sm text-gray-400">These cookies are used to deliver personalised ads.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="marketing"
                checked={settings.marketing}
                onChange={handleCheckboxChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-purple-500/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 text-white bg-gray-600/50 hover:bg-gray-600/80 rounded-full transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="group flex items-center justify-center gap-2 px-6 py-2 bg-purple-600/80 hover:bg-purple-600 border border-purple-500/50 text-white rounded-full transition-all duration-300 transform hover:scale-105"
          >
            <CheckIcon className="w-5 h-5" />
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}
