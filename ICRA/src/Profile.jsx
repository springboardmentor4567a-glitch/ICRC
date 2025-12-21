import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Calendar, Shield, Settings, Bell, Lock, LogOut } from 'lucide-react';

const Profile = ({ user, onBack, onLogout }) => {
    const [policyCount, setPolicyCount] = useState(0);

    // Fetch purchased policies count
    useEffect(() => {
        const fetchPolicyCount = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) return;

                const res = await fetch('http://127.0.0.1:8000/my-policies', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    setPolicyCount(data.length);
                }
            } catch (err) {
                console.error("Failed to fetch policy count", err);
            }
        };

        fetchPolicyCount();
    }, []);

    // Format Date of Birth safely
    const formatDate = (dateString) => {
        if (!dateString) return "Not Provided";
        return new Date(dateString).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
    };

    // Get initials for Avatar
    const getInitials = (name) => {
        return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : "U";
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-12">

            {/* HEADER */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div
                            onClick={onBack}
                            className="p-2 -ml-2 rounded-full hover:bg-slate-100 cursor-pointer transition-colors text-slate-600"
                            title="Back to Dashboard"
                        >
                            <ArrowLeft size={24} />
                        </div>
                        <span className="text-xl font-bold text-slate-800 tracking-tight">My Profile</span>
                    </div>
                    <button onClick={onLogout} className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2">
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </div>

            {/* CONTENT */}
            <div className="max-w-4xl mx-auto p-6 space-y-6">

                {/* 1. PROFILE CARD */}
                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-8">
                    {/* Avatar */}
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                        {getInitials(user?.name)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left space-y-1">
                        <h1 className="text-2xl font-bold text-slate-800">{user?.name}</h1>
                        <p className="text-slate-500 font-medium">{user?.email}</p>
                        <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
                            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Member</span>
                            <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Active</span>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex gap-6 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-slate-800">{policyCount}</p>
                            <p className="text-xs text-slate-400 uppercase font-bold">Policies</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-slate-800">0</p>
                            <p className="text-xs text-slate-400 uppercase font-bold">Claims</p>
                        </div>
                    </div>
                </div>

                {/* 2. PERSONAL DETAILS */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                        <User size={18} className="text-slate-400" />
                        <h3 className="font-bold text-slate-700">Personal Details</h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Full Name</label>
                            <div className="flex items-center gap-3 p-3 border border-slate-100 rounded-lg bg-slate-50">
                                <User size={18} className="text-slate-400" />
                                <span className="text-slate-700 font-medium">{user?.name}</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email Address</label>
                            <div className="flex items-center gap-3 p-3 border border-slate-100 rounded-lg bg-slate-50">
                                <Mail size={18} className="text-slate-400" />
                                <span className="text-slate-700 font-medium">{user?.email}</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Date of Birth</label>
                            <div className="flex items-center gap-3 p-3 border border-slate-100 rounded-lg bg-slate-50">
                                <Calendar size={18} className="text-slate-400" />
                                <span className="text-slate-700 font-medium">{formatDate(user?.dob)}</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Risk Profile</label>
                            <div className="flex items-center gap-3 p-3 border border-slate-100 rounded-lg bg-slate-50">
                                <Shield size={18} className="text-slate-400" />
                                <span className="text-slate-700 font-medium">
                                    {user?.risk_profile ? "Completed" : "Incomplete"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. SETTINGS (Visual Only) */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                        <Settings size={18} className="text-slate-400" />
                        <h3 className="font-bold text-slate-700">Account Settings</h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                        <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Bell size={20} /></div>
                                <div><p className="font-bold text-slate-700 text-sm">Email Notifications</p><p className="text-xs text-slate-500">Receive updates about your policies.</p></div>
                            </div>
                            <div className="w-10 h-6 bg-blue-600 rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div></div>
                        </div>
                        <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Lock size={20} /></div>
                                <div><p className="font-bold text-slate-700 text-sm">Two-Factor Authentication</p><p className="text-xs text-slate-500">Add an extra layer of security.</p></div>
                            </div>
                            <div className="w-10 h-6 bg-slate-200 rounded-full relative cursor-pointer"><div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div></div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Profile;