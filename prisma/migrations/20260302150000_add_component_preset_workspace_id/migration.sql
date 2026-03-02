-- AlterTable: add workspaceId to ComponentPreset (multi-tenancy contract)
ALTER TABLE "ComponentPreset" ADD COLUMN "workspaceId" TEXT NOT NULL DEFAULT '';

-- Update existing rows (none in prod, but safe for any seed data)
UPDATE "ComponentPreset" p
SET "workspaceId" = c."workspaceId"
FROM "ComponentConfig" c
WHERE p."componentConfigId" = c.id;

-- Remove the temporary default now that existing rows are populated
ALTER TABLE "ComponentPreset" ALTER COLUMN "workspaceId" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "ComponentPreset" ADD CONSTRAINT "ComponentPreset_workspaceId_fkey"
  FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
