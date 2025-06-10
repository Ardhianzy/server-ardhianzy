// src/middleware/upload.middleware.ts
import multer from "multer";

// Menyimpan file di memory (untuk mengaksesnya sebagai buffer)
const storage = multer.memoryStorage();

// Mengonfigurasi multer dengan limit ukuran file dan file filter
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Batas ukuran file: 5MB
    files: 1, // Maksimal 1 file
  },
  fileFilter: (req, file, cb) => {
    // Hanya terima image files
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (JPEG, PNG, JPG, WebP) are allowed"));
    }
  },
});

// Mengekspor middleware multer sebagai default
export default upload;
