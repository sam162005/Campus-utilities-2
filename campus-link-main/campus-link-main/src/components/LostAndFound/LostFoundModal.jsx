// client/src/components/LostAndFound/LostFoundModal.jsx
import React, { useState, useEffect } from 'react';

const LostFoundModal = ({ show, onClose, onReport, initialData }) => {
    const [formData, setFormData] = useState({
        type: initialData?.type || 'lost', // 'lost' or 'found'
        item: initialData?.item || '',
        category: initialData?.category || '',
        description: initialData?.description || '',
        location: initialData?.location || '',
        imageUrl: initialData?.imageUrl || ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(initialData?.imageUrl || null);
    const [geminiAnalysisLoading, setGeminiAnalysisLoading] = useState(false);
    const [geminiAnalysisError, setGeminiAnalysisError] = useState('');
    const [geminiAnalysisResult, setGeminiAnalysisResult] = useState(null); // To store Gemini's text analysis

    // Reset form and image states when modal opens or initialData changes
    useEffect(() => {
        if (show) {
            setFormData(initialData || {
                type: 'lost',
                item: '',
                category: '',
                description: '',
                location: '',
                imageUrl: ''
            });
            setImageFile(null);
            setImagePreview(initialData?.imageUrl || null);
            setGeminiAnalysisResult(null);
            setGeminiAnalysisError('');
        }
    }, [show, initialData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result); // For displaying preview
            };
            reader.readAsDataURL(file);
        } else {
            setImageFile(null);
            setImagePreview(null);
        }
    };

    const analyzeWithGemini = async (base64ImageData, textPrompt) => {
        setGeminiAnalysisLoading(true);
        setGeminiAnalysisError('');
        try {
            // IMPORTANT: Replace "YOUR_GEMINI_API_KEY" with your actual API key from Google Cloud Console
            const apiKey = "AIzaSyDseXa9jEkyyv3SFsO4g5Afvlyn0EPr_eY"; // <--- REPLACE THIS LINE
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const payload = {
                contents: [
                    {
                        role: "user",
                        parts: [
                            { text: textPrompt },
                            {
                                inlineData: {
                                    mimeType: imageFile.type, // Use the actual mime type of the uploaded file
                                    data: base64ImageData.split(',')[1] // Remove "data:image/png;base64," prefix
                                }
                            }
                        ]
                    }
                ],
            };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            // Check for API errors in the response
            if (result.error) {
                setGeminiAnalysisError(`Gemini API Error: ${result.error.message || 'Unknown error'}`);
                console.error('Gemini API Error Response:', result.error);
                return null;
            }

            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const geminiText = result.candidates[0].content.parts[0].text;
                setGeminiAnalysisResult(geminiText);
                return geminiText;
            } else {
                setGeminiAnalysisError('Gemini analysis failed: No valid response from AI (empty candidates).');
                console.error('Gemini API response structure unexpected or empty:', result);
                return null;
            }
        } catch (error) {
            setGeminiAnalysisError('Failed to analyze image with Gemini AI. Check console for details.');
            console.error('Error calling Gemini API:', error);
            return null;
        } finally {
            setGeminiAnalysisLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGeminiAnalysisError('');

        let geminiDescription = '';
        // Only analyze with Gemini if an image is provided
        if (imageFile) {
            const reader = new FileReader();
            reader.readAsDataURL(imageFile);
            reader.onloadend = async () => {
                const base64ImageData = reader.result;
                const textPrompt = `Analyze this image for a lost and found system. Describe the item, its color, approximate size, any distinguishing features, and potential categories (e.g., "electronics", "clothing", "jewelry"). Extract key tags/labels. Combine this into a concise description. Also consider the user's provided item name: "${formData.item}" and description: "${formData.description}".`;
                
                geminiDescription = await analyzeWithGemini(base64ImageData, textPrompt);
                
                // If Gemini analysis fails, still proceed with original data but log warning
                if (!geminiDescription) {
                    console.warn("Gemini analysis failed, proceeding with original data only.");
                }

                const dataToSend = {
                    ...formData,
                    imageUrl: base64ImageData, // Send Base64 image to backend if you want to store it or re-process
                    geminiAnalysis: geminiDescription // Send Gemini's text analysis (will be null if analysis failed)
                };
                await onReport(dataToSend);
                onClose();
            };
            reader.onerror = (error) => {
                setGeminiAnalysisError('Failed to read image file.');
                console.error('File reading error:', error);
                // Proceed without image analysis if file reading fails
                onReport(formData);
                onClose();
            };
        } else {
            // If no image, send only original form data
            await onReport(formData);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg">
                <h3 className="text-2xl font-bold mb-6 text-gray-800">{initialData ? 'Edit Item' : 'Report Item'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
                        <select
                            name="type"
                            id="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                            required
                        >
                            <option value="lost">Lost</option>
                            <option value="found">Found</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="item" className="block text-sm font-medium text-gray-700">Item Name</label>
                        <input
                            type="text"
                            name="item"
                            id="item"
                            value={formData.item}
                            onChange={handleChange}
                            placeholder="e.g., Blue Water Bottle"
                            className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                        <input
                            type="text"
                            name="category"
                            id="category"
                            value={formData.category}
                            onChange={handleChange}
                            placeholder="e.g., Electronics, Clothing, Stationery"
                            className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            name="description"
                            id="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="e.g., Has a small dent on the side, black strap."
                            rows="3"
                            className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                            required
                        ></textarea>
                    </div>
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                        <input
                            type="text"
                            name="location"
                            id="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="e.g., Library 2nd floor, Cafeteria"
                            className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="image" className="block text-sm font-medium text-gray-700">Upload Image (Optional)</label>
                        <input
                            type="file"
                            name="image"
                            id="image"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {imagePreview && (
                            <div className="mt-2 w-32 h-32 overflow-hidden rounded-lg border border-gray-300">
                                <img src={imagePreview} alt="Image Preview" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>
                    {geminiAnalysisLoading && (
                        <div className="text-center text-blue-600">Analyzing image with AI...</div>
                    )}
                    {geminiAnalysisError && (
                        <div className="text-center text-red-600">{geminiAnalysisError}</div>
                    )}
                    <div className="flex justify-end space-x-4 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 transition-colors"
                            disabled={geminiAnalysisLoading} // Disable while AI is analyzing
                        >
                            Report Item
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LostFoundModal;
