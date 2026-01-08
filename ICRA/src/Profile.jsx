import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Calendar, Shield, Settings, Bell, Lock, LogOut, Edit2, Save, X, Loader } from 'lucide-react';

const Profile = ({ onBack, onLogout }) => {
    // Data States
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState({ policies: 0, claims: 0 });
    const [loading, setLoading] = useState(true);
    
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', dob: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) return;
            
            const headers = { 'Authorization': `Bearer ${token}` };

            const [userRes, policiesRes, claimsRes] = await Promise.all([
                fetch('http://127.0.0.1:8000/user/me', { headers }),
                fetch('http://127.0.0.1:8000/my-policies', { headers }),
                fetch('http://127.0.0.1:8000/claims', { headers })
            ]);

            if (userRes.ok) {
                const userData = await userRes.json();
                setProfile(userData);
                setEditForm({ 
                    name: userData.name, 
                    dob: userData.dob ? userData.dob.split('T')[0] : '' 
                });
            }

            const policies = policiesRes.ok ? await policiesRes.json() : [];
            const claims = claimsRes.ok ? await claimsRes.json() : [];

            setStats({
                policies: policies.length,
                claims: claims.length
            });

        } catch (err) {
            console.error("Failed to load profile data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch('http://127.0.0.1:8000/user/details', {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editForm)
            });

            if (res.ok) {
                const updatedUser = await res.json();
                setProfile(updatedUser);
                
                const stored = JSON.parse(localStorage.getItem('user_data') || '{}');
                localStorage.setItem('user_data', JSON.stringify({ ...stored, ...updatedUser }));
                
                setIsEditing(false);
            }
        } catch (err) {
            alert("Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Not Provided";
        return new Date(dateString).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const getInitials = (name) => {
        return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : "U";
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading Profile...</div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-12">

            <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 cursor-pointer transition-colors text-slate-600">
                            <ArrowLeft size={24} />
                        </div>
                        <span className="text-xl font-bold text-slate-800 tracking-tight">My Profile</span>
                    </div>
                    <button onClick={onLogout} className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2">
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-6 space-y-6">

                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50 pointer-events-none"></div>

                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-white z-10">
                        {getInitials(profile?.name)}
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-1 z-10">
                        <h1 className="text-2xl font-bold text-slate-800">{profile?.name}</h1>
                        <p className="text-slate-500 font-medium">{profile?.email}</p>
                        <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${profile?.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                                {profile?.role || "Member"}
                            </span>
                            <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Active                            </span>
                        </div>
                    </div>

                    <div className="flex gap-8 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8 z-10">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-slate-800">{stats.policies}</p>
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Policies</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-slate-800">{stats.claims}</p>
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Claims</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <User size={18} className="text-slate-400" />
                            <h3 className="font-bold text-slate-700">Personal Details</h3>
                        </div>
                        {!isEditing ? (
                            <button onClick={() => setIsEditing(true)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                                <Edit2 size={16} /> Edit
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button onClick={() => setIsEditing(false)} className="text-slate-500 hover:bg-slate-200 p-2 rounded-lg transition-colors"><X size={18}/></button>
                                <button onClick={handleSave} disabled={saving} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors">
                                    {saving ? <Loader className="animate-spin" size={16}/> : <Save size={16}/>} Save
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Full Name</label>
                            {isEditing ? (
                                <input 
                                    type="text" 
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                    className="w-full p-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-800 bg-blue-50/50"
                                />
                            ) : (
                                <div className="flex items-center gap-3 p-3 border border-slate-100 rounded-lg bg-slate-50">
                                    <User size={18} className="text-slate-400" />
                                    <span className="text-slate-700 font-medium">{profile?.name}</span>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email Address <span className="text-[10px] font-normal lowercase">(read-only)</span></label>
                            <div className="flex items-center gap-3 p-3 border border-slate-100 rounded-lg bg-slate-50 opacity-70">
                                <Mail size={18} className="text-slate-400" />
                                <span className="text-slate-700 font-medium">{profile?.email}</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Date of Birth</label>
                            {isEditing ? (
                                <input 
                                    type="date" 
                                    value={editForm.dob}
                                    onChange={(e) => setEditForm({...editForm, dob: e.target.value})}
                                    className="w-full p-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-800 bg-blue-50/50"
                                />
                            ) : (
                                <div className="flex items-center gap-3 p-3 border border-slate-100 rounded-lg bg-slate-50">
                                    <Calendar size={18} className="text-slate-400" />
                                    <span className="text-slate-700 font-medium">{formatDate(profile?.dob)}</span>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Risk Profile</label>
                            <div className="flex items-center gap-3 p-3 border border-slate-100 rounded-lg bg-slate-50">
                                <Shield size={18} className={profile?.risk_profile && Object.keys(profile.risk_profile).length > 0 ? "text-green-500" : "text-orange-400"} />
                                <span className="text-slate-700 font-medium flex-1">
                                    {profile?.risk_profile && Object.keys(profile.risk_profile).length > 0 ? "Completed" : "Incomplete"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                        <Settings size={18} className="text-slate-400" />
                        <h3 className="font-bold text-slate-700">Account Settings</h3>
                    </div>
                    <div className="divide-y divide-slate-100">
                        <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors"><Bell size={20} /></div>
                                <div><p className="font-bold text-slate-700 text-sm">Email Notifications</p><p className="text-xs text-slate-500">Receive updates about your policies.</p></div>
                            </div>
                            <div className="w-10 h-6 bg-blue-600 rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div></div>
                        </div>
                        <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg group-hover:bg-orange-100 transition-colors"><Lock size={20} /></div>
                                <div><p className="font-bold text-slate-700 text-sm">Two-Factor Authentication</p><p className="text-xs text-slate-500">Add an extra layer of security.</p></div>
                            </div>
                            <div className="w-10 h-6 bg-slate-200 rounded-full relative"><div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div></div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Profile;