import pool from "../db/index.js";

const getAllUsers = async () => {
  const result = await pool.query("SELECT * FROM users");
  return result.rows;
};

const getParticularUser = async (req, res) => {
  console.log("Inside getParticularUser function");
  const userId = req.params.id;
  console.log("User ID:", userId);

  if (!userId) {
    console.log("User ID is required");
    return res.status(400).json({ message: "User ID is required" });
  }
  console.log("Fetching user details for user ID:", userId);

  try {
    const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);
    const user = userResult.rows[0];
    console.log("User:", user);
    if (!user) {
      console.log("User does not exist");
      return res.status(404).json({ message: "User does not exist" });
    }

    console.log("User fetched successfully");
    return res.status(200).json({
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return res.status(500).json({ message: "Error fetching user details" });
  }
};

export { getAllUsers, getParticularUser };
