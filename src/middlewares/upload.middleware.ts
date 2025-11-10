// src/middlewares/upload.middleware.ts
import multer from 'multer';
import path from 'path';

// Configuración de almacenamiento en memoria
const storage = multer.memoryStorage();

// Filtro para aceptar solo archivos CSV
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedExtensions = ['.csv'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Tipo de archivo no permitido. Solo se permiten archivos: ${allowedExtensions.join(', ')}`
      )
    );
  }
};

// Configuración de multer
export const uploadCSV = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB máximo
  },
});
