export default function vite404Middleware() {
  return {
    name: "custom-404",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url.includes(".")) {
          // Try to serve normal file
          return next();
        }

        // If Vite can't find the asset → use 404.html
        const notFoundHtml = server.config.root + "/404.html";
        server.sendFile(res, notFoundHtml);
      });
    },
  };
}
