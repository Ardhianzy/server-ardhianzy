-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "image" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ToT" (
    "id" SERIAL NOT NULL,
    "admin_id" INTEGER NOT NULL,
    "image" TEXT,
    "philosofer" TEXT NOT NULL,
    "geoorigin" TEXT NOT NULL,
    "detail_location" TEXT NOT NULL,
    "years" TEXT NOT NULL,

    CONSTRAINT "ToT_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ToT_meta" (
    "id" SERIAL NOT NULL,
    "ToT_id" INTEGER NOT NULL,
    "metafisika" TEXT NOT NULL,
    "epsimologi" TEXT NOT NULL,
    "aksiologi" TEXT NOT NULL,
    "conclusion" TEXT NOT NULL,

    CONSTRAINT "ToT_meta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reading_guidline" (
    "id" SERIAL NOT NULL,
    "ToT_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "detailed" TEXT NOT NULL,

    CONSTRAINT "Reading_guidline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collected_meditations" (
    "id" SERIAL NOT NULL,
    "admin_id" INTEGER NOT NULL,
    "image" TEXT,
    "dialog" TEXT NOT NULL,
    "judul" TEXT NOT NULL,

    CONSTRAINT "Collected_meditations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Research" (
    "id" SERIAL NOT NULL,
    "admin_id" INTEGER NOT NULL,
    "research_title" TEXT NOT NULL,
    "research_sum" TEXT NOT NULL,
    "researcher" TEXT NOT NULL,
    "research_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Research_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Articel" (
    "id" SERIAL NOT NULL,
    "admin_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Articel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shop" (
    "id" SERIAL NOT NULL,
    "admin_id" INTEGER NOT NULL,
    "stock" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "image" TEXT NOT NULL,

    CONSTRAINT "Shop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Glosarium" (
    "id" SERIAL NOT NULL,
    "admin_id" INTEGER NOT NULL,
    "term" TEXT NOT NULL,
    "definition" TEXT NOT NULL,

    CONSTRAINT "Glosarium_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- AddForeignKey
ALTER TABLE "ToT" ADD CONSTRAINT "ToT_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToT_meta" ADD CONSTRAINT "ToT_meta_ToT_id_fkey" FOREIGN KEY ("ToT_id") REFERENCES "ToT"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reading_guidline" ADD CONSTRAINT "Reading_guidline_ToT_id_fkey" FOREIGN KEY ("ToT_id") REFERENCES "ToT"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collected_meditations" ADD CONSTRAINT "Collected_meditations_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Research" ADD CONSTRAINT "Research_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Articel" ADD CONSTRAINT "Articel_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shop" ADD CONSTRAINT "Shop_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Glosarium" ADD CONSTRAINT "Glosarium_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
