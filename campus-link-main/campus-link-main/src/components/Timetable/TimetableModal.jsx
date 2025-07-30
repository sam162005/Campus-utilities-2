/* --- client/src/components/Timetable/TimetableModal.jsx --- */
import React, { useState, useEffect } from 'react';
import { format, parseISO, getDay } from 'date-fns'; // Import date-fns utilities

const TimetableModal = ({ show, onClose, onSave, initialData }) => { // Renamed classInfo to initialData
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        deadline: format(new Date(), 'yyyy-MM-dd'), // Default to today
        time: '09:00',
        priority: 'Medium',
    });
    const [dayOfWeekText, setDayOfWeekText] = useState(''); // To display "Day: Saturday"

    const daysOfWeekNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Update form data and dayOfWeekText when modal shows or initialData changes
    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                deadline: initialData.deadline ? format(parseISO(initialData.deadline), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
                time: initialData.time || '09:00',
                priority: initialData.priority || 'Medium',
            });
            const dayIndex = getDay(parseISO(initialData.deadline));
            setDayOfWeekText(daysOfWeekNames[dayIndex]);
        } else {
            // Reset to default for new task
            const today = new Date();
            setFormData({
                title: '',
                description: '',
                deadline: format(today, 'yyyy-MM-dd'),
                time: '09:00',
                priority: 'Medium',
            });
            setDayOfWeekText(daysOfWeekNames[getDay(today)]);
        }
    }, [show, initialData]); // Depend on show and initialData

    // Update dayOfWeekText when deadline changes
    useEffect(() => {
        try {
            const date = parseISO(formData.deadline);
            if (!isNaN(date.getTime())) { // Check if date is valid
                setDayOfWeekText(daysOfWeekNames[getDay(date)]);
            } else {
                setDayOfWeekText(''); // Clear if date is invalid
            }
        } catch (e) {
            setDayOfWeekText(''); // Handle parsing errors
        }
    }, [formData.deadline]);


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!show) return null; // Added 'show' prop to control visibility

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md"> {/* Updated styling for task modal */}
                <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    {initialData ? 'Edit Task' : 'Add New Task'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 sr-only">Task</label> {/* Hidden label for accessibility */}
                        <input
                            type="text"
                            name="title"
                            id="title"
                            placeholder="Task e.g., Prepare for Physics Exam"
                            value={formData.title}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    {/* Description field - optional, but good to have */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 sr-only">Description</label>
                        <textarea
                            name="description"
                            id="description"
                            placeholder="Description (Optional)"
                            value={formData.description}
                            onChange={handleChange}
                            rows="2"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">Deadline</label>
                            <input
                                type="date"
                                name="deadline"
                                id="deadline"
                                value={formData.deadline}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="day" className="block text-sm font-medium text-gray-700">Day</label>
                            <input
                                type="text"
                                name="day"
                                id="day"
                                value={dayOfWeekText}
                                readOnly // Make it read-only as it's derived
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 cursor-not-allowed"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="time" className="block text-sm font-medium text-gray-700">Time</label>
                            <input
                                type="time"
                                name="time"
                                id="time"
                                value={formData.time}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
                            <select
                                name="priority"
                                id="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            {initialData ? 'Save Changes' : 'Save Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TimetableModal;
