/* --- client/src/components/Timetable/TimetablePage.jsx --- */
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import TimetableModal from './TimetableModal';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const TimetablePage = ({ user }) => {
    const [schedule, setSchedule] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingClass, setEditingClass] = useState(null);

    const fetchSchedule = useCallback(async () => {
        try {
            const res = await api.get('/timetable');
            setSchedule(res.data);
        } catch (error) {
            console.error("Failed to fetch schedule", error);
        }
    }, []);

    useEffect(() => {
        fetchSchedule();
    }, [fetchSchedule]);

    const handleSaveClass = async (classInfo) => {
        try {
            if (editingClass) {
                await api.put(`/timetable/${editingClass._id}`, classInfo);
            } else {
                await api.post('/timetable', classInfo);
            }
            fetchSchedule();
        } catch (error) {
            console.error("Failed to save class", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/timetable/${id}`);
            fetchSchedule();
        } catch (error) {
            console.error("Failed to delete class", error);
        }
    };
    
    return (
        <div className="p-6 md:p-10">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">My Timetable</h2>
                <button onClick={() => { setEditingClass(null); setShowModal(true); }} className="flex items-center bg-cyan-500 text-white px-4 py-2 rounded-lg shadow hover:bg-cyan-600 transition-colors">
                    <Plus className="w-5 h-5 mr-2" /> Add Class
                </button>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-lg">
                {schedule.length > 0 ? schedule.map(entry => (
                     <div key={entry._id} className="border-b last:border-b-0 p-4 flex justify-between items-center">
                        <div>
                           <p className="font-bold">{entry.subject} ({entry.code})</p>
                           <p className="text-sm text-gray-600">{entry.day} at {entry.time}</p>
                           <p className="text-sm text-gray-500">{entry.location}</p>
                        </div>
                        <div className="flex space-x-2">
                            <button onClick={() => {setEditingClass(entry); setShowModal(true)}}><Edit2 className="w-5 h-5 text-blue-600 hover:text-blue-800" /></button>
                            <button onClick={() => handleDelete(entry._id)}><Trash2 className="w-5 h-5 text-red-500 hover:text-red-700" /></button>
                        </div>
                    </div>
                )) : <p className="p-4 text-center text-gray-500">Your schedule is empty. Add a class to get started.</p>}
            </div>
            {showModal && <TimetableModal onClose={() => { setShowModal(false); setEditingClass(null); }} onSave={handleSaveClass} classInfo={editingClass} />}
        </div>
    );
};
export default TimetablePage;