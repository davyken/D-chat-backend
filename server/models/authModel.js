import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db/index.js";
import sendEmail from "../middleware/sendEmail.js";
import { validationResult } from "express-validator";

const register = async (req, res) => {
  console.log("Registering user...");
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Validation errors:", errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;

  try {
    const client = await pool.connect();
    console.log("Connected to the database");

    console.log("Checking if user already exists...");
    const userExist = await client.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (userExist.rows.length > 0) {
      client.release();
      console.log("User already exists");
      return res.status(400).json({ message: "User already exists" });
    }

    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Generating verification code...");
    const verificationCode = Math.floor(100000 + Math.random() * 900000);

    console.log("Setting expiration date for the verification code...");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    console.log("Inserting user into the database...");
    await client.query(
      "INSERT INTO users (username, email, password, is_verified) VALUES ($1, $2, $3, $4) ",
      [username, email, hashedPassword, false]
    );

    console.log("Checking user id...");
    const userIdCheck = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    const userId = userIdCheck.rows[0].id;

    console.log("Inserting verification code into the database...");
    await client.query(
      "INSERT INTO email_verification_codes (user_id, code, expires_at) VALUES ($1, $2, $3)",
      [userId, verificationCode, expiresAt]
    );

    console.log("Sending verification email...");
    await sendEmail(
      email,
      "verification code",
      `Dear ${username}, your verification code is ${verificationCode} use it to verify your account`
    );

    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    console.log("Sending token...");
    res.status(200).json({ token });

    client.release();

    console.log("User registered successfully");
    return res.status(200).json({
      message: `Please check your email. A verification code has been sent to ${email} use it to verify your account`,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const verifyEmail = async (req, res) => {
  const { email, verificationCode } = req.body;
  console.log("Verifying email...");
  try {
    const client = await pool.connect();
    console.log("Connected to the database");

    console.log("Checking if user exists...");
    const userExist = await client.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (userExist.rows.length === 0) {
      client.release();
      console.log("User does not exist");
      return res.status(400).json({ message: "User does not exist" });
    }

    const user = userExist.rows[0];
    if (user.is_verified) {
      client.release();
      console.log("User already verified");
      return res.status(400).json({ message: "User already verified" });
    }

    console.log("Checking verification code...");
    const verificationCodeCheck = await client.query(
      "SELECT * FROM email_verification_codes WHERE user_id = $1 AND code = $2 AND expires_at > $3",
      [user.id, verificationCode, new Date()]
    );

    if (verificationCodeCheck.rows.length === 0 || !verificationCode) {
      client.release();
      console.log("Invalid verification code or expired");
      return res
        .status(400)
        .json({ message: "Invalid verification code or expired" });
    }

    console.log("Updating user's verification status...");
    await client.query("UPDATE users SET is_verified = true WHERE id = $1", [
      user.id,
    ]);

    console.log("Deleting verification code...");
    await client.query(
      "DELETE FROM email_verification_codes WHERE user_id = $1 AND code = $2",
      [user.id, verificationCode]
    );

    client.release();
    console.log("Email verified successfully");
    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Error verifying email:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  console.log("Starting login process...");

  try {
    const client = await pool.connect();
    console.log("Connected to the database");

    console.log("Checking if user exists...");
    const userExist = await client.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (userExist.rows.length === 0) {
      client.release();
      console.log("User does not exist");
      return res.status(400).json({ message: "User does not exist" });
    }

    const user = userExist.rows[0];
    console.log("User found");

    if (!user.is_verified) {
      client.release();
      console.log("User not verified");
      return res
        .status(400)
        .json({ message: "Please verify your email first" });
    }

    console.log("Checking password...");
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      client.release();
      console.log("Invalid credentials");
      return res.status(400).json({ message: "Invalid credentials" });
    }
    console.log("Login successful");

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });
    console.log("Token generated");

    client.release();
    console.log("Logged in successfully");
    return res.status(200).json({ token, user });
  } catch (error) {
    console.error("Error logging in:", error.message);
    client.release();
    return res.status(500).json({ message: "Internal server error" });
  }
};

const logout = async (req, res) => {
  return res.status(200).json({ message: "Logged out successfully" });
};

const getUserById = async (id) => {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return result.rows[0];
};

export { register, verifyEmail, login, logout, getUserById };
