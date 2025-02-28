// Backend - Chat Controller
import { Request, Response } from 'express';
import { StreamChat } from 'stream-chat';
import { userModel } from '../models/userModel';

const apiKey = process.env.STREAM_API_KEY || "";
const apiSecret = process.env.STREAM_API_SECRET;
const serverClient = StreamChat.getInstance(apiKey, apiSecret);

const sanitizeUserId = (userId) => {
    return userId.replace(/\./g, '_').replace(/@/g, '_');
};

// Initialize or get a direct message channel between two users
export const initializeDirectChat = async (req, res) => {
    try {
        const { targetUserId } = req.body; // ID of the user to chat with
        const currentUserId = req.headers.id;

        // Get both users
        const currentUser = await userModel.findById(currentUserId);
        const targetUser = await userModel.findById(targetUserId);

        if (!currentUser || !targetUser) {
            return res.status(404).json({ message: 'One or both users not found' });
        }

        const currentSanitizedId = sanitizeUserId(currentUser.email);
        const targetSanitizedId = sanitizeUserId(targetUser.email);

        // Channel ID is a combination of both user IDs (sorted to ensure consistency)
        const members = [currentSanitizedId, targetSanitizedId].sort();
        const channelId = `dm-${members.join('-')}`;

        // Check if channel exists, create if it doesn't
        const channel = serverClient.channel('messaging', channelId, {
            name: `Chat between ${currentUser.name} and ${targetUser.name}`,
            members,
            created_by_id: currentSanitizedId,
            // Store user roles in channel data
            member_data: {
                [currentSanitizedId]: {
                    role: currentUser.role,
                    user_id: currentSanitizedId
                },
                [targetSanitizedId]: {
                    role: targetUser.role,
                    user_id: targetSanitizedId
                }
            }
        });

        // Create or query the channel
        await channel.create();

        res.json({
            channelId,
            channelType: 'messaging'
        });
    } catch (error) {
        console.error('Error initializing direct chat:', error);
        res.status(500).json({ message: 'Error initializing direct chat', error });
    }
};

// Get chat token for the current user
export const getChatToken = async (req, res) => {
    try {
        const userId = req.headers.id;

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const sanitizedUserId = sanitizeUserId(user.email);
        const token = serverClient.createToken(sanitizedUserId);

        res.json({
            token,
            user: {
                id: sanitizedUserId,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error generating chat token:', error);
        res.status(500).json({ message: 'Error generating chat token', error });
    }
};

// Get all available users to chat with
export const getAvailableUsers = async (req, res) => {
    try {
        const currentUserId = req.headers.id;

        // Find all users except the current one
        const users = await userModel.find({ _id: { $ne: currentUserId } })
            .select('_id name email role');

        res.json({
            users: users.map(user => ({
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                sanitizedId: sanitizeUserId(user.email)
            }))
        });
    } catch (error) {
        console.error('Error fetching available users:', error);
        res.status(500).json({ message: 'Error fetching available users', error });
    }
};