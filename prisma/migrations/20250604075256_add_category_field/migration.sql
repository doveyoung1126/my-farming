-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RecordCategoryType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'expense'
);
INSERT INTO "new_RecordCategoryType" ("id", "name") SELECT "id", "name" FROM "RecordCategoryType";
DROP TABLE "RecordCategoryType";
ALTER TABLE "new_RecordCategoryType" RENAME TO "RecordCategoryType";
CREATE UNIQUE INDEX "RecordCategoryType_name_key" ON "RecordCategoryType"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
