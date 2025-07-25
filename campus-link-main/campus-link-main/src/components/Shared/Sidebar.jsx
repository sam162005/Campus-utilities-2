import React from 'react';
import { Mail, Briefcase, Calendar, MessageSquare, Search, LogOut } from 'lucide-react';

const Sidebar = ({ activePage, setActivePage, user, onLogout }) => {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Briefcase },
        { id: 'announcements', label: 'Announcements', icon: Mail },
        { id: 'lost-and-found', label: 'Lost & Found', icon: Search },
        { id: 'timetable', label: 'Timetable', icon: Calendar },
        { id: 'complaints', label: 'Hostel Complaints', icon: MessageSquare },
    ];

    return (
        <div className="bg-gray-800 text-white w-full lg:w-64 p-4 lg:p-6 flex flex-col h-full lg:min-h-screen">
            <div className="flex items-center mb-8">
                <h1 className="text-2xl font-bold text-cyan-400">CampusLink</h1>
            </div>
            <div className="flex-1">
                <p className="text-gray-400 text-sm mb-2">Welcome, {user.name}</p>
                <p className="text-cyan-400 text-xs font-bold uppercase mb-4">{user.role}</p>
                <nav>
                    <ul>
                        {navItems.map(item => (
                            <li key={item.id} className="mb-2">
                                <a href="#" onClick={(e) => { e.preventDefault(); setActivePage(item.id); }}
                                   className={`flex items-center p-3 rounded-lg transition-colors ${activePage === item.id ? 'bg-cyan-500 text-white' : 'hover:bg-gray-700'}`}>
                                    <item.icon className="w-5 h-5 mr-3" />
                                    <span>{item.label}</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
            <div>
                <button onClick={onLogout} className="w-full flex items-center p-3 rounded-lg text-red-400 hover:bg-red-500 hover:text-white transition-colors">
                    <LogOut className="w-5 h-5 mr-3" />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
