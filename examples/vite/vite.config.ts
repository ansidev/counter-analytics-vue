import { defineConfig } from "vite";
import Vue from "@vitejs/plugin-vue";
import Markdown from "unplugin-vue-markdown/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Vue({
      include: [/\.vue$/, /\.md$/], // <--
    }),
    Markdown({}),
  ],
});
