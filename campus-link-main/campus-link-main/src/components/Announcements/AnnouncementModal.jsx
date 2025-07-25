import React, { useState } from 'react';

const AnnouncementModal = ({ onClose, onAdd }) => {
    const [formData, setFormData] = useState({ title: '', content: '', category: 'Events' });
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg">
                <h3 className="text-2xl font-bold mb-6">New Announcement</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="title" onChange={handleChange} placeholder="Title" className="w-full p-3 border rounded-lg" required />
                    <textarea name="content" onChange={handleChange} placeholder="Content" className="w-full p-3 border rounded-lg h-32" required />
                    <select name="category" onChange={handleChange} className="w-full p-3 border rounded-lg">
                        <option>Events</option><option>Exams</option><option>Holidays</option><option>Admin</option>
                    </select>
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600">Post</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AnnouncementModal;