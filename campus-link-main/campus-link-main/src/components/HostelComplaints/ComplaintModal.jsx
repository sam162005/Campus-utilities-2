import React, { useState } from 'react';

const ComplaintModal = ({ onClose, onAdd }) => {
    const [formData, setFormData] = useState({ category: 'Electricity', description: '' });
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg">
                <h3 className="text-2xl font-bold mb-6">Register Complaint</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <select name="category" value={formData.category} onChange={handleChange} className="w-full p-3 border rounded-lg">
                        <option>Electricity</option><option>Water</option><option>Cleaning</option><option>Internet</option><option>Other</option>
                    </select>
                    <textarea name="description" onChange={handleChange} placeholder="Please describe the issue..." className="w-full p-3 border rounded-lg h-32" required />
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600">Submit</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default ComplaintModal;
