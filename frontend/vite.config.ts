import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    tailwindcss(),
    devtools({
      enhancedLogs: {
        enabled: true,
      },
      removeDevtoolsOnBuild: true,
      logging: true,
    }),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
});
