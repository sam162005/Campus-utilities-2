/* --- client/src/components/Timetable/TimetablePage.jsx --- */
import React, { useState, useEffect } from 'react';
import api from '../../services/api'; // Your API service
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'; // For month navigation
import TimetableModal from './TimetableModal'; // Corrected import: using TimetableModal as the name

const TimetablePage = ({ user }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [tasks, setTasks] = useState([]); // All tasks for the user
    const [filteredTasks, setFilteredTasks] = useState({}); // Tasks grouped by day for current month
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date()); // For daily task view
    const [showDailyTasksModal, setShowDailyTasksModal] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState(null); // For editing existing tasks
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTasks();
    }, [currentMonth]); // Re-fetch tasks when month changes

    useEffect(() => {
        // Group tasks by day for easy rendering on calendar
        const grouped = {};
        tasks.forEach(task => {
            const deadlineDate = format(parseISO(task.deadline), 'yyyy-MM-dd');
            if (!grouped[deadlineDate]) {
                grouped[deadlineDate] = [];
            }
            grouped[deadlineDate].push(task);
        });
        setFilteredTasks(grouped);
    }, [tasks]);


    const fetchTasks = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/tasks');
            setTasks(res.data);
        } catch (err) {
            setError('Failed to fetch tasks.');
            console.error('Error fetching tasks:', err); // More specific logging
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = () => {
        setTaskToEdit(null); // Ensure no task is being edited when adding new
        setShowAddTaskModal(true);
    };

    const handleEditTask = (task) => {
        console.log("Editing task:", task); // Log the task being passed
        setTaskToEdit(task);
        setShowDailyTasksModal(false); // Close daily modal
        setShowAddTaskModal(true);     // Open edit modal
    };

    const handleDeleteTask = async (taskId) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            setError('');
            try {
                await api.delete(`/tasks/${taskId}`);
                fetchTasks(); // Refresh tasks
                alert('Task deleted successfully!');
                setShowDailyTasksModal(false); // Close modal if open
            } catch (err) {
                setError(err.response?.data?.msg || 'Failed to delete task.');
                console.error('Error deleting task:', err); // More specific logging
            }
        }
    };

    const handleSaveTask = async (formData) => {
        setError('');
        try {
            if (taskToEdit) {
                // Update existing task
                console.log("Updating task with ID:", taskToEdit._id, "Data:", formData); // Log update attempt
                await api.put(`/tasks/${taskToEdit._id}`, formData);
                alert('Task updated successfully!');
            } else {
                // Create new task
                console.log("Creating new task with Data:", formData); // Log create attempt
                await api.post('/tasks', formData);
                alert('Task added successfully!');
            }
            setShowAddTaskModal(false);
            fetchTasks(); // Refresh tasks
        } catch (err) {
            setError(err.response?.data?.msg || `Failed to ${taskToEdit ? 'update' : 'add'} task.`);
            console.error('Error saving task:', err); // More specific logging
        }
    };

    const getDaysInMonth = () => {
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);
        const days = eachDayOfInterval({ start, end });

        // Add leading empty days for calendar alignment
        const firstDayOfWeek = start.getDay(); // 0 for Sunday, 1 for Monday
        const leadingEmptyDays = Array.from({ length: firstDayOfWeek }, (_, i) => null);

        // Add trailing empty days for calendar alignment
        const totalCells = 42; // 6 rows * 7 days
        const trailingEmptyDaysCount = totalCells - (leadingEmptyDays.length + days.length);
        const trailingEmptyDays = Array.from({ length: trailingEmptyDaysCount }, (_, i) => null);

        return [...leadingEmptyDays, ...days, ...trailingEmptyDays];
    };

    const goToPreviousMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1));
    };

    const goToNextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1));
    };

    const handleDayClick = (date) => {
        if (date) {
            setSelectedDate(date);
            setShowDailyTasksModal(true);
        }
    };

    const DailyTasksModal = ({ show, onClose, date, tasksForDay, onEditTask, onDeleteTask }) => {
        if (!show) return null;

        const formattedDate = format(date, 'PPP'); // e.g., July 26th, 2025

        return (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                        Tasks for {formattedDate}
                    </h2>
                    {tasksForDay && tasksForDay.length > 0 ? (
                        <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                            {tasksForDay.sort((a, b) => (a.time || '').localeCompare(b.time || '')).map(task => (
                                <div key={task._id} className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
                                    {task.description && <p className="text-gray-700 text-sm mb-1">{task.description}</p>}
                                    <p className="text-gray-600 text-xs">
                                        Time: {task.time || 'N/A'} | Priority: {task.priority}
                                    </p>
                                    <div className="flex space-x-2 mt-3">
                                        <button
                                            onClick={() => onEditTask(task)}
                                            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => onDeleteTask(task._id)}
                                            className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-600">No tasks for this day.</p>
                    )}
                    <div className="flex justify-end mt-6">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const daysInMonth = getDaysInMonth();
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 p-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">My Timetable</h1>

            {error && <div className="bg-red-600 text-white p-3 rounded-lg mb-4 text-center">{error}</div>}

            {/* Calendar Header */}
            <div className="flex justify-between items-center bg-white p-4 rounded-t-lg shadow-md max-w-4xl mx-auto">
                <button onClick={goToPreviousMonth} className="p-2 rounded-full hover:bg-gray-200">
                    <ChevronLeftIcon className="h-6 w-6 text-gray-700" />
                </button>
                <h2 className="text-2xl font-semibold text-gray-800">
                    {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <button onClick={goToNextMonth} className="p-2 rounded-full hover:bg-gray-200">
                    <ChevronRightIcon className="h-6 w-6 text-gray-700" />
                </button>
                <button
                    onClick={handleAddTask}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <span>Add New Task</span>
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white p-4 rounded-b-lg shadow-md max-w-4xl mx-auto mb-8">
                <div className="grid grid-cols-7 text-center font-medium text-gray-600 mb-2">
                    {daysOfWeek.map(day => (
                        <div key={day} className="py-2">{day}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {daysInMonth.map((day, index) => {
                        const isCurrentMonthDay = day && isSameMonth(day, currentMonth);
                        const isToday = day && isSameDay(day, new Date());
                        const formattedDay = day ? format(day, 'yyyy-MM-dd') : '';
                        const tasksOnDay = filteredTasks[formattedDay] || [];

                        return (
                            <div
                                key={index}
                                className={`
                                    h-28 p-2 border border-gray-200 rounded-lg flex flex-col items-start cursor-pointer
                                    ${isCurrentMonthDay ? 'bg-gray-50' : 'bg-gray-100 text-gray-400'}
                                    ${isToday ? 'border-blue-500 ring-2 ring-blue-500' : ''}
                                    hover:bg-blue-50 transition-colors
                                `}
                                onClick={() => handleDayClick(day)}
                            >
                                <span className={`font-semibold text-lg ${isCurrentMonthDay ? 'text-gray-800' : 'text-gray-400'}`}>
                                    {day ? format(day, 'd') : ''}
                                </span>
                                <div className="flex flex-col space-y-1 mt-1 w-full overflow-hidden">
                                    {tasksOnDay.slice(0, 2).map(task => ( // Show max 2 tasks directly
                                        <p key={task._id} className={`text-xs font-medium px-1 py-0.5 rounded-md truncate
                                            ${task.priority === 'High' ? 'bg-red-200 text-red-800' :
                                              task.priority === 'Medium' ? 'bg-yellow-200 text-yellow-800' :
                                              'bg-green-200 text-green-800'}`}>
                                            {task.title}
                                        </p>
                                    ))}
                                    {tasksOnDay.length > 2 && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            +{tasksOnDay.length - 2} more
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Add/Edit Task Modal */}
            <TimetableModal
                show={showAddTaskModal}
                onClose={() => {
                    setShowAddTaskModal(false);
                    setTaskToEdit(null); // Clear edit state on close
                }}
                onSave={handleSaveTask}
                initialData={taskToEdit}
            />

            {/* Daily Tasks View Modal */}
            <DailyTasksModal
                show={showDailyTasksModal}
                onClose={() => setShowDailyTasksModal(false)}
                date={selectedDate}
                tasksForDay={filteredTasks[format(selectedDate, 'yyyy-MM-dd')]}
                onEditTask={handleEditTask}
                onDeleteTask={handleDeleteTask}
            />
        </div>
    );
};

export default TimetablePage;
