import { buildApp } from "./app.js";

async function main() {
  const app = buildApp();

  try {
    await app.listen({
      port: app.env.PORT,
      host: app.env.HOST
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void main();
