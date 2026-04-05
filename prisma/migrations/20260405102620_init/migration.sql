-- CreateTable
CREATE TABLE `Users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NULL,
    `password` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `email`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Visitors` (
    `id` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(255) NOT NULL,
    `company` VARCHAR(255) NOT NULL,
    `position` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BoothTypes` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `size` INTEGER NOT NULL,
    `price` DOUBLE NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Booths` (
    `id` VARCHAR(191) NOT NULL,
    `number` INTEGER NOT NULL,
    `boothTypeId` VARCHAR(255) NOT NULL,
    `isBooked` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Exhibitors` (
    `id` VARCHAR(191) NOT NULL,
    `companyName` VARCHAR(255) NOT NULL,
    `picName` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(255) NOT NULL,
    `notes` VARCHAR(255) NULL,
    `productType` VARCHAR(255) NOT NULL,
    `boothTypeId` VARCHAR(255) NOT NULL,
    `boothId` VARCHAR(255) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Booths` ADD CONSTRAINT `Booths_boothTypeId_fkey` FOREIGN KEY (`boothTypeId`) REFERENCES `BoothTypes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Exhibitors` ADD CONSTRAINT `Exhibitors_boothTypeId_fkey` FOREIGN KEY (`boothTypeId`) REFERENCES `BoothTypes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Exhibitors` ADD CONSTRAINT `Exhibitors_boothId_fkey` FOREIGN KEY (`boothId`) REFERENCES `Booths`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
