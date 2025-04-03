import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = resolve(__dirname, "src");
const MANIFEST = resolve(src, "manifest.json");
console.log("MANIFEST:", MANIFEST);
// C:\Users\Ben\Desktop\random-bookmark-v3\src\manifest.json src.
// this is correct ! but I still have an error message
// No file was found to copy on C:\Users\Ben\Desktop\random-bookmark-v3\src\manifest.json src.

export default defineConfig({
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
          dest: "." // Folder to place them in the dist folder
        }
      ]
    })
  ],
  build: {
    // outDir: "dist",
    // emptyOutDir: true,
    rollupOptions: {
      input: {
        main: "index.html",
        options: "./src/options.html",
        popup: resolve(src, "popup.html"),
        background: resolve(src, "background.ts")
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]"
      }
    }
  }
});
