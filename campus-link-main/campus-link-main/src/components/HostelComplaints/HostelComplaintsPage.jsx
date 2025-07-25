/* --- client/src/components/HostelComplaints/HostelComplaintsPage.jsx --- */
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import ComplaintModal from './ComplaintModal';
import { Plus, AlertCircle, Wrench, CheckCircle } from 'lucide-react';

const HostelComplaintsPage = ({ user }) => {
    const [complaints, setComplaints] = useState([]);
    const [showModal, setShowModal] = useState(false);

    const fetchComplaints = useCallback(async () => {
        try {
            const res = await api.get('/complaints');
            setComplaints(res.data);
        } catch (error) {
            console.error("Failed to fetch complaints", error);
        }
    }, []);

    useEffect(() => {
        fetchComplaints();
    }, [fetchComplaints]);
    
    const handleAddComplaint = async (newComplaint) => {
        try {
            await api.post('/complaints', newComplaint);
            fetchComplaints();
        } catch (error) {
            console.error("Failed to add complaint", error);
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            await api.put(`/complaints/${id}`, { status });
            fetchComplaints();
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    const getStatusPill = (status) => {
        switch (status) {
            case 'pending': return <span className="flex items-center text-sm font-semibold text-orange-600"><AlertCircle className="w-4 h-4 mr-1.5" />Pending</span>;
            case 'in-progress': return <span className="flex items-center text-sm font-semibold text-blue-600"><Wrench className="w-4 h-4 mr-1.5" />In Progress</span>;
            case 'resolved': return <span className="flex items-center text-sm font-semibold text-green-600"><CheckCircle className="w-4 h-4 mr-1.5" />Resolved</span>;
            default: return null;
        }
    };

    return (
        <div className="p-6 md:p-10">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Hostel Complaints</h2>
                {user.role === 'student' && (
                    <button onClick={() => setShowModal(true)} className="flex items-center bg-cyan-500 text-white px-4 py-2 rounded-lg shadow hover:bg-cyan-600 transition-colors">
                        <Plus className="w-5 h-5 mr-2" /> New Complaint
                    </button>
                )}
            </div>
            <div className="bg-white rounded-2xl shadow-lg overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600">Category</th>
                            <th className="p-4 font-semibold text-gray-600">Description</th>
                            <th className="p-4 font-semibold text-gray-600">Date</th>
                            <th className="p-4 font-semibold text-gray-600">Status</th>
                            {user.role === 'admin' && <th className="p-4 font-semibold text-gray-600">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {complaints.length > 0 ? complaints.map(complaint => (
                            <tr key={complaint._id} className="border-b last:border-0 hover:bg-gray-50">
                                <td className="p-4 font-medium text-gray-800">{complaint.category}</td>
                                <td className="p-4 text-gray-600 max-w-sm truncate">{complaint.description}</td>
                                <td className="p-4 text-gray-500">{new Date(complaint.createdAt).toLocaleDateString()}</td>
                                <td className="p-4">{getStatusPill(complaint.status)}</td>
                                {user.role === 'admin' && (
                                    <td className="p-4">
                                        <select value={complaint.status} onChange={(e) => handleStatusChange(complaint._id, e.target.value)} className="p-2 border rounded-lg">
                                            <option value="pending">Pending</option>
                                            <option value="in-progress">In Progress</option>
                                            <option value="resolved">Resolved</option>
                                        </select>
                                    </td>
                                )}
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={user.role === 'admin' ? 5 : 4} className="p-4 text-center text-gray-500">No complaints filed yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {showModal && <ComplaintModal onClose={() => setShowModal(false)} onAdd={handleAddComplaint} />}
        </div>
    );
};
export default HostelComplaintsPage;