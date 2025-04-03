import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: "public/manifest.json",
          dest: "." // Root of the dist folder
        },
        {
          src: "public/assets/*",
          dest: "assets" // Folder to place them in the dist folder
        }
      ]
    })
  ],
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        options: "options.html",
        background: "background.ts",
        bookmarks: "bookmarks.ts"
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]"
      }
    }
  }
});
