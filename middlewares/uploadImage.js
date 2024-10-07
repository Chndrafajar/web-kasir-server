import multer from "multer";

// Konfigurasi multer untuk menangani upload file
const storage = multer.memoryStorage(); // Simpan file di memori
const upload = multer({ storage });

export default upload;
