import type { FastifyInstance, FastifyReply } from "fastify";

export function setSessionCookie(
  app: FastifyInstance,
  reply: FastifyReply,
  user: { id: string; role: "employee" | "admin" }
) {
  const payload = Buffer.from(JSON.stringify({ sub: user.id, role: user.role }), "utf8").toString("base64url");

  reply.setCookie(app.env.SESSION_COOKIE_NAME, payload, {
    httpOnly: true,
    signed: true,
    path: "/",
    sameSite: "lax",
    secure: app.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7
  });
}

export function clearSessionCookie(app: FastifyInstance, reply: FastifyReply) {
  reply.clearCookie(app.env.SESSION_COOKIE_NAME, { path: "/" });
}
