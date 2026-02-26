import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";

import { requireAuth } from "../lib/auth/guard.js";
import { isAppError } from "../lib/errors.js";
import * as meService from "../services/me.service.js";

const getMyProfileQuerySchema = z.object({
  langs: z.string().optional()
});

const profileLocalizationSchema = z.object({
  full_name: z.string().max(200),
  position: z.string().max(200),
  department: z.string().max(200)
});

const updateMyProfileBodySchema = z.object({
  email_public: z.string().email().max(320),
  phone_number: z.string().max(50),
  pref_enable_th: z.boolean(),
  pref_enable_en: z.boolean(),
  pref_enable_zh: z.boolean(),
  location_id: z.string().uuid().nullable().optional(),
  localizations: z
    .object({
      th: profileLocalizationSchema.optional(),
      en: profileLocalizationSchema.optional(),
      zh: profileLocalizationSchema.optional()
    })
    .refine((value) => Boolean(value.th || value.en || value.zh), {
      message: "at least one localization is required"
    })
});

const meRoutes: FastifyPluginAsync = async (app) => {
  const maxPhotoBytes = 2 * 1024 * 1024;
  const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

  app.get("/me/profile", async (request, reply) => {
    const parsedQuery = getMyProfileQuerySchema.safeParse(request.query);
    if (!parsedQuery.success) {
      return reply.code(400).send({
        error: {
          code: "VALIDATION_ERROR",
          message: parsedQuery.error.issues.map((issue) => issue.message).join(", ")
        }
      });
    }

    try {
      const session = requireAuth(app, request);
      const payload = await meService.getMyProfile(
        app.db,
        parsedQuery.data.langs
          ? {
              storage: app.storage,
              userId: session.sub,
              langs: parsedQuery.data.langs
            }
          : {
              storage: app.storage,
              userId: session.sub
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

      request.log.error({ error }, "get my profile failed");
      return reply.code(500).send({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "unexpected server error"
        }
      });
    }
  });

  app.put("/me/profile", async (request, reply) => {
    const parsedBody = updateMyProfileBodySchema.safeParse(request.body);
    if (!parsedBody.success) {
      return reply.code(400).send({
        error: {
          code: "VALIDATION_ERROR",
          message: parsedBody.error.issues.map((issue) => issue.message).join(", ")
        }
      });
    }

    try {
      const session = requireAuth(app, request);
      const localizations = Object.fromEntries(
        Object.entries(parsedBody.data.localizations).filter((entry) => Boolean(entry[1]))
      ) as Partial<
        Record<
          "th" | "en" | "zh",
          {
            full_name: string;
            position: string;
            department: string;
          }
        >
      >;
      const payload = await meService.updateMyProfile(app.db, {
        storage: app.storage,
        userId: session.sub,
        emailPublic: parsedBody.data.email_public,
        phoneNumber: parsedBody.data.phone_number,
        prefEnableTh: parsedBody.data.pref_enable_th,
        prefEnableEn: parsedBody.data.pref_enable_en,
        prefEnableZh: parsedBody.data.pref_enable_zh,
        locationId: parsedBody.data.location_id ?? null,
        localizations
      });
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

      request.log.error({ error }, "update my profile failed");
      return reply.code(500).send({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "unexpected server error"
        }
      });
    }
  });

  app.post("/me/photo", async (request, reply) => {
    try {
      const session = requireAuth(app, request);
      const part = await request.file();
      if (!part) {
        return reply.code(400).send({
          error: {
            code: "VALIDATION_ERROR",
            message: "file is required"
          }
        });
      }

      if (!allowedMimeTypes.has(part.mimetype)) {
        return reply.code(400).send({
          error: {
            code: "VALIDATION_ERROR",
            message: "unsupported file type"
          }
        });
      }

      const buffer = await part.toBuffer();
      if (buffer.length === 0 || buffer.length > maxPhotoBytes) {
        return reply.code(400).send({
          error: {
            code: "VALIDATION_ERROR",
            message: "file size must be between 1 byte and 2 MB"
          }
        });
      }

      const payload = await meService.uploadMyPhoto(app.db, {
        storage: app.storage,
        userId: session.sub,
        mimeType: part.mimetype,
        buffer
      });
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

      request.log.error({ error }, "upload my photo failed");
      return reply.code(500).send({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "unexpected server error"
        }
      });
    }
  });

  app.delete("/me/photo", async (request, reply) => {
    try {
      const session = requireAuth(app, request);
      const payload = await meService.deleteMyPhoto(app.db, {
        storage: app.storage,
        userId: session.sub
      });
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

      request.log.error({ error }, "delete my photo failed");
      return reply.code(500).send({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "unexpected server error"
        }
      });
    }
  });
};

export default meRoutes;
