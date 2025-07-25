import React, { useState, useEffect } from 'react';

// Import Pages and Components
import AuthPage from './components/Auth/AuthPage';
import Dashboard from './components/Dashboard/Dashboard';
import Sidebar from './components/Shared/Sidebar';
import AnnouncementsPage from './components/Announcements/AnnouncementsPage';
import LostAndFoundPage from './components/LostAndFound/LostAndFoundPage';
import TimetablePage from './components/Timetable/TimetablePage';
import HostelComplaintsPage from './components/HostelComplaints/HostelComplaintsPage';
// Import the AdminAnnouncementsPage from its new location
import AdminAnnouncementsPage from './components/AdminAnnouncements/AdminAnnouncementsPage';


export default function App() {
    const [user, setUser] = useState(null);
    const [activePage, setActivePage] = useState('dashboard');
    const [loading, setLoading] = useState(true);

    // Check for a logged-in user on initial load
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (token && userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (e) {
                console.error("Failed to parse stored user data:", e);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null); // Clear user if data is corrupted
            }
        }
        setLoading(false);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setActivePage('dashboard'); // Reset to dashboard after logout
    };

    const renderPage = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
                    <p>Loading application...</p>
                </div>
            );
        }
        if (!user) {
            return <AuthPage setUser={setUser} />;
        }

        // Render different pages based on activePage and user role
        switch (activePage) {
            case 'dashboard':
                return <Dashboard setActivePage={setActivePage} user={user} />; // Pass user to Dashboard if needed
            case 'announcements':
                // Conditional rendering for Admin vs. Student announcements view
                return user.role === 'admin' ? (
                    <AdminAnnouncementsPage user={user} /> // Admin view for managing announcements
                ) : (
                    <AnnouncementsPage user={user} /> // Student/general user view for reading announcements
                );
            case 'lost-and-found':
                return <LostAndFoundPage user={user} />;
            case 'timetable':
                return <TimetablePage user={user} />;
            case 'complaints':
                return <HostelComplaintsPage user={user} />;
            default:
                // Fallback to dashboard if activePage is unknown
                return <Dashboard setActivePage={setActivePage} user={user} />;
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen font-sans">
            <div className="flex flex-col lg:flex-row">
                {/* Sidebar is only shown if a user is logged in */}
                {user && (
                    <Sidebar
                        activePage={activePage}
                        setActivePage={setActivePage}
                        user={user}
                        onLogout={handleLogout}
                    />
                )}
                <main className="flex-1 transition-all duration-300">
                    {renderPage()}
                </main>
            </div>
        </div>
    );
}
