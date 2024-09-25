import express from "express";
import { updateUser } from "../models/editModel.js";
import authMiddleware from "../middleware/authIndex.js";
import { updateProfilePicture } from "../models/editModel.js";
const router = express.Router();

router.put("/edit-details", authMiddleware, updateUser);

router.put("/edit-profile-picture", authMiddleware, updateProfilePicture);

export default router;
