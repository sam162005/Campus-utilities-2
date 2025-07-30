// server/controllers/lostAndFoundController.js
const LostFoundItem = require('../models/LostFoundItem');
const User = require('../models/User'); // Import User model to get email
const nodemailer = require('nodemailer'); // Import Nodemailer
require('dotenv').config(); // Load environment variables

// Email transporter setup (reusing from authController, ensure it's configured in .env)
const transporter = nodemailer.createTransport({
    service: 'gmail', // Or your preferred email service
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS // Your email password or app-specific password
    }
});

// Helper function for text similarity (Jaccard Index)
const calculateSimilarity = (text1, text2) => {
    if (!text1 || !text2) return 0;

    const normalize = (str) => str.toLowerCase().split(/\s+/).filter(Boolean); // Split by spaces, remove empty
    const words1 = new Set(normalize(text1));
    const words2 = new Set(normalize(text2));

    if (words1.size === 0 || words2.size === 0) return 0;

    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
};

// @desc    Get all items
// @route   GET /api/lost-and-found
// @access  Public
exports.getItems = async (req, res) => {
    try {
        const items = await LostFoundItem.find().sort({ createdAt: -1 });
        res.json(items);
    } catch (err) {
        console.error('Error fetching lost and found items:', err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Create a new lost/found item
// @route   POST /api/lost-and-found
// @access  Private
exports.createItem = async (req, res) => {
    const { type, item, category, description, location, imageUrl, geminiAnalysis } = req.body;
    const reporter = req.user.id; // User ID from auth middleware

    try {
        const newItem = new LostFoundItem({
            type,
            item,
            category,
            description,
            location,
            imageUrl,
            geminiAnalysis, // Store the AI-generated analysis
            reporter
        });

        const savedItem = await newItem.save();

        let matchedItems = [];
        // If a 'found' item is reported, check for similar 'lost' items
        if (savedItem.type === 'found') {
            // Find lost items and populate their reporter's name and email
            const lostItems = await LostFoundItem.find({ type: 'lost' }).populate('reporter', 'name email');

            for (const lostItem of lostItems) {
                // Combine original description/item name with AI analysis for matching
                const foundItemCombinedText = `${savedItem.item} ${savedItem.description} ${savedItem.geminiAnalysis || ''}`;
                const lostItemCombinedText = `${lostItem.item} ${lostItem.description} ${lostItem.geminiAnalysis || ''}`;

                // Calculate text similarity (from user input + AI analysis)
                const textSimilarityScore = calculateSimilarity(foundItemCombinedText, lostItemCombinedText);

                // Define thresholds
                const TEXT_SIMILARITY_THRESHOLD = 0.2; // Adjust as needed
                const AI_ANALYSIS_SIMILARITY_THRESHOLD = 0.4; // Higher threshold for AI analysis match

                let isTextMatch = textSimilarityScore >= TEXT_SIMILARITY_THRESHOLD;
                let isAiMatch = false;

                // If both items have AI analysis, compare their AI descriptions
                if (savedItem.geminiAnalysis && lostItem.geminiAnalysis) {
                    const aiAnalysisSimilarityScore = calculateSimilarity(savedItem.geminiAnalysis, lostItem.geminiAnalysis);
                    isAiMatch = aiAnalysisSimilarityScore >= AI_ANALYSIS_SIMILARITY_THRESHOLD;
                } else if (savedItem.geminiAnalysis || lostItem.geminiAnalysis) {
                    // If only one has AI analysis, give a slight boost to text match if AI is present
                    // Or set a lower AI threshold if only one side has it.
                    // For now, we'll just rely on textSimilarity if AI analysis is not on both sides.
                }

                // Consider it a match if text similarity is high AND (if applicable) AI analysis is also similar
                if (isTextMatch && (isAiMatch || (!savedItem.geminiAnalysis && !lostItem.geminiAnalysis))) {
                    // If AI analysis was used and matched, or if no AI analysis was available for both
                    matchedItems.push(lostItem);

                    // Send email notification to the reporter of the lost item
                    if (lostItem.reporter && lostItem.reporter.email) {
                        const mailOptions = {
                            from: process.env.EMAIL_USER,
                            to: lostItem.reporter.email,
                            subject: `CampusLink: Potential Match Found for Your Lost Item - ${lostItem.item}`,
                            html: `
                                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                                    <h2 style="color: #007bff;">Great News from CampusLink Lost & Found!</h2>
                                    <p>Hello ${lostItem.reporter.name},</p>
                                    <p>We believe we've found a potential match for your lost item:</p>
                                    <div style="background-color: #f0f8ff; padding: 15px; border-left: 5px solid #007bff; margin-bottom: 20px;">
                                        <h3 style="margin-top: 0; color: #007bff;">Your Lost Item: ${lostItem.item}</h3>
                                        <p><strong>Description:</strong> ${lostItem.description}</p>
                                        <p><strong>Reported Location:</strong> ${lostItem.location}</p>
                                    </div>
                                    <p>A new item has been reported as found that closely matches your description.</p>
                                    <div style="background-color: #f0f8ff; padding: 15px; border-left: 5px solid #28a745; margin-bottom: 20px;">
                                        <h3 style="margin-top: 0; color: #28a745;">Newly Found Item Details:</h3>
                                        <p><strong>Item:</strong> ${savedItem.item}</p>
                                        <p><strong>Description:</strong> ${savedItem.description}</p>
                                        <p><strong>Found Location:</strong> ${savedItem.location}</p>
                                        ${savedItem.imageUrl ? `<p><img src="${savedItem.imageUrl}" alt="Found Item Image" style="max-width: 200px; height: auto; display: block; margin-top: 10px;"></p>` : ''}
                                    </div>
                                    <p>Please log in to CampusLink to view the full details and contact the reporter of the found item.</p>
                                    <p>Best regards,<br/>The CampusLink Team</p>
                                </div>
                            `
                        };

                        try {
                            await transporter.sendMail(mailOptions);
                            console.log(`Notification sent to ${lostItem.reporter.email} for potential match of lost item: ${lostItem.item}`);
                        } catch (mailError) {
                            console.error(`Failed to send match notification email to ${lostItem.reporter.email}:`, mailError);
                        }
                    } else {
                        console.warn(`Skipping email notification for lost item ${lostItem.item} (ID: ${lostItem._id}): Reporter email not found.`);
                    }
                }
            }
        }

        // Send back the newly created item and any matched items
        res.status(201).json({ item: savedItem, matchedItems });

    } catch (err) {
        console.error('Error creating lost/found item:', err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update an item (optional, if you need this functionality)
// @route   PUT /api/lost-and-found/:id
// @access  Private (Admin or reporter)
exports.updateItem = async (req, res) => {
    const { type, item, category, description, location, imageUrl, geminiAnalysis } = req.body;
    try {
        let existingItem = await LostFoundItem.findById(req.params.id);
        if (!existingItem) {
            return res.status(404).json({ msg: 'Item not found' });
        }
        // Optional: Authorization check - only reporter or admin can update
        // if (existingItem.reporter.toString() !== req.user.id && req.user.role !== 'admin') {
        //     return res.status(403).json({ msg: 'Not authorized to update this item' });
        // }

        existingItem.type = type || existingItem.type;
        existingItem.item = item || existingItem.item;
        existingItem.category = category || existingItem.category;
        existingItem.description = description || existingItem.description;
        existingItem.location = location || existingItem.location;
        existingItem.imageUrl = imageUrl || existingItem.imageUrl;
        existingItem.geminiAnalysis = geminiAnalysis || existingItem.geminiAnalysis; // Update AI analysis field

        await existingItem.save();
        res.json(existingItem);
    } catch (err) {
        console.error('Error updating lost/found item:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Invalid Item ID' });
        }
        res.status(500).send('Server Error');
    }
};

// @desc    Delete an item (optional, if you need this functionality)
// @route   DELETE /api/lost-and-found/:id
// @access  Private (Admin or reporter)
exports.deleteItem = async (req, res) => {
    try {
        const itemToDelete = await LostFoundItem.findById(req.params.id);
        if (!itemToDelete) {
            return res.status(404).json({ msg: 'Item not found' });
        }
        // Optional: Authorization check - only reporter or admin can delete
        // if (itemToDelete.reporter.toString() !== req.user.id && req.user.role !== 'admin') {
        //     return res.status(403).json({ msg: 'Not authorized to delete this item' });
        // }

        await LostFoundItem.deleteOne({ _id: req.params.id });
        res.json({ msg: 'Item removed' });
    } catch (err) {
        console.error('Error deleting lost/found item:', err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Invalid Item ID' });
        }
        res.status(500).send('Server Error');
    }
};
