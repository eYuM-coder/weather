import { defineConfig } from "vite";
import path from "path";
import fs from "fs";
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  root: ".",
  mode: "production",

  build: {
    minify: "esbuild",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log"],
      },
      format: {
        comments: false,
      },
    },
    sourcemap: false,
    chunkSizeWarningLimit: 500,
  },

  server: {
    open: true,
    host: "0.0.0.0",
    port: 8080,
    hmr: { host: "we.eyum.dev" },
  },

  appType: "mpa",

  plugins: [
    tailwindcss(),
    {
      name: "enhanced-404-browser-console",

      configureServer(server) {
        const publicRoot = path.resolve(process.cwd(), "public");

        function isRealFile(filePath) {
          try {
            return fs.statSync(filePath).isFile();
          } catch {
            return false;
          }
        }

        /* ============================
           ⏰ /time endpoint
        ============================ */
        server.middlewares.use("/time", (req, res) => {
          const now = new Date();

          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              serverTime: now.toISOString(),
              timestamp: now.getTime(),
              offset: now.getTimezoneOffset(),
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            })
          );
        });

        /* ============================
           🔥 HARD BLOCK /src/*
           Prevents Vite from trying
           to treat it as modules
        ============================ */
        server.middlewares.use((req, res, next) => {
          if (req.url.startsWith("/src/")) {
            const notFound = path.join(publicRoot, "404.html");

            if (isRealFile(notFound)) {
              let html = fs.readFileSync(notFound, "utf8");

              html += `
                <script>
                  console.error("404: Blocked access to /src/* (${req.url})");
                </script>
              `;

              res.statusCode = 404;
              res.setHeader("Content-Type", "text/html");
              res.end(html);
              return;
            }

            res.statusCode = 404;
            res.end("404 Not Found");
            return;
          }

          next();
        });

        /* ============================
           🌐 MAIN ROUTER
        ============================ */
        server.middlewares.use(async (req, res, next) => {
          let url = req.url.split("?")[0];
          let clean = url.replace(/\/+$/, "");

          if (clean === "") clean = "/";

          // Allow root
          if (clean === "/") return next();

          // Allow real static assets EXCEPT /src
          if (
            (/\.[a-zA-Z0-9]+$/.test(clean) && !clean.startsWith("/src/")) ||
            isRealFile("./public" + clean)
          ) {
            return next();
          }

          const tests = [clean + ".html", clean + "/index.html"];

          for (const test of tests) {
            const filePath = path.resolve(publicRoot, "." + test);

            // 🔒 Prevent path traversal
            if (!filePath.startsWith(publicRoot)) continue;

            // ✅ ONLY real files, not directories
            if (isRealFile(filePath)) {
              const html = await server.transformIndexHtml(
                test,
                fs.readFileSync(filePath, "utf8")
              );

              res.setHeader("Content-Type", "text/html");
              res.end(html);
              return;
            }
          }

          /* ============================
             🚨 404 FALLBACK
          ============================ */
          const notFound = path.join(publicRoot, "404.html");

          console.warn(
            `⚠️ 404: User attempted to access non-existent route: ${clean}`
          );

          if (isRealFile(notFound)) {
            let html = fs.readFileSync(notFound, "utf8");

            html = html.replace(
              /{{route}}/g,
              clean.replace(/</g, "&lt;").replace(/>/g, "&gt;")
            );

            html += `
              <script>
                console.error("404 Error: ${clean}");
              </script>
            `;

            html = await server.transformIndexHtml("/404.html", html);

            res.statusCode = 404;
            res.setHeader("Content-Type", "text/html");
            res.end(html);
            return;
          }

          res.statusCode = 404;
          res.end("404 Not Found");
        });
      },
    },
  ],
});
