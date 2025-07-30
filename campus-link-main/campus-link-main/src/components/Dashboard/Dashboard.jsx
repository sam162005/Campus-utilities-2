import React from 'react';
import { Mail, Search, Calendar, MessageSquare, BarChart2 } from 'lucide-react'; // Import BarChart2 for polls

const Dashboard = ({ setActivePage }) => {
    const cards = [
        { title: 'Announcements', icon: Mail, page: 'announcements', description: 'Latest campus news and updates.', color: 'bg-blue-500' },
        { title: 'Lost & Found', icon: Search, page: 'lost-and-found', description: 'Report or find lost items.', color: 'bg-green-500' },
        { title: 'My Timetable', icon: Calendar, page: 'timetable', description: 'View your weekly class schedule.', color: 'bg-purple-500' },
        { title: 'Hostel Complaints', icon: MessageSquare, page: 'complaints', description: 'Register and track hostel issues.', color: 'bg-red-500' },
        { title: 'Polls & Feedback', icon: BarChart2, page: 'polls', description: 'Participate in campus polls and give feedback.', color: 'bg-yellow-500' }, // New Polls card
    ];

    return (
        <div className="p-6 md:p-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                {cards.map(card => (
                    <div key={card.title} onClick={() => setActivePage(card.page)}
                         className={`p-6 rounded-2xl shadow-lg cursor-pointer transform hover:-translate-y-2 transition-transform duration-300 text-white ${card.color}`}>
                        <card.icon className="w-12 h-12 mb-4 opacity-80" />
                        <h3 className="text-2xl font-bold mb-2">{card.title}</h3>
                        <p className="opacity-90">{card.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
