-- AlterTable
ALTER TABLE `users` ADD COLUMN `roles` ENUM('admin', 'user') NOT NULL DEFAULT 'user';
