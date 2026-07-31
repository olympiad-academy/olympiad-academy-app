-- Domain-neutral infrastructure required to generate and validate Prisma Client
-- before product feature schematics add their own models and migrations.
CREATE TABLE "SystemMetadata" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemMetadata_pkey" PRIMARY KEY ("key")
);
