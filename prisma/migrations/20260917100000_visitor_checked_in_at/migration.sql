-- AlterTable
ALTER TABLE `Visitors` ADD COLUMN `checkedInAt` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `Visitors_checkedInAt_idx` ON `Visitors`(`checkedInAt`);
