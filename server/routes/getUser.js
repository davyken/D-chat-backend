import express from "express";
import authMiddleware from "../middleware/authIndex.js";
import { getParticularUser } from "../models/getUsers.js";

const router = express.Router();

router.get("/user-profile/:id", authMiddleware, getParticularUser);

export default router;
