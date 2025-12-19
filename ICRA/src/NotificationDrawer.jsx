import React from 'react';
import { X, CheckCircle, AlertTriangle, Info, Bell, Clock, Trash2 } from 'lucide-react';

const NotificationDrawer = ({ isOpen, onClose, notifications, markRead, onDelete }) => {

    const timeAgo = (dateString) => {
        const date = new Date(dateString);
        const seconds = Math.floor((new Date() - date) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " mins ago";
        return "Just now";
    };

    return (
        <>
            <div
                className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            <div className={`fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                {/* Header */}
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-2">
                        <Bell className="text-slate-800" size={20} />
                        <h2 className="font-bold text-slate-800">Notifications</h2>
                        {notifications.filter(n => !n.is_read).length > 0 && (
                            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {notifications.filter(n => !n.is_read).length} New
                            </span>
                        )}
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                {/* List */}
                <div className="overflow-y-auto h-[calc(100vh-140px)] p-4 space-y-3">
                    {notifications.length === 0 ? (
                        <div className="text-center py-20 text-slate-400 flex flex-col items-center">
                            <div className="bg-slate-50 p-4 rounded-full mb-3"><Bell size={32} className="text-slate-300" /></div>
                            <p className="text-sm font-medium text-slate-500">No notifications yet.</p>
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <div key={notif.id} className={`group p-4 rounded-xl border relative transition-all hover:bg-slate-50 ${notif.is_read ? 'bg-white border-slate-100' : 'bg-blue-50/40 border-blue-100'}`}>

                                {/* Delete Button (Visible on Hover) */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete(notif.id); }}
                                    className="absolute top-3 right-3 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                    title="Delete Notification"
                                >
                                    <Trash2 size={14} />
                                </button>

                                {/* Unread Dot */}
                                {!notif.is_read && <span className="absolute top-4 right-10 w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>}

                                <div className="flex gap-3 items-start pr-6">
                                    <div className={`mt-1 p-2 rounded-full flex-shrink-0 ${notif.type === 'success' ? 'bg-green-100 text-green-600' :
                                            notif.type === 'warning' ? 'bg-orange-100 text-orange-600' :
                                                'bg-blue-100 text-blue-600'
                                        }`}>
                                        {notif.type === 'success' ? <CheckCircle size={16} /> :
                                            notif.type === 'warning' ? <AlertTriangle size={16} /> :
                                                <Info size={16} />}
                                    </div>
                                    <div>
                                        <h4 className={`text-sm font-bold ${notif.is_read ? 'text-slate-700' : 'text-slate-900'}`}>{notif.title}</h4>
                                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{notif.message}</p>
                                        <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400 font-medium">
                                            <Clock size={10} /> {timeAgo(notif.created_at)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100 bg-white">
                    <button
                        onClick={markRead}
                        disabled={notifications.length === 0 || notifications.every(n => n.is_read)}
                        className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <CheckCircle size={16} /> Mark all as read
                    </button>
                </div>
            </div>
        </>
    );
};

export default NotificationDrawer;