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
// New: Import Polls pages
import AdminPollsPage from './components/Polls/AdminPollsPage';
import UserPollsPage from './components/Polls/UserPollsPage';


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
                return <Dashboard setActivePage={setActivePage} user={user} />;
            case 'announcements':
                return user.role === 'admin' ? (
                    <AdminAnnouncementsPage user={user} />
                ) : (
                    <AnnouncementsPage user={user} />
                );
            case 'polls':
                return user.role === 'admin' ? (
                    <AdminPollsPage user={user} />
                ) : (
                    <UserPollsPage user={user} />
                );
            case 'lost-and-found':
                return <LostAndFoundPage user={user} />;
            case 'timetable':
                return <TimetablePage user={user} />;
            case 'complaints':
                return <HostelComplaintsPage user={user} />;
            default:
                return <Dashboard setActivePage={setActivePage} user={user} />;
        }
    };

    return (
        <div className="bg-gray-100 font-sans">
            {/* Sidebar is fixed, main content has left padding */}
            <div className="min-h-screen">
                {user && (
                    <div>
                        <div className="hidden lg:block">
                            <div className="fixed left-0 top-0 h-full w-56 z-30">
                                <Sidebar
                                    activePage={activePage}
                                    setActivePage={setActivePage}
                                    user={user}
                                    onLogout={handleLogout}
                                />
                            </div>
                        </div>
                        <div className="block lg:hidden">
                            <Sidebar
                                activePage={activePage}
                                setActivePage={setActivePage}
                                user={user}
                                onLogout={handleLogout}
                            />
                        </div>
                    </div>
                )}
                {/* Main content area: add left padding on large screens to avoid overlap with fixed sidebar */}
                <main className={`flex-1 overflow-y-auto ${user ? 'lg:pl-56' : ''}`}>
                    {renderPage()}
                </main>
            </div>
        </div>
    );
}
