import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

const sessionClaimsSchema = z.object({
  sub: z.string().uuid(),
  role: z.enum(["employee", "admin"])
});

export type SessionClaims = z.infer<typeof sessionClaimsSchema>;

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

export function readSessionCookie(app: FastifyInstance, request: FastifyRequest): SessionClaims | null {
  const rawCookie = request.cookies[app.env.SESSION_COOKIE_NAME];
  if (!rawCookie) {
    return null;
  }

  const unsigned = request.unsignCookie(rawCookie);
  if (!unsigned.valid) {
    return null;
  }

  try {
    const parsedJson = JSON.parse(Buffer.from(unsigned.value, "base64url").toString("utf8"));
    const parsed = sessionClaimsSchema.safeParse(parsedJson);
    if (!parsed.success) {
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}
