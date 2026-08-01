-- AlterTable
ALTER TABLE "User" ADD COLUMN     "recommendationFocus" TEXT NOT NULL DEFAULT 'BALANCED',
ADD COLUMN     "sessionMinutes" INTEGER NOT NULL DEFAULT 45;

-- CreateTable
CREATE TABLE "TaskRecommendationState" (
    "userId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "snoozedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskRecommendationState_pkey" PRIMARY KEY ("userId","taskId")
);

-- CreateIndex
CREATE INDEX "TaskRecommendationState_userId_snoozedUntil_idx" ON "TaskRecommendationState"("userId", "snoozedUntil");

-- CreateIndex
CREATE INDEX "TaskRecommendationState_taskId_idx" ON "TaskRecommendationState"("taskId");

-- AddForeignKey
ALTER TABLE "TaskRecommendationState" ADD CONSTRAINT "TaskRecommendationState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskRecommendationState" ADD CONSTRAINT "TaskRecommendationState_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
