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
CREATE TABLE "tot" (
    "id" SERIAL NOT NULL,
    "admin_id" INTEGER NOT NULL,
    "image" TEXT,
    "philosofer" TEXT NOT NULL,
    "geoorigin" TEXT NOT NULL,
    "detail_location" TEXT NOT NULL,
    "years" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "keywords" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tot_meta" (
    "id" SERIAL NOT NULL,
    "ToT_id" INTEGER NOT NULL,
    "metafisika" TEXT NOT NULL,
    "epsimologi" TEXT NOT NULL,
    "aksiologi" TEXT NOT NULL,
    "conclusion" TEXT NOT NULL,

    CONSTRAINT "tot_meta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reading_guidline" (
    "id" SERIAL NOT NULL,
    "ToT_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "detailed" TEXT NOT NULL,

    CONSTRAINT "reading_guidline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collected_meditations" (
    "id" SERIAL NOT NULL,
    "admin_id" INTEGER NOT NULL,
    "image" TEXT,
    "dialog" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "slug" TEXT,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collected_meditations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "researches" (
    "id" SERIAL NOT NULL,
    "admin_id" INTEGER NOT NULL,
    "research_title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "research_sum" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "researcher" TEXT NOT NULL,
    "research_date" TIMESTAMP(3) NOT NULL,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "keywords" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "researches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "articles" (
    "id" SERIAL NOT NULL,
    "admin_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "keywords" TEXT,
    "excerpt" TEXT,
    "canonical_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "view_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shops" (
    "id" SERIAL NOT NULL,
    "admin_id" INTEGER NOT NULL,
    "stock" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "slug" TEXT,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "glosarium" (
    "id" SERIAL NOT NULL,
    "admin_id" INTEGER NOT NULL,
    "term" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "keywords" TEXT,
    "etymology" TEXT,
    "examples" TEXT,
    "related_terms" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "glosarium_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "tot_slug_key" ON "tot"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "collected_meditations_slug_key" ON "collected_meditations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "researches_slug_key" ON "researches"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "articles_slug_key" ON "articles"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "shops_slug_key" ON "shops"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "glosarium_slug_key" ON "glosarium"("slug");

-- AddForeignKey
ALTER TABLE "tot" ADD CONSTRAINT "tot_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tot_meta" ADD CONSTRAINT "tot_meta_ToT_id_fkey" FOREIGN KEY ("ToT_id") REFERENCES "tot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reading_guidline" ADD CONSTRAINT "reading_guidline_ToT_id_fkey" FOREIGN KEY ("ToT_id") REFERENCES "tot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collected_meditations" ADD CONSTRAINT "collected_meditations_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "researches" ADD CONSTRAINT "researches_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shops" ADD CONSTRAINT "shops_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "glosarium" ADD CONSTRAINT "glosarium_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
