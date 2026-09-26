import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("Frontend Architecture Invariants", async (t) => {
  await t.test("All business features must have defined type contracts", () => {
    const featuresDir = path.resolve(process.cwd(), "src/features");
    const requiredFeatures = ["catalog", "cart", "checkout", "orders", "auth", "customer"];

    for (const feature of requiredFeatures) {
      const typesFile = path.join(featuresDir, feature, "types", "index.ts");
      assert.ok(
        fs.existsSync(typesFile),
        `Feature '${feature}' must have an explicit types/index.ts contract file.`
      );
    }
  });

  await t.test("UI primitives must not contain 'use client' unnecessarily", () => {
    const uiDir = path.resolve(process.cwd(), "src/components/ui");
    const files = fs.readdirSync(uiDir);

    for (const file of files) {
      if (file.endsWith(".tsx")) {
        const content = fs.readFileSync(path.join(uiDir, file), "utf-8");
        // Button, Badge, Card, Skeleton should be Server Components by default
        if (["badge.tsx", "card.tsx", "skeleton.tsx"].includes(file)) {
          assert.ok(
            !content.includes('"use client"') && !content.includes("'use client'"),
            `Primitive component '${file}' should be a Server Component and not declare 'use client'.`
          );
        }
      }
    }
  });

  await t.test("No client code should reference server-only environment variables", () => {
    const srcDir = path.resolve(process.cwd(), "src");

    function checkDirectory(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          checkDirectory(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
          if (entry.name.endsWith(".test.ts")) continue;
          const content = fs.readFileSync(fullPath, "utf-8");
          // Ensure process.env does not leak internal secrets like DB_PASSWORD or JWT_SECRET
          assert.ok(
            !content.includes("process.env.DB_PASSWORD"),
            `File '${fullPath}' references forbidden process.env.DB_PASSWORD.`
          );
          assert.ok(
            !content.includes("process.env.JWT_SECRET"),
            `File '${fullPath}' references forbidden process.env.JWT_SECRET.`
          );
        }
      }
    }

    checkDirectory(srcDir);
  });
});
