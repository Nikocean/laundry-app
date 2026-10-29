import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp";
import { env } from "../config/env";
import { AppError } from "../utils/errors";

/** REQ-FILE-01: compressed payload must be at most 2MB before upload. */
export const MAX_COMPRESSED_BYTES = 2 * 1024 * 1024;

let configured = false;

function ensureConfigured(): void {
  if (configured) return;
  if (!env.cloudinaryCloudName || !env.cloudinaryApiKey || !env.cloudinaryApiSecret) {
    throw new AppError(500, "Cloudinary is not configured");
  }
  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
    secure: true,
  });
  configured = true;
}

type CompressedImage = {
  buffer: Buffer;
  asJpeg: boolean;
};

/**
 * Validates that the buffer is a real image (not just an image/* MIME label)
 * and, when larger than 2MB, re-encodes it as JPEG at decreasing
 * width/quality until it fits. Small valid images are kept as-is.
 */
export async function compressImage(buffer: Buffer): Promise<CompressedImage> {
  try {
    await sharp(buffer).metadata();
  } catch {
    throw new AppError(400, "File is not a valid image");
  }

  if (buffer.length <= MAX_COMPRESSED_BYTES) {
    return { buffer, asJpeg: false };
  }

  const widths = [1920, 1600, 1280, 1024, 800];
  const qualities = [82, 72, 62, 52, 42, 32];
  let smallest: Buffer | null = null;

  for (const width of widths) {
    for (const quality of qualities) {
      const out = await sharp(buffer)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .jpeg({ quality, mozjpeg: true })
        .toBuffer();
      if (!smallest || out.length < smallest.length) smallest = out;
      if (out.length <= MAX_COMPRESSED_BYTES) {
        return { buffer: out, asJpeg: true };
      }
    }
  }

  if (smallest && smallest.length <= MAX_COMPRESSED_BYTES) {
    return { buffer: smallest, asJpeg: true };
  }
  throw new AppError(400, "Image could not be compressed to 2MB");
}

/** Uploads an already-validated image buffer and returns its secure URL. */
export async function uploadProofPhotoImage(
  buffer: Buffer,
  orderId: string
): Promise<string> {
  ensureConfigured();
  const { buffer: payload, asJpeg } = await compressImage(buffer);

  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "laundry/proof-photos",
        public_id: `order-${orderId}-${Date.now()}`,
        resource_type: "image",
        ...(asJpeg ? { format: "jpg" } : {}),
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(new AppError(502, "Failed to upload image"));
          return;
        }
        resolve(result.secure_url);
      }
    );
    stream.end(payload);
  });
}
