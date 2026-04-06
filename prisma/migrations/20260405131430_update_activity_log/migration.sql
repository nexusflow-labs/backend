/*
  Warnings:

  - Added the required column `workspaceId` to the `ActivityLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ActivityLog"
ADD COLUMN "workspaceId" TEXT NOT NULL DEFAULT '3179fa4a-a8fd-4849-9b37-1ecc91c04894';

ALTER TABLE "ActivityLog"
ALTER COLUMN "workspaceId" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "ActivityLog_workspaceId_idx" ON "ActivityLog"("workspaceId");

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
