import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import editPassRoutes from "./routes/editDetails.js";
import usersProfileRoutes from "./routes/getUser.js";
import storiesRoute from "./routes/stories.js";
import fileUpload from "express-fileupload";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    limits: { fileSize: 5 * 1024 * 1024 },
  })
);

app.use("/auth", authRoutes);
app.use("/update", editPassRoutes);
app.use("/users", usersProfileRoutes);
app.use("/stories", storiesRoute);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
