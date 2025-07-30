// client/src/components/LostAndFound/LostAndFoundPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import LostFoundModal from './LostFoundModal';
import SimilarItemsModal from './SimilarItemsModal'; // Import the new modal
import { Plus, MapPin, Clock } from 'lucide-react';

const LostAndFoundPage = ({ user }) => {
    const [items, setItems] = useState([]);
    const [showReportModal, setShowReportModal] = useState(false); // Renamed showModal to showReportModal for clarity
    const [matchedItems, setMatchedItems] = useState([]); // New state for matched items
    const [showSimilarItemsModal, setShowSimilarItemsModal] = useState(false); // State for similar items modal

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
            const res = await api.post('/lost-and-found', newItem);
            // The backend now returns { item: savedItem, matchedItems }
            if (res.data.matchedItems && res.data.matchedItems.length > 0) {
                setMatchedItems(res.data.matchedItems);
                setShowSimilarItemsModal(true); // Show modal with similar items
            } else {
                alert('Item reported successfully! No similar lost items found at this time.');
            }
            fetchItems(); // Refresh the main list of items
        } catch (error) {
            console.error("Failed to report item", error);
            alert(`Failed to report item: ${error.response?.data?.msg || error.message}`);
        }
    };

    return (
        <div className="p-6 md:p-10 bg-gray-100 min-h-full">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Lost & Found</h2>
                <button
                    onClick={() => setShowReportModal(true)} // Use new state name
                    className="flex items-center bg-cyan-500 text-white px-4 py-2 rounded-lg shadow hover:bg-cyan-600 transition-colors"
                >
                    <Plus className="w-5 h-5 mr-2" /> Report an Item
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {items.length > 0 ? items.map(item => (
                    <div key={item._id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                        {item.imageUrl && (
                            <img
                                src={item.imageUrl}
                                alt={item.item}
                                className="w-full h-48 object-cover"
                                onError={(e) => e.target.src = 'https://placehold.co/400x200/cccccc/000000?text=No+Image'} // Fallback image
                            />
                        )}
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
            {/* Report Item Modal */}
            {showReportModal && (
                <LostFoundModal
                    show={showReportModal}
                    onClose={() => setShowReportModal(false)}
                    onReport={handleReportItem}
                />
            )}
            {/* Similar Items Modal */}
            {showSimilarItemsModal && (
                <SimilarItemsModal
                    show={showSimilarItemsModal}
                    onClose={() => setShowSimilarItemsModal(false)}
                    matchedItems={matchedItems}
                />
            )}
        </div>
    );
};
export default LostAndFoundPage;
