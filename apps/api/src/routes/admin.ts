import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";

import { requireAdmin } from "../lib/auth/guard.js";
import { isAppError } from "../lib/errors.js";
import * as adminService from "../services/admin.service.js";

const updateUserParamsSchema = z.object({
  user_id: z.string().uuid()
});

const updateUserBodySchema = z.object({
  is_active: z.boolean()
});

const adminRoutes: FastifyPluginAsync = async (app) => {
  app.get("/admin/users", async (request, reply) => {
    try {
      requireAdmin(app, request);
      return reply.code(200).send(await adminService.listUsers(app.db));
    } catch (error) {
      if (isAppError(error)) {
        return reply.code(error.statusCode).send({
          error: {
            code: error.code,
            message: error.message
          }
        });
      }

      request.log.error({ error }, "list users failed");
      return reply.code(500).send({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "unexpected server error"
        }
      });
    }
  });

  app.patch("/admin/users/:user_id", async (request, reply) => {
    const paramsParsed = updateUserParamsSchema.safeParse(request.params);
    const bodyParsed = updateUserBodySchema.safeParse(request.body);

    if (!paramsParsed.success || !bodyParsed.success) {
      const issues = [
        ...(paramsParsed.success ? [] : paramsParsed.error.issues),
        ...(bodyParsed.success ? [] : bodyParsed.error.issues)
      ];
      return reply.code(400).send({
        error: {
          code: "VALIDATION_ERROR",
          message: issues.map((issue) => issue.message).join(", ")
        }
      });
    }

    try {
      const session = requireAdmin(app, request);
      const updatedUser = await adminService.updateUserActivation(app.db, {
        actorUserId: session.sub,
        userId: paramsParsed.data.user_id,
        isActive: bodyParsed.data.is_active
      });
      return reply.code(200).send(updatedUser);
    } catch (error) {
      if (isAppError(error)) {
        return reply.code(error.statusCode).send({
          error: {
            code: error.code,
            message: error.message
          }
        });
      }

      request.log.error({ error }, "update user failed");
      return reply.code(500).send({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "unexpected server error"
        }
      });
    }
  });
};

export default adminRoutes;
