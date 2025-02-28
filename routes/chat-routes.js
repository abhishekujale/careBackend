
import express from 'express';
import { initializeDirectChat, getChatToken, getAvailableUsers } from '../controllers/chatController';
const express = require("express");
const router = express.Router();

// Chat routes
router.post('/direct', initializeDirectChat);
router.get('/token', getChatToken);
router.get('/users', getAvailableUsers);

export default router;