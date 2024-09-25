import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { getUserById } from "../models/authModel.js";
dotenv.config();

const authMiddleware = async (req, res, next) => {
  try {
    // Access the Authorization header from the request
    const authHeader = req.header("Authorization");

    // If the header is missing, return a 401 Unauthorized response
    if (!authHeader) {
      return res
        .status(401)
        .json({ message: "Authorization header is missing" });
    }

    // Extract the token from the Authorization header
    const token = authHeader.replace("Bearer ", "");

    // Verify the token using the JWT_SECRET environment variable
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Retrieve the user from the database using the decoded user ID
    const user = await getUserById(decoded.userId);

    // If the user is not found, return a 401 Unauthorized response
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Attach the user object to the request object
    req.user = user;

    // Call the next middleware or route handler
    next();
  } catch (err) {
    // If an error occurs during authentication, return a 401 Unauthorized response
    res.status(401).json({ message: "Unauthorized", error: err.message });
  }
};

export default authMiddleware;
