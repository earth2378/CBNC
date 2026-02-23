import "dotenv/config";
import { z } from "zod";

import type { AppEnv } from "../types/env.js";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  HOST: z.string().min(1).default("0.0.0.0"),
  DATABASE_URL: z.string().min(1),
  SESSION_COOKIE_NAME: z.string().min(1).default("session"),
  SESSION_SECRET: z.string().min(1),
  STORAGE_PROVIDER: z.enum(["local", "s3"]).default("local"),
  STORAGE_PUBLIC_BASE_URL: z.string().url().default("http://localhost:3001"),
  LOCAL_UPLOAD_DIR: z.string().min(1).default("uploads"),
  S3_BUCKET: z.string().min(1).optional(),
  S3_REGION: z.string().min(1).optional(),
  S3_PUBLIC_BASE_URL: z.string().url().optional()
});

export function loadEnv(): AppEnv {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration: ${message}`);
  }

  return {
    ...parsed.data,
    S3_BUCKET: parsed.data.S3_BUCKET,
    S3_REGION: parsed.data.S3_REGION,
    S3_PUBLIC_BASE_URL: parsed.data.S3_PUBLIC_BASE_URL
  };
}
