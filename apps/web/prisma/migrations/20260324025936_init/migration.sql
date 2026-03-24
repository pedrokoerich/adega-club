-- CreateEnum
CREATE TYPE "WineType" AS ENUM ('TINTO', 'BRANCO', 'ROSE', 'ESPUMANTE', 'SOBREMESA');

-- CreateEnum
CREATE TYPE "RoundStatus" AS ENUM ('OPEN', 'FUNDED', 'CANCELLED', 'DELIVERED');

-- CreateEnum
CREATE TYPE "PledgeStatus" AS ENUM ('PENDING', 'CAPTURED', 'REFUNDED');

-- CreateTable
CREATE TABLE "wines" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "producer" TEXT,
    "country" TEXT,
    "region" TEXT,
    "grapes" TEXT[],
    "vintage" INTEGER,
    "type" "WineType" NOT NULL DEFAULT 'TINTO',
    "vivino_id" TEXT,
    "avg_rating" DOUBLE PRECISION,
    "slug" TEXT NOT NULL,
    "image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_snapshots" (
    "id" UUID NOT NULL,
    "wine_id" UUID NOT NULL,
    "store" TEXT NOT NULL,
    "price_brl" DECIMAL(10,2) NOT NULL,
    "url" TEXT,
    "in_stock" BOOLEAN NOT NULL DEFAULT true,
    "scraped_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_alerts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "wine_id" UUID NOT NULL,
    "target_price" DECIMAL(10,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_notified" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collective_rounds" (
    "id" UUID NOT NULL,
    "wine_id" UUID NOT NULL,
    "target_price" DECIMAL(10,2) NOT NULL,
    "min_qty" INTEGER NOT NULL,
    "current_qty" INTEGER NOT NULL DEFAULT 0,
    "status" "RoundStatus" NOT NULL DEFAULT 'OPEN',
    "deadline" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collective_rounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pledges" (
    "id" UUID NOT NULL,
    "round_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "qty" INTEGER NOT NULL DEFAULT 1,
    "stripe_pi_id" TEXT,
    "status" "PledgeStatus" NOT NULL DEFAULT 'PENDING',
    "pledged_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pledges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wines_slug_key" ON "wines"("slug");

-- CreateIndex
CREATE INDEX "price_snapshots_wine_id_scraped_at_idx" ON "price_snapshots"("wine_id", "scraped_at");

-- CreateIndex
CREATE INDEX "price_snapshots_store_scraped_at_idx" ON "price_snapshots"("store", "scraped_at");

-- CreateIndex
CREATE UNIQUE INDEX "price_alerts_user_id_wine_id_key" ON "price_alerts"("user_id", "wine_id");

-- AddForeignKey
ALTER TABLE "price_snapshots" ADD CONSTRAINT "price_snapshots_wine_id_fkey" FOREIGN KEY ("wine_id") REFERENCES "wines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_alerts" ADD CONSTRAINT "price_alerts_wine_id_fkey" FOREIGN KEY ("wine_id") REFERENCES "wines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collective_rounds" ADD CONSTRAINT "collective_rounds_wine_id_fkey" FOREIGN KEY ("wine_id") REFERENCES "wines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pledges" ADD CONSTRAINT "pledges_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "collective_rounds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
