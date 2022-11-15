-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "refreshTokenKey" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
