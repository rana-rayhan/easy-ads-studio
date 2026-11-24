import fs from "fs";
import path from "path";
import multer from "multer";
import { randomUUID } from "crypto";
import createHttpError from "http-errors";
import { Request, Response, NextFunction } from "express";

// Images are saved in backend/uploads (created on start if missing).
export const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const adImageMulter = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    // Random file name, so two users can never overwrite each other's image.
    filename: (_req, file, cb) => cb(null, `${randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) return cb(null, true);
    cb(createHttpError(400, "Only jpeg, png or webp images are allowed"));
  },
}).single("image"); // The form field name must be "image".

// Turns multer's own errors (e.g. file too large) into 400 responses.
export const uploadAdImage = (req: Request, res: Response, next: NextFunction) => {
  adImageMulter(req, res, (error: unknown) => {
    if (error instanceof multer.MulterError) return next(createHttpError(400, error.message));
    next(error);
  });
};
