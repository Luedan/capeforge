-- null significa que el motor inteligente analiza el catálogo global.
ALTER TABLE "User" ADD COLUMN "recommendationCapeId" TEXT;

CREATE INDEX "User_recommendationCapeId_idx" ON "User"("recommendationCapeId");

ALTER TABLE "User"
ADD CONSTRAINT "User_recommendationCapeId_fkey"
FOREIGN KEY ("recommendationCapeId") REFERENCES "Cape"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
