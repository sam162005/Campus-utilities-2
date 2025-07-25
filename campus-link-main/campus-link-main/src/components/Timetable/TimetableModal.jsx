/* --- client/src/components/Timetable/TimetableModal.jsx --- */
import React, { useState } from 'react';

const TimetableModal = ({ onClose, onSave, classInfo }) => {
    const [formData, setFormData] = useState({
        subject: classInfo?.subject || '',
        code: classInfo?.code || '',
        day: classInfo?.day || 'Monday',
        time: classInfo?.time || '09:00 - 10:30',
        location: classInfo?.location || ''
    });
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg">
                <h3 className="text-2xl font-bold mb-6">{classInfo ? 'Edit Class' : 'Add Class'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="subject" value={formData.subject} onChange={handleChange} placeholder="Subject Name" className="w-full p-3 border rounded-lg" required />
                    <input name="code" value={formData.code} onChange={handleChange} placeholder="Course Code" className="w-full p-3 border rounded-lg" />
                    <input name="location" value={formData.location} onChange={handleChange} placeholder="Location" className="w-full p-3 border rounded-lg" />
                    <select name="day" value={formData.day} onChange={handleChange} className="w-full p-3 border rounded-lg">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <input name="time" value={formData.time} onChange={handleChange} placeholder="Time (e.g., 09:00 - 10:30)" className="w-full p-3 border rounded-lg" required />
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default TimetableModal;
