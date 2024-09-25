import pool from "../db/index.js";
import uploadImageToCloudinary from "../middleware/cloud.js";

const addStory = async (req, res) => {
  console.log("Inside addStory function");
  const { textContent } = req.body;
  const media = req.files?.media;
  const userId = req.user.id;

  console.log(
    "User ID:",
    userId,
    "Media:",
    media,
    "Text content:",
    textContent
  );

  if (!userId) {
    console.log("ERROR! User ID is required");
    return res.status(400).json({ message: "User ID is required" });
  }

  if (!media && !textContent) {
    console.log("ERROR! Media or text content is required");
    return res
      .status(400)
      .json({ message: "Media or text content is required" });
  }

  const client = await pool.connect();
  console.log("Connected to the database");

  try {
    let mediaUrl;
    let mediaType;

    if (media) {
      console.log("Uploading image/video to Cloudinary");
      const uploadResult = await uploadImageToCloudinary(media.tempFilePath);
      console.log("Upload result:", uploadResult);

      mediaUrl = uploadResult.url;
      mediaType = media.mimetype.split("/")[0];
    }

    console.log("Adding story to the database");

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    console.log("Expires at:", expiresAt);

    await client.query(
      "INSERT INTO stories (user_id, media_url, media_type, text_content, expires_at) VALUES ($1, $2, $3, $4, $5)",
      [userId, mediaUrl, mediaType, textContent, expiresAt]
    );

    console.log("Story added to the database");
    return res.status(200).json({ message: "Story added successfully" });
  } catch (error) {
    console.error("Error adding story:", error);
    return res.status(500).json({ message: "Error adding story" });
  } finally {
    client.release();
    console.log("Disconnected from the database");
  }
};

export { addStory };
