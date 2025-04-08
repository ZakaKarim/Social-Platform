import multer from "multer";
import fs from "fs";
import path from "path";

// Define storage directory (works on both Vercel and local)
// 1. Choose the right storage folder
const tempFolder = process.env.VERCEL ? "/tmp" : "./public/temp";

// 2. Create folder if it doesn't exist
if (!fs.existsSync(tempFolder)) {
  fs.mkdirSync(tempFolder, { recursive: true });
}

// 3. Simple disk storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempFolder); // Uses /tmp on Vercel, ./public/temp locally
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

// 4. Export configured multer middleware
export const upload = multer({
  storage,
});
