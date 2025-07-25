import React, { useState, useEffect } from 'react';
import api from '../../services/api'; // Corrected import path for api service

const AdminAnnouncementsPage = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [newAnnouncement, setNewAnnouncement] = useState({ title: '', content: '' });
    const [editingAnnouncement, setEditingAnnouncement] = useState(null); // Stores announcement being edited
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    // Fetch announcements on component mount
    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        setLoading(true);
        setError('');
        try {
            // No auth token needed for fetching all announcements (public route)
            const res = await api.get('/announcements');
            setAnnouncements(res.data);
        } catch (err) {
            setError('Failed to fetch announcements.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleNewAnnouncementChange = (e) => {
        setNewAnnouncement({ ...newAnnouncement, [e.target.name]: e.target.value });
    };

    const handleCreateAnnouncement = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // Send token for admin-only route
            await api.post('/announcements', newAnnouncement);
            setNewAnnouncement({ title: '', content: '' }); // Clear form
            fetchAnnouncements(); // Refresh list
            alert('Announcement created successfully!');
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to create announcement.');
            console.error(err);
        }
    };

    const handleEditClick = (announcement) => {
        setEditingAnnouncement({ ...announcement }); // Copy announcement for editing
    };

    const handleEditChange = (e) => {
        setEditingAnnouncement({ ...editingAnnouncement, [e.target.name]: e.target.value });
    };

    const handleUpdateAnnouncement = async (e) => {
        e.preventDefault();
        setError('');
        if (!editingAnnouncement || !editingAnnouncement._id) {
            setError('No announcement selected for editing.');
            return;
        }
        try {
            await api.put(`/announcements/${editingAnnouncement._id}`, {
                title: editingAnnouncement.title,
                content: editingAnnouncement.content
            });
            setEditingAnnouncement(null); // Exit edit mode
            fetchAnnouncements(); // Refresh list
            alert('Announcement updated successfully!');
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to update announcement.');
            console.error(err);
        }
    };

    const handleDeleteAnnouncement = async (id) => {
        if (window.confirm('Are you sure you want to delete this announcement?')) {
            setError('');
            try {
                await api.delete(`/announcements/${id}`);
                fetchAnnouncements(); // Refresh list
                alert('Announcement deleted successfully!');
            } catch (err) {
                setError(err.response?.data?.msg || 'Failed to delete announcement.');
                console.error(err);
            }
        }
    };

    if (loading) return <div className="text-center text-white mt-8">Loading announcements...</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <h1 className="text-4xl font-bold text-cyan-400 mb-8 text-center">Manage Announcements</h1>

            {error && <div className="bg-red-600 text-white p-3 rounded-lg mb-4 text-center">{error}</div>}

            {/* Add New Announcement Form */}
            <div className="bg-gray-800 p-6 rounded-2xl shadow-lg mb-8 max-w-2xl mx-auto">
                <h2 className="text-2xl font-semibold text-cyan-400 mb-4">{editingAnnouncement ? 'Edit Announcement' : 'Add New Announcement'}</h2>
                <form onSubmit={editingAnnouncement ? handleUpdateAnnouncement : handleCreateAnnouncement} className="space-y-4">
                    <input
                        type="text"
                        name="title"
                        placeholder="Announcement Title"
                        value={editingAnnouncement ? editingAnnouncement.title : newAnnouncement.title}
                        onChange={editingAnnouncement ? handleEditChange : handleNewAnnouncementChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        required
                    />
                    <textarea
                        name="content"
                        placeholder="Announcement Content"
                        value={editingAnnouncement ? editingAnnouncement.content : newAnnouncement.content}
                        onChange={editingAnnouncement ? handleEditChange : handleNewAnnouncementChange}
                        rows="5"
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        required
                    ></textarea>
                    <div className="flex justify-end space-x-4">
                        {editingAnnouncement && (
                            <button
                                type="button"
                                onClick={() => setEditingAnnouncement(null)}
                                className="px-6 py-3 font-semibold text-gray-900 bg-gray-400 rounded-lg hover:bg-gray-500 transition-colors"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="submit"
                            className="px-6 py-3 font-semibold text-gray-900 bg-cyan-400 rounded-lg hover:bg-cyan-500 transition-colors"
                        >
                            {editingAnnouncement ? 'Update Announcement' : 'Create Announcement'}
                        </button>
                    </div>
                </form>
            </div>

            {/* List of Announcements */}
            <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-semibold text-cyan-400 mb-4 text-center">Current Announcements</h2>
                {announcements.length === 0 ? (
                    <p className="text-center text-gray-400">No announcements yet.</p>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {announcements.map((announcement) => (
                            <div key={announcement._id} className="bg-gray-800 p-6 rounded-2xl shadow-lg flex flex-col">
                                <h3 className="text-xl font-semibold text-cyan-300 mb-2">{announcement.title}</h3>
                                <p className="text-gray-300 text-sm flex-grow mb-3">{announcement.content}</p>
                                <p className="text-gray-500 text-xs mt-auto">
                                    {new Date(announcement.date).toLocaleDateString()}
                                </p>
                                <div className="mt-4 flex space-x-2">
                                    <button
                                        onClick={() => handleEditClick(announcement)}
                                        className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteAnnouncement(announcement._id)}
                                        className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAnnouncementsPage;
