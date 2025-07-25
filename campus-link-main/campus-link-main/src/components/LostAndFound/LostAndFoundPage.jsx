/* --- client/src/components/LostAndFound/LostAndFoundPage.jsx --- */
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import LostFoundModal from './LostFoundModal';
import { Plus, MapPin, Clock } from 'lucide-react';

const LostAndFoundPage = ({ user }) => {
    const [items, setItems] = useState([]);
    const [showModal, setShowModal] = useState(false);

    const fetchItems = useCallback(async () => {
        try {
            const res = await api.get('/lost-and-found');
            setItems(res.data);
        } catch (error) {
            console.error("Failed to fetch items", error);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const handleReportItem = async (newItem) => {
        try {
            await api.post('/lost-and-found', newItem);
            fetchItems();
        } catch (error) {
            console.error("Failed to report item", error);
        }
    };

    return (
        <div className="p-6 md:p-10">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Lost & Found</h2>
                <button onClick={() => setShowModal(true)} className="flex items-center bg-cyan-500 text-white px-4 py-2 rounded-lg shadow hover:bg-cyan-600 transition-colors">
                    <Plus className="w-5 h-5 mr-2" /> Report an Item
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {items.length > 0 ? items.map(item => (
                    <div key={item._id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="p-4">
                            <span className={`px-3 py-1 text-sm font-bold rounded-full text-white ${item.type === 'lost' ? 'bg-red-500' : 'bg-green-500'}`}>
                                {item.type.toUpperCase()}
                            </span>
                            <h3 className="text-lg font-bold text-gray-800 mt-2">{item.item}</h3>
                            <p className="text-sm text-gray-500 mb-2">{item.category}</p>
                            <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                            <div className="text-xs text-gray-500 space-y-1">
                                <p className="flex items-center"><MapPin className="w-4 h-4 mr-2" /> {item.location}</p>
                                <p className="flex items-center"><Clock className="w-4 h-4 mr-2" /> {new Date(item.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                )) : <p className="text-center text-gray-500 col-span-full">No items reported yet.</p>}
            </div>
            {showModal && <LostFoundModal onClose={() => setShowModal(false)} onReport={handleReportItem} />}
        </div>
    );
};
export default LostAndFoundPage;