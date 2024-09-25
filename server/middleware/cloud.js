import cloudinary from "../cloudinary/index.js";

const uploadImageToCloudinary = async (image, retries = 3) => {
  console.log("image", image);
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Uploading image... (${attempt}/${retries})...`);
      const result = await cloudinary.uploader.upload(image, {
        upload_preset: "messaging_app",
        timeout: 10000,
      });
      return result.url;
    } catch (error) {
      if (attempt === retries || error.name !== "TimeoutError") {
        throw error;
      }
      console.log(`Retrying upload (${attempt}/${retries})...`);
    }
  }
};

export default uploadImageToCloudinary;
