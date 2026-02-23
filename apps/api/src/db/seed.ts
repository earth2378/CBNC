import "dotenv/config";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { hashPassword } from "../lib/auth/password.js";
import {
  profileLocalizations,
  profiles,
  systemSettings,
  users
} from "./schema.js";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required");
  }

  const pool = new Pool({ connectionString });
  const db = drizzle(pool);

  try {
    await db.insert(systemSettings).values({ id: 1 }).onConflictDoNothing();

    const adminPasswordHash = hashPassword("12345678");
    const userPasswordHash = hashPassword("12345678");

    const [admin] = await db
      .insert(users)
      .values({
        id: "11111111-1111-1111-1111-111111111111",
        email: "admin@cbnc.local",
        passwordHash: adminPasswordHash,
        role: "admin",
        isActive: true
      })
      .onConflictDoUpdate({
        target: users.email,
        set: {
          passwordHash: adminPasswordHash,
          role: "admin",
          isActive: true
        }
      })
      .returning({ id: users.id });

    const [employee] = await db
      .insert(users)
      .values({
        id: "22222222-2222-2222-2222-222222222222",
        email: "user@cbnc.local",
        passwordHash: userPasswordHash,
        role: "employee",
        isActive: true
      })
      .onConflictDoUpdate({
        target: users.email,
        set: {
          passwordHash: userPasswordHash,
          role: "employee",
          isActive: true
        }
      })
      .returning({ id: users.id });

    if (!admin?.id || !employee?.id) {
      throw new Error("Failed to seed users");
    }

    await db
      .insert(profiles)
      .values({
        userId: admin.id,
        publicId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        emailPublic: "admin@cbnc.local",
        phoneNumber: "-"
      })
      .onConflictDoUpdate({
        target: profiles.userId,
        set: {
          emailPublic: "admin@cbnc.local",
          phoneNumber: "-",
          prefEnableTh: true,
          prefEnableEn: true,
          prefEnableZh: true
        }
      });

    await db
      .insert(profiles)
      .values({
        userId: employee.id,
        publicId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        emailPublic: "user@cbnc.local",
        phoneNumber: "-"
      })
      .onConflictDoUpdate({
        target: profiles.userId,
        set: {
          emailPublic: "user@cbnc.local",
          phoneNumber: "-",
          prefEnableTh: true,
          prefEnableEn: true,
          prefEnableZh: true
        }
      });

    const localizationsSeed = [
      { userId: admin.id, lang: "th" as const, fullName: "Admin User TH", position: "Administrator", department: "IT", botLocation: "HQ" },
      { userId: admin.id, lang: "en" as const, fullName: "Admin User", position: "Administrator", department: "IT", botLocation: "HQ" },
      { userId: admin.id, lang: "zh" as const, fullName: "Admin User ZH", position: "Administrator", department: "IT", botLocation: "HQ" },
      { userId: employee.id, lang: "th" as const, fullName: "Sample User TH", position: "Employee", department: "Operation", botLocation: "HQ" },
      { userId: employee.id, lang: "en" as const, fullName: "Sample User", position: "Employee", department: "Operation", botLocation: "HQ" },
      { userId: employee.id, lang: "zh" as const, fullName: "Sample User ZH", position: "Employee", department: "Operation", botLocation: "HQ" }
    ];

    for (const row of localizationsSeed) {
      await db
        .insert(profileLocalizations)
        .values(row)
        .onConflictDoUpdate({
          target: [profileLocalizations.userId, profileLocalizations.lang],
          set: {
            fullName: row.fullName,
            position: row.position,
            department: row.department,
            botLocation: row.botLocation
          }
        });
    }

    console.log("Seed complete: admin@cbnc.local and user@cbnc.local (password: 12345678)");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
