import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";

import { clearSessionCookie, setSessionCookie } from "../lib/auth/session.js";
import { isAppError } from "../lib/errors.js";
import * as authService from "../services/auth.service.js";

const registerSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(200)
});

const loginSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1).max(200)
});

const resetPasswordSchema = z
  .object({
    email: z.string().email().max(320),
    new_password: z.string().min(8).max(200),
    re_new_password: z.string().min(8).max(200)
  })
  .refine((data) => data.new_password === data.re_new_password, {
    message: "new_password and re_new_password must match",
    path: ["re_new_password"]
  });

const authRoutes: FastifyPluginAsync = async (app) => {
  app.post("/auth/register", async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: {
          code: "VALIDATION_ERROR",
          message: parsed.error.issues.map((issue) => issue.message).join(", ")
        }
      });
    }

    try {
      const payload = await authService.register(app.db, parsed.data);
      setSessionCookie(app, reply, { id: payload.user.id, role: payload.user.role });
      return reply.code(201).send(payload);
    } catch (error) {
      if (isAppError(error)) {
        return reply.code(error.statusCode).send({
          error: {
            code: error.code,
            message: error.message
          }
        });
      }

      request.log.error({ error }, "register failed");
      return reply.code(500).send({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "unexpected server error"
        }
      });
    }
  });

  app.post("/auth/login", async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: {
          code: "VALIDATION_ERROR",
          message: parsed.error.issues.map((issue) => issue.message).join(", ")
        }
      });
    }

    try {
      const result = await authService.login(app.db, parsed.data);
      setSessionCookie(app, reply, { id: result.user.id, role: result.user.role });
      return reply.code(200).send(result.payload);
    } catch (error) {
      if (isAppError(error)) {
        return reply.code(error.statusCode).send({
          error: {
            code: error.code,
            message: error.message
          }
        });
      }

      request.log.error({ error }, "login failed");
      return reply.code(500).send({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "unexpected server error"
        }
      });
    }
  });

  app.post("/auth/logout", async (request, reply) => {
    try {
      clearSessionCookie(app, reply);
    } catch (error) {
      // Logout should be best-effort and not fail the client flow.
      request.log.warn({ error }, "logout cookie clear failed");
    }
    return reply.code(204).send();
  });

  app.post("/auth/reset-password", async (request, reply) => {
    const parsed = resetPasswordSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        error: {
          code: "VALIDATION_ERROR",
          message: parsed.error.issues.map((issue) => issue.message).join(", ")
        }
      });
    }

    try {
      return reply.code(200).send(
        await authService.resetPassword(app.db, {
          email: parsed.data.email,
          newPassword: parsed.data.new_password
        })
      );
    } catch (error) {
      if (isAppError(error)) {
        return reply.code(error.statusCode).send({
          error: {
            code: error.code,
            message: error.message
          }
        });
      }

      request.log.error({ error }, "reset password failed");
      return reply.code(500).send({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "unexpected server error"
        }
      });
    }
  });
};

export default authRoutes;
