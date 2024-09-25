import express from "express";
import authMiddleware from "../middleware/authIndex.js";
import { addStory } from "../models/usersStories.js";

const router = express.Router();

router.post("/add-stories", authMiddleware, addStory);

export default router;
