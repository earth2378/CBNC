import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";

import { notImplemented } from "../lib/http.js";
import { isAppError } from "../lib/errors.js";
import { findAllActiveLocations } from "../repositories/locations.repository.js";
import * as publicService from "../services/public.service.js";

const paramsSchema = z.object({
  public_id: z.string().uuid()
});

const querySchema = z.object({
  lang: z.enum(["th", "en", "zh"]).optional()
});

const publicRoutes: FastifyPluginAsync = async (app) => {
  app.get("/public/locations", async (_request, reply) => {
    const rows = await findAllActiveLocations(app.db);
    return reply.code(200).send(
      rows.map((r) => ({
        id: r.id,
        code: r.code,
        name_th: r.nameTh,
        name_en: r.nameEn,
        name_zh: r.nameZh,
        address_th: r.addressTh ?? null,
        address_en: r.addressEn ?? null,
        address_zh: r.addressZh ?? null,
        sort_order: r.sortOrder
      }))
    );
  });

  app.get("/public/profiles/:public_id", async (request, reply) => {
    const paramsParsed = paramsSchema.safeParse(request.params);
    const queryParsed = querySchema.safeParse(request.query);

    if (!paramsParsed.success || !queryParsed.success) {
      const issues = [
        ...(paramsParsed.success ? [] : paramsParsed.error.issues),
        ...(queryParsed.success ? [] : queryParsed.error.issues)
      ];
      return reply.code(400).send({
        error: {
          code: "VALIDATION_ERROR",
          message: issues.map((issue) => issue.message).join(", ")
        }
      });
    }

    try {
      const payload = await publicService.getPublicProfile(
        app.db,
        queryParsed.data.lang
          ? {
              storage: app.storage,
              publicId: paramsParsed.data.public_id,
              lang: queryParsed.data.lang
            }
          : {
              storage: app.storage,
              publicId: paramsParsed.data.public_id
            }
      );
      return reply.code(200).send(payload);
    } catch (error) {
      if (isAppError(error)) {
        return reply.code(error.statusCode).send({
          error: {
            code: error.code,
            message: error.message
          }
        });
      }

      request.log.error({ error }, "get public profile failed");
      return reply.code(500).send({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "unexpected server error"
        }
      });
    }
  });

  app.get("/public/profiles/:public_id/card.pdf", async (_request, reply) => {
    return notImplemented(reply, "GET /public/profiles/{public_id}/card.pdf");
  });

  app.get("/public/profiles/:public_id/card.jpg", async (_request, reply) => {
    return notImplemented(reply, "GET /public/profiles/{public_id}/card.jpg");
  });
};

export default publicRoutes;
