import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import { AppError } from "../errors.js";
import type { AppEnv } from "../../types/env.js";

const PHOTO_MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};

export type StorageProvider = {
  uploadProfilePhoto(input: { userId: string; mimeType: string; buffer: Buffer }): Promise<{ objectKey: string }>;
  deleteObject(objectKey: string): Promise<void>;
  resolvePublicUrl(objectKey: string): string;
};

function toUrlPath(pathValue: string) {
  return pathValue
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function getFileExtension(mimeType: string) {
  const ext = PHOTO_MIME_EXT[mimeType];
  if (!ext) {
    throw new AppError(400, "VALIDATION_ERROR", "unsupported file type");
  }
  return ext;
}

function resolveUploadDir(env: AppEnv) {
  return path.resolve(process.cwd(), env.LOCAL_UPLOAD_DIR);
}

function resolveUploadPath(rootDir: string, objectKey: string) {
  const normalized = path.normalize(objectKey);
  if (normalized.includes("..") || path.isAbsolute(normalized)) {
    throw new AppError(400, "VALIDATION_ERROR", "invalid object key");
  }
  return path.join(rootDir, normalized);
}

function createLocalStorageProvider(env: AppEnv): StorageProvider {
  const rootDir = resolveUploadDir(env);
  const publicBase = env.STORAGE_PUBLIC_BASE_URL.replace(/\/$/, "");

  return {
    async uploadProfilePhoto(input) {
      const ext = getFileExtension(input.mimeType);
      const objectKey = `profile-photos/${input.userId}/${Date.now()}-${randomUUID()}.${ext}`;
      const fullPath = resolveUploadPath(rootDir, objectKey);
      await mkdir(path.dirname(fullPath), { recursive: true });
      await writeFile(fullPath, input.buffer);
      return { objectKey };
    },

    async deleteObject(objectKey) {
      const fullPath = resolveUploadPath(rootDir, objectKey);
      try {
        await unlink(fullPath);
      } catch (error) {
        const code = (error as NodeJS.ErrnoException).code;
        if (code !== "ENOENT") {
          throw error;
        }
      }
    },

    resolvePublicUrl(objectKey) {
      return `${publicBase}/uploads/${toUrlPath(objectKey)}`;
    }
  };
}

function createS3StorageProvider(env: AppEnv): StorageProvider {
  const publicBase = (env.S3_PUBLIC_BASE_URL || "").replace(/\/$/, "");

  return {
    async uploadProfilePhoto() {
      throw new AppError(501, "NOT_IMPLEMENTED", "s3 storage provider is not implemented yet");
    },
    async deleteObject() {
      throw new AppError(501, "NOT_IMPLEMENTED", "s3 storage provider is not implemented yet");
    },
    resolvePublicUrl(objectKey) {
      if (publicBase.length > 0) {
        return `${publicBase}/${toUrlPath(objectKey)}`;
      }
      return objectKey;
    }
  };
}

export function createStorageProvider(env: AppEnv): StorageProvider {
  if (env.STORAGE_PROVIDER === "s3") {
    return createS3StorageProvider(env);
  }
  return createLocalStorageProvider(env);
}

export function getLocalUploadDir(env: AppEnv) {
  return resolveUploadDir(env);
}

export function resolveLocalObjectPath(env: AppEnv, objectKey: string) {
  const rootDir = resolveUploadDir(env);
  return resolveUploadPath(rootDir, objectKey);
}
