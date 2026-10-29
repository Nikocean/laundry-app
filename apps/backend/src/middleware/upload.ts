import { NextFunction, Request, Response } from "express";
import multer, { MulterError } from "multer";
import { AppError } from "../utils/errors";

/** REQ-FILE-02: reject files over 10MB before any storage write. */
export const MAX_PROOF_PHOTO_BYTES = 10 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_PROOF_PHOTO_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    // Runs before the buffer reaches Cloudinary (REQ-FILE-02).
    if (!file.mimetype.startsWith("image/")) {
      cb(new AppError(400, "File must be an image"));
      return;
    }
    cb(null, true);
  },
});

/**
 * Parses a single multipart `file` field. JSON requests pass through
 * untouched so the existing { proofPhotoUrl } behaviour is preserved.
 */
export function uploadProofPhotoFile(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  upload.single("file")(req, res, (err: unknown) => {
    if (!err) {
      next();
      return;
    }
    if (err instanceof MulterError && err.code === "LIMIT_FILE_SIZE") {
      next(new AppError(400, "File exceeds 10MB limit"));
      return;
    }
    if (err instanceof AppError) {
      next(err);
      return;
    }
    if (err instanceof MulterError) {
      next(new AppError(400, err.message));
      return;
    }
    next(new AppError(400, "Invalid upload"));
  });
}
