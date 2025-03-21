import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    //Upload on Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", // Automatically detect the file type weather its Image or Video
    });
    //console.log("Full response on Cloudinary.....", response);
    // file has been uploaded successfull
     console.log("file is uploaded on cloudinary ", response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    //console.log("Error:",error)
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
    return null;
  }
};


// Delete file from Cloudinary

const deleteFromCloudinary = async (publicId) => {
    try {
        if (!publicId) return null;

        const result = await cloudinary.uploader.destroy(publicId);
        console.log("Cloudinary deletion response:", result);
        
        return result;
    } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
        return null;
    }
};

export { uploadOnCloudinary,deleteFromCloudinary };
