-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Plot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "area" REAL NOT NULL,
    "crop" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Plot" ("area", "crop", "id", "name") SELECT "area", "crop", "id", "name" FROM "Plot";
DROP TABLE "Plot";
ALTER TABLE "new_Plot" RENAME TO "Plot";
CREATE UNIQUE INDEX "Plot_name_key" ON "Plot"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
