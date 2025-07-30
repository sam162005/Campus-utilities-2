import React, { useState, useEffect } from 'react';
import api from '../../services/api'; // Adjust path as needed

const AdminPollsPage = () => {
    const [polls, setPolls] = useState([]);
    const [newPoll, setNewPoll] = useState({ question: '', options: ['', ''], isAnonymous: false }); // Added isAnonymous
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPolls();
    }, []);

    const fetchPolls = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/polls');
            setPolls(res.data);
        } catch (err) {
            setError('Failed to fetch polls.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleNewPollChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewPoll({ ...newPoll, [name]: type === 'checkbox' ? checked : value });
    };

    const handleOptionChange = (index, e) => {
        const updatedOptions = newPoll.options.map((option, i) =>
            i === index ? e.target.value : option
        );
        setNewPoll({ ...newPoll, options: updatedOptions });
    };

    const addOption = () => {
        setNewPoll({ ...newPoll, options: [...newPoll.options, ''] });
    };

    const removeOption = (index) => {
        const updatedOptions = newPoll.options.filter((_, i) => i !== index);
        setNewPoll({ ...newPoll, options: updatedOptions });
    };

    const handleCreatePoll = async (e) => {
        e.preventDefault();
        setError('');
        const filteredOptions = newPoll.options.filter(opt => opt.trim() !== '');
        if (filteredOptions.length < 2) {
            setError('Please provide at least two non-empty options for the poll.');
            return;
        }

        try {
            await api.post('/polls', {
                question: newPoll.question,
                options: filteredOptions,
                isAnonymous: newPoll.isAnonymous // Send the isAnonymous flag
            });
            setNewPoll({ question: '', options: ['', ''], isAnonymous: false }); // Reset form
            fetchPolls(); // Refresh list
            alert('Poll created successfully!');
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to create poll.');
            console.error(err);
        }
    };

    const handleDeletePoll = async (id) => {
        if (window.confirm('Are you sure you want to delete this poll? This action cannot be undone.')) {
            setError('');
            try {
                await api.delete(`/polls/${id}`);
                fetchPolls(); // Refresh list
                alert('Poll deleted successfully!');
            } catch (err) {
                setError(err.response?.data?.msg || 'Failed to delete poll.');
                console.error(err);
            }
        }
    };

    const handleToggleActiveStatus = async (id, currentStatus) => {
        setError('');
        try {
            await api.put(`/polls/${id}/toggle-active`);
            fetchPolls(); // Refresh list
            alert(`Poll status toggled to ${currentStatus ? 'inactive' : 'active'}!`);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to toggle poll status.');
            console.error(err);
        }
    };

    if (loading) return <div className="text-center text-white mt-8">Loading polls...</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <h1 className="text-4xl font-bold text-cyan-400 mb-8 text-center">Manage Polls</h1>

            {error && <div className="bg-red-600 text-white p-3 rounded-lg mb-4 text-center">{error}</div>}

            {/* Create New Poll Form */}
            <div className="bg-gray-800 p-6 rounded-2xl shadow-lg mb-8 max-w-2xl mx-auto">
                <h2 className="text-2xl font-semibold text-cyan-400 mb-4">Create New Poll</h2>
                <form onSubmit={handleCreatePoll} className="space-y-4">
                    <input
                        type="text"
                        name="question"
                        placeholder="Poll Question"
                        value={newPoll.question}
                        onChange={handleNewPollChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        required
                    />
                    {newPoll.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <input
                                type="text"
                                placeholder={`Option ${index + 1}`}
                                value={option}
                                onChange={(e) => handleOptionChange(index, e)}
                                className="flex-grow px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                                required
                            />
                            {newPoll.options.length > 2 && ( // Allow removing if more than 2 options
                                <button
                                    type="button"
                                    onClick={() => removeOption(index)}
                                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    &times;
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addOption}
                        className="w-full py-2 font-semibold text-gray-900 bg-gray-400 rounded-lg hover:bg-gray-500 transition-colors"
                    >
                        Add Option
                    </button>

                    {/* Anonymous Poll Checkbox */}
                    <div className="flex items-center mt-4">
                        <input
                            type="checkbox"
                            name="isAnonymous"
                            id="isAnonymous"
                            checked={newPoll.isAnonymous}
                            onChange={handleNewPollChange}
                            className="h-5 w-5 text-cyan-400 focus:ring-cyan-400 border-gray-600 rounded"
                        />
                        <label htmlFor="isAnonymous" className="ml-2 block text-sm text-gray-300">
                            Make this poll anonymous (voter names will not be displayed)
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 font-semibold text-gray-900 bg-cyan-400 rounded-lg hover:bg-cyan-500 transition-colors"
                    >
                        Create Poll
                    </button>
                </form>
            </div>

            {/* List of Existing Polls */}
            <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-semibold text-cyan-400 mb-4 text-center">Existing Polls</h2>
                {polls.length === 0 ? (
                    <p className="text-center text-gray-400">No polls created yet.</p>
                ) : (
                    <div className="grid gap-6 md:grid-cols-1">
                        {polls.map((poll) => (
                            <div key={poll._id} className="bg-gray-800 p-6 rounded-2xl shadow-lg flex flex-col">
                                <h3 className="text-xl font-semibold text-cyan-300 mb-2">{poll.question}</h3>
                                <p className={`text-sm font-medium ${poll.isActive ? 'text-green-400' : 'text-red-400'} mb-1`}>
                                    Status: {poll.isActive ? 'Active' : 'Inactive'}
                                </p>
                                <p className="text-sm text-gray-400 mb-3">
                                    Type: {poll.isAnonymous ? 'Anonymous' : 'Normal (Voter Names Visible)'}
                                </p>
                                <ul className="space-y-2 mb-4">
                                    {poll.options.map((option) => (
                                        <li key={option._id} className="flex justify-between items-center text-gray-300 text-base">
                                            <span>{option.text}</span>
                                            <span className="font-semibold">{option.votes} votes</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-auto flex space-x-2">
                                    <button
                                        onClick={() => handleToggleActiveStatus(poll._id, poll.isActive)}
                                        className={`flex-1 py-2 px-4 rounded-lg transition-colors text-sm font-semibold
                                            ${poll.isActive ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
                                    >
                                        {poll.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button
                                        onClick={() => handleDeletePoll(poll._id)}
                                        className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
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

export default AdminPollsPage;
