import { defineConfig } from "vite";
import { createHtmlPlugin } from "vite-plugin-html";

export default defineConfig({
  build: {
    outDir: "./dist",
  },
  plugins: [
    createHtmlPlugin({
      inject: {
        data: {
          title: "Rescript Relay Auth Recipes",
        },
      },
    }),
  ],
});
