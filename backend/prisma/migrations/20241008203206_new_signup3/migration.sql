/*
  Warnings:

  - You are about to drop the column `password` on the `Users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "auth"."Users" DROP COLUMN "password";
