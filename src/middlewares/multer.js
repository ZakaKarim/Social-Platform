import multer from "multer";
import fs from "fs";
import path from "path";


//First Method 
// import multer from "multer";

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, "./public/temp")
//     },
//     filename: function (req, file, cb) {
      
//       cb(null, file.originalname)
//     }
//   })
  
// export const upload = multer({ 
//     storage, 
// })


// Define storage directory (works on both Vercel and local)
// 1. Choose the right storage folder
// const tempFolder = process.env.VERCEL ? "/tmp" : "./public/temp";

// // 2. Create folder if it doesn't exist
// if (!fs.existsSync(tempFolder)) {
//   fs.mkdirSync(tempFolder, { recursive: true });
// }

// // 3. Simple disk storage configuration
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, tempFolder); // Uses /tmp on Vercel, ./public/temp locally
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname);
//   },
// });

// // 4. Export configured multer middleware
// export const upload = multer({
//   storage,
// });


// const multer = require('multer');
// const path = require('path');
 
const upload = multer({
  storage: multer.diskStorage({}),
  // limits: { fileSize: 100 * 1024 * 1024 }, //100mb
  limits: { fieldSize: 52428800 }, //100mb
  fileFilter: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    // if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png" && ext !=='.gif') {
    //   cb(new Error("File type is not supported"), false);
    //   return;
    // }
    cb(null, true);
  },
});
 
export default upload;
 
 