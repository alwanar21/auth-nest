/*
  Warnings:

  - The primary key for the `sessions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ipAddress` on the `sessions` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `sessions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `sessions` DROP PRIMARY KEY,
    DROP COLUMN `ipAddress`,
    DROP COLUMN `userAgent`,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);
