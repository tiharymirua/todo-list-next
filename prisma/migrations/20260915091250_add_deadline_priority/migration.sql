-- AlterTable
ALTER TABLE "Todo" ADD COLUMN     "deadline" TIMESTAMP(3),
ADD COLUMN     "priority" TEXT NOT NULL DEFAULT 'normal';
