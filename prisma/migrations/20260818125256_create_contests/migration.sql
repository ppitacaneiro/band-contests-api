-- CreateEnum
CREATE TYPE "ContestStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'OPEN', 'VOTING', 'CLOSED', 'FINISHED');

-- CreateEnum
CREATE TYPE "ContestVotingMode" AS ENUM ('JURY', 'PUBLIC', 'MIXED');

-- CreateTable
CREATE TABLE "Contest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "posterUrl" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "registrationDeadline" TIMESTAMP(3),
    "rules" TEXT,
    "status" "ContestStatus" NOT NULL DEFAULT 'DRAFT',
    "votingMode" "ContestVotingMode" NOT NULL DEFAULT 'JURY',
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Contest_organizationId_idx" ON "Contest"("organizationId");

-- AddForeignKey
ALTER TABLE "Contest" ADD CONSTRAINT "Contest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
