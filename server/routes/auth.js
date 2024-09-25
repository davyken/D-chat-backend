import express from "express";
import { check } from "express-validator";
import { register, verifyEmail, login, logout } from "../models/authModel.js";

const router = express.Router();

router.post(
  "/register",
  [
    check("username", "Username is required").not().isEmpty(),
    check("email", "Email is required").isEmail(),
    check("password", "Password is required").isLength({ min: 6 }),
  ],
  register
);
router.post(
  "/verify-email",
  [
    check("email", "Email is required").isEmail(),
    check("verificationCode", "Verification code is required").not().isEmpty(),
  ],
  verifyEmail
);
router.post(
  "/login",
  [
    check("email", "Email is required").isEmail(),
    check("password", "Password is required").isLength({ min: 6 }).exists(),
  ],
  login
);

router.post("logout", logout);

export default router;
