export type AppEnv = {
  NODE_ENV: "development" | "test" | "production";
  PORT: number;
  HOST: string;
  DATABASE_URL: string;
  SESSION_COOKIE_NAME: string;
  SESSION_SECRET: string;
};
