// client/src/components/LostAndFound/SimilarItemsModal.jsx
import React from 'react';
import { MapPin, Clock } from 'lucide-react';

const SimilarItemsModal = ({ show, onClose, matchedItems }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    Similar Lost Items Found!
                </h2>
                {matchedItems && matchedItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {matchedItems.map(item => (
                            <div key={item._id} className="bg-gray-50 rounded-lg shadow-sm p-4 border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-800 mb-1">{item.item}</h3>
                                <p className="text-sm text-gray-600 mb-2">{item.category}</p>
                                <p className="text-gray-700 text-sm mb-3">{item.description}</p>
                                <div className="text-xs text-gray-500 space-y-1">
                                    <p className="flex items-center"><MapPin className="w-4 h-4 mr-2" /> {item.location}</p>
                                    <p className="flex items-center"><Clock className="w-4 h-4 mr-2" /> {new Date(item.createdAt).toLocaleDateString()}</p>
                                </div>
                                {item.imageUrl && (
                                    <div className="mt-3">
                                        <img src={item.imageUrl} alt={item.item} className="w-full h-32 object-cover rounded-md" onError={(e) => e.target.src = 'https://placehold.co/150x150/cccccc/000000?text=No+Image'}/>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-600">No similar lost items were found.</p>
                )}
                <div className="flex justify-end mt-6">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SimilarItemsModal;
