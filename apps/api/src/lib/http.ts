import type { FastifyReply } from "fastify";

export function notImplemented(reply: FastifyReply, endpoint: string) {
  return reply.code(501).send({
    error: {
      code: "NOT_IMPLEMENTED",
      message: `${endpoint} is not implemented yet`
    }
  });
}
