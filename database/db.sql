CREATE TABLE `admins` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(8) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `status` TINYINT(1) NOT NULL DEFAULT 1
);