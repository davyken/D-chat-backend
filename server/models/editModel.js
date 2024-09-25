import bcrypt from "bcryptjs";
import pool from "../db/index.js";
import uploadImageToCloudinary from "../middleware/cloud.js";

const updateUser = async (req, res) => {
  console.log("Inside updateUser function");
  console.log("Request body:", req.body);
  const { username, bio, status_message, password } = req.body;
  console.log("Received data:", username, bio, status_message);
  const userId = req.user.id;
  console.log("User ID:", userId);

  if (!userId) {
    console.log("User ID is required");
    return res.status(400).json({ message: "User ID is required" });
  }

  const client = await pool.connect();
  console.log("Connected to the database");

  try {
    console.log("Fetching user from the database");
    const userResult = await client.query(
      "SELECT password FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      console.log("User does not exist");
      client.release();
      return res.status(400).json({ message: "User does not exist" });
    }

    console.log("Checking password");
    if (
      username &&
      !(await bcrypt.compare(password, userResult.rows[0].password))
    ) {
      console.log("Invalid password");
      client.release();
      return res.status(400).json({ message: "Invalid password" });
    }

    const updateFields = [];
    const queryParams = [userId];

    if (username) {
      updateFields.push(`username = $${queryParams.length + 1}`);
      queryParams.push(username);
    }
    if (bio) {
      updateFields.push(`bio = $${queryParams.length + 1}`);
      queryParams.push(bio);
    }
    if (status_message) {
      updateFields.push(`status_message = $${queryParams.length + 1}`);
      queryParams.push(status_message);
    }

    if (updateFields.length === 0) {
      console.log("No valid fields to update");
      client.release();
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const updateQuery = `UPDATE users SET ${updateFields.join(
      ", "
    )} WHERE id = $1 RETURNING username, bio, status_message`;

    console.log("Updating user in the database");
    const updateResult = await client.query(updateQuery, queryParams);

    client.release();

    console.log("User updated successfully");
    return res.status(200).json({
      message: "User updated successfully",
      data: updateResult.rows[0],
    });
  } catch (error) {
    console.error("Error during user update:", error);
    client.release();
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateProfilePicture = async (req, res) => {
  console.log("Inside updateProfilePicture function");
  const userId = req.user.id;
  console.log("User ID:", userId);

  if (!userId) {
    console.log("User ID is required");
    return res.status(400).json({ message: "User ID is required" });
  }

  if (!req.files || !req.files.image) {
    console.log("No image provided");
    return res.status(400).json({ message: "No image provided" });
  }

  const image = req.files.image;
  console.log("Image:", image);

  const client = await pool.connect();
  console.log("Connected to the database");

  try {
    console.log("Uploading image to Cloudinary");
    const profilePictureUrl = await uploadImageToCloudinary(image.tempFilePath);
    console.log("Profile picture URL:", profilePictureUrl);

    console.log("Updating profile picture in the database");
    await client.query("UPDATE users SET profile_picture = $1 WHERE id = $2", [
      profilePictureUrl,
      userId,
    ]);

    const updatedUser = await client.query(
      "SELECT profile_picture FROM users WHERE id = $1",
      [userId]
    );

    console.log("Profile picture updated successfully");
    return res.status(200).json({
      message: "Profile picture updated successfully",
      data: updatedUser.rows[0],
    });
  } catch (error) {
    console.error("Error during profile picture update:", error);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};

export { updateUser, updateProfilePicture };
