import React, { useState } from 'react';

const LostFoundModal = ({ onClose, onReport }) => {
    const [formData, setFormData] = useState({ type: 'lost', item: '', category: 'Electronics', location: '', description: '' });
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        onReport(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg">
                <h3 className="text-2xl font-bold mb-6">Report an Item</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <select name="type" onChange={handleChange} value={formData.type} className="w-full p-3 border rounded-lg">
                        <option value="lost">I Lost an Item</option>
                        <option value="found">I Found an Item</option>
                    </select>
                    <input name="item" onChange={handleChange} placeholder="Item Name" className="w-full p-3 border rounded-lg" required />
                    <input name="location" onChange={handleChange} placeholder="Location" className="w-full p-3 border rounded-lg" required />
                    <select name="category" onChange={handleChange} value={formData.category} className="w-full p-3 border rounded-lg">
                        <option>Electronics</option><option>Bottles</option><option>Stationery</option><option>Documents</option><option>Other</option>
                    </select>
                    <textarea name="description" onChange={handleChange} placeholder="Description" className="w-full p-3 border rounded-lg h-24" required />
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600">Report</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default LostFoundModal;
