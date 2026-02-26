import "dotenv/config";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { hashPassword } from "../lib/auth/password.js";
import {
  locations,
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

  const HQ_LOCATION_ID = "cccccccc-cccc-cccc-cccc-cccccccccccc";

  try {
    await db.insert(systemSettings).values({ id: 1 }).onConflictDoNothing();

    const locationsSeed = [
      {
        id: HQ_LOCATION_ID,
        code: "BOT_HQ",
        nameTh: "สำนักงานใหญ่",
        nameEn: "Head Office",
        nameZh: "总部",
        addressTh: "273 ถนนสามเสน แขวงวัดสามพระยา เขตพระนคร กรุงเทพมหานคร 10200",
        addressEn: "273 Samsen Road, Wat Sam Phraya Sub-District, Phra Nakhon District, Bangkok 10200",
        addressZh: "273 三森路，瓦三帕亚区，帕纳空区，曼谷 10200",
        sortOrder: 0
      },
      {
        id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
        code: "BOT_NORTH",
        nameTh: "สำนักงานภาคเหนือ",
        nameEn: "Northern Office",
        nameZh: "北部办事处",
        addressTh: "382 ถนนวิชยานนท์ ตำบลช้างม่อย อำเภอเมืองเชียงใหม่ จังหวัดเชียงใหม่ 50300",
        addressEn: "382 Wichayanon Road, Chang Moi Sub-District, Mueang Chiang Mai District, Chiang Mai 50300",
        addressZh: "382 维查亚侬路，昌莫伊区，清迈府清迈市 50300",
        sortOrder: 1
      },
      {
        id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
        code: "BOT_NORTHEAST",
        nameTh: "สำนักงานภาคตะวันออกเฉียงเหนือ",
        nameEn: "Northeastern Office",
        nameZh: "东北部办事处",
        addressTh: "ถนนเพียงเมือง ตำบลในเมือง อำเภอเมืองขอนแก่น จังหวัดขอนแก่น 40000",
        addressEn: "Phiang Mueang Road, Nai Mueang Sub-District, Mueang Khon Kaen District, Khon Kaen 40000",
        addressZh: "批昂勐路，内勐区，孔敬府孔敬市 40000",
        sortOrder: 2
      },
      {
        id: "ffffffff-ffff-ffff-ffff-ffffffffffff",
        code: "BOT_SOUTH",
        nameTh: "สำนักงานภาคใต้",
        nameEn: "Southern Office",
        nameZh: "南部办事处",
        addressTh: "ถนนภูผาภักดี ตำบลหาดใหญ่ อำเภอหาดใหญ่ จังหวัดสงขลา 90110",
        addressEn: "Phupha Phakdi Road, Hat Yai Sub-District, Hat Yai District, Songkhla 90110",
        addressZh: "普帕帕克迪路，合艾区，宋卡府合艾市 90110",
        sortOrder: 3
      }
    ];

    for (const row of locationsSeed) {
      await db.insert(locations).values(row).onConflictDoNothing();
    }

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
        phoneNumber: "-",
        locationId: HQ_LOCATION_ID
      })
      .onConflictDoUpdate({
        target: profiles.userId,
        set: {
          emailPublic: "admin@cbnc.local",
          phoneNumber: "-",
          prefEnableTh: true,
          prefEnableEn: true,
          prefEnableZh: true,
          locationId: HQ_LOCATION_ID
        }
      });

    await db
      .insert(profiles)
      .values({
        userId: employee.id,
        publicId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        emailPublic: "user@cbnc.local",
        phoneNumber: "-",
        locationId: HQ_LOCATION_ID
      })
      .onConflictDoUpdate({
        target: profiles.userId,
        set: {
          emailPublic: "user@cbnc.local",
          phoneNumber: "-",
          prefEnableTh: true,
          prefEnableEn: true,
          prefEnableZh: true,
          locationId: HQ_LOCATION_ID
        }
      });

    const localizationsSeed = [
      { userId: admin.id, lang: "th" as const, fullName: "Admin User TH", position: "Administrator", department: "IT" },
      { userId: admin.id, lang: "en" as const, fullName: "Admin User", position: "Administrator", department: "IT" },
      { userId: admin.id, lang: "zh" as const, fullName: "Admin User ZH", position: "Administrator", department: "IT" },
      { userId: employee.id, lang: "th" as const, fullName: "Sample User TH", position: "Employee", department: "Operation" },
      { userId: employee.id, lang: "en" as const, fullName: "Sample User", position: "Employee", department: "Operation" },
      { userId: employee.id, lang: "zh" as const, fullName: "Sample User ZH", position: "Employee", department: "Operation" }
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
            department: row.department
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
