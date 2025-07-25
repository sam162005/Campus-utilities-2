import React, { useState, useEffect } from 'react';
import api from '../../services/api'; // Assuming your API service is here

const AnnouncementsPage = ({ user }) => { // Ensure user prop is passed
    const [announcements, setAnnouncements] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    // Define the emojis available for reaction
    const availableEmojis = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

    useEffect(() => {
        fetchAnnouncements();
    }, []); // Empty dependency array means this runs once on mount

    const fetchAnnouncements = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/announcements');
            setAnnouncements(res.data);
        } catch (err) {
            setError('Failed to fetch announcements.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleReaction = async (announcementId, emoji) => {
        setError('');
        if (!user) {
            setError('You must be logged in to react.');
            return;
        }

        try {
            // Send the reaction to the backend
            const res = await api.post(`/announcements/${announcementId}/react`, { emoji });

            // Update the local state with the new reactions data from the backend
            // The backend should return the updated reactions array for the specific announcement
            setAnnouncements(prevAnnouncements =>
                prevAnnouncements.map(ann =>
                    ann._id === announcementId ? { ...ann, reactions: res.data } : ann
                )
            );
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to add reaction.');
            console.error(err);
        }
    };

    if (loading) return <div className="text-center text-white mt-8">Loading announcements...</div>;

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 p-8"> {/* Changed background to gray-100 for contrast */}
            <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Campus Announcements</h1> {/* Adjusted text color */}

            {error && <div className="bg-red-600 text-white p-3 rounded-lg mb-4 text-center">{error}</div>}

            <div className="max-w-4xl mx-auto">
                {announcements.length === 0 ? (
                    <p className="text-center text-gray-600">No announcements yet.</p>
                ) : (
                    <div className="grid gap-6 md:grid-cols-1"> {/* Changed to single column for WhatsApp-like display */}
                        {announcements.map((announcement) => (
                            <div key={announcement._id}
                                 className="bg-white p-6 rounded-lg shadow-md flex flex-col border border-gray-200"> {/* White box styling */}
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-semibold text-gray-800">{announcement.title}</h3>
                                    <p className="text-gray-500 text-sm ml-4 flex-shrink-0">
                                        {new Date(announcement.date).toLocaleDateString()}
                                    </p>
                                </div>
                                <p className="text-gray-700 text-base flex-grow mb-2">{announcement.content}</p> {/* Reduced bottom margin */}

                                {/* Reaction Section - Now more integrated with the content flow */}
                                <div className="flex flex-wrap gap-1.5 justify-end mt-2"> {/* Removed pt-3, border-t, mt-auto */}
                                    {/* Display existing reactions first */}
                                    {announcement.reactions && announcement.reactions.length > 0 && (
                                        announcement.reactions.map((reaction) => {
                                            const hasUserReacted = user && reaction.users.includes(user.id);
                                            return (
                                                <button
                                                    key={reaction.emoji}
                                                    onClick={() => handleReaction(announcement._id, reaction.emoji)}
                                                    className={`
                                                        flex items-center space-x-1 px-2 py-0.5 rounded-full text-sm cursor-pointer transition-all duration-200
                                                        ${hasUserReacted ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                                                        shadow-sm
                                                    `}
                                                    title={hasUserReacted ? `You reacted with ${reaction.emoji}` : `React with ${reaction.emoji}`}
                                                >
                                                    <span>{reaction.emoji}</span>
                                                    <span className="text-xs">{reaction.count}</span>
                                                </button>
                                            );
                                        })
                                    )}

                                    {/* Button to add new reactions (or toggle existing ones) */}
                                    {user && ( // Only show reaction options if user is logged in
                                        <div className="relative group">
                                            <button
                                                className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-sm cursor-pointer transition-all duration-800 bg-gray-300 text-gray-800 hover:bg-gray-400 shadow-sm"
                                                title="Add Reaction"
                                            >
                                                +
                                            </button>
                                            {/* Emoji picker - hidden by default, shown on hover/focus for simplicity */}
                                            {/* For a true WhatsApp experience, this would be a click-triggered popover */}
                                            <div className="absolute bottom-full right-0 mb-2 p-1 bg-white rounded-lg shadow-lg hidden group-hover:flex flex-wrap gap-1 border border-gray-200 z-10">
                                                {availableEmojis.map((emoji) => (
                                                    <button
                                                        key={`picker-${emoji}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Prevent card click if any
                                                            handleReaction(announcement._id, emoji);
                                                        }}
                                                        className="p-1 text-lg rounded-full hover:bg-gray-100 transition-colors"
                                                        title={`React with ${emoji}`}
                                                    >
                                                        {emoji}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnnouncementsPage;   