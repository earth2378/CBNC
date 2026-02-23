export type AppEnv = {
  NODE_ENV: "development" | "test" | "production";
  PORT: number;
  HOST: string;
  DATABASE_URL: string;
  SESSION_COOKIE_NAME: string;
  SESSION_SECRET: string;
  STORAGE_PROVIDER: "local" | "s3";
  STORAGE_PUBLIC_BASE_URL: string;
  LOCAL_UPLOAD_DIR: string;
  S3_BUCKET: string | undefined;
  S3_REGION: string | undefined;
  S3_PUBLIC_BASE_URL: string | undefined;
};
