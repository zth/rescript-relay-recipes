-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Counter" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "label" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "userId" TEXT,
    CONSTRAINT "Counter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Counter" ("id", "label", "userId", "value") SELECT "id", "label", "userId", "value" FROM "Counter";
DROP TABLE "Counter";
ALTER TABLE "new_Counter" RENAME TO "Counter";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
