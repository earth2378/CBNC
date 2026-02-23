import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import * as schema from "../db/schema.js";
import { AppError } from "../lib/errors.js";
import { listUserSummaries, setUserActiveStatus } from "../repositories/users.repository.js";

type Db = NodePgDatabase<typeof schema>;

function toUserSummary(user: {
  id: string;
  email: string;
  role: "employee" | "admin";
  isActive: boolean;
  createdAt: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    is_active: user.isActive,
    created_at: user.createdAt.toISOString()
  };
}

export async function listUsers(db: Db) {
  const items = await listUserSummaries(db);
  return {
    items: items.map(toUserSummary)
  };
}

export async function updateUserActivation(db: Db, input: { actorUserId: string; userId: string; isActive: boolean }) {
  if (input.actorUserId === input.userId && input.isActive === false) {
    throw new AppError(400, "SELF_DEACTIVATION_NOT_ALLOWED", "admin cannot deactivate own account");
  }

  const updatedUser = await setUserActiveStatus(db, input.userId, input.isActive);

  if (!updatedUser) {
    throw new AppError(404, "NOT_FOUND", "user not found");
  }

  return toUserSummary(updatedUser);
}
