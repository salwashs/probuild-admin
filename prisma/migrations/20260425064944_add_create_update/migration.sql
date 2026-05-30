-- CreateTable (Roles harus dibuat duluan sebelum Users di-alter karena FK)
CREATE TABLE `Roles` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Histories` (
    `id` VARCHAR(191) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Insert default role agar existing Users bisa di-assign
INSERT INTO `Roles` (`id`, `name`, `description`, `updatedAt`) VALUES ('default-role-id', 'admin', 'Default admin role', NOW(3));

-- AlterTable BoothTypes: pakai default sementara untuk updatedAt agar row existing tidak error
ALTER TABLE `BoothTypes` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
-- Drop default karena Prisma yang handle updatedAt di application level
ALTER TABLE `BoothTypes` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable Booths
ALTER TABLE `Booths` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
ALTER TABLE `Booths` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AlterTable Users: tambah roleId dengan default ke role yang baru di-insert
ALTER TABLE `Users` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `roleId` VARCHAR(255) NOT NULL DEFAULT 'default-role-id',
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
ALTER TABLE `Users` ALTER COLUMN `roleId` DROP DEFAULT,
    ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AddForeignKey
ALTER TABLE `Users` ADD CONSTRAINT `Users_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
