-- AlterTable
ALTER TABLE `Visitors` ADD COLUMN `deviceId` VARCHAR(64) NULL;

-- CreateIndex
CREATE INDEX `Visitors_deviceId_idx` ON `Visitors`(`deviceId`);

-- CreateIndex
CREATE UNIQUE INDEX `Visitors_eventId_deviceId_key` ON `Visitors`(`eventId`, `deviceId`);
