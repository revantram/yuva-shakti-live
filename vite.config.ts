import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'apk-headers',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && (req.url.includes('.apk') || req.url === '/YuvaShaktiGroup.apk')) {
            res.setHeader('Content-Type', 'application/vnd.android.package-archive');
            res.setHeader('Content-Disposition', 'attachment; filename="YuvaShaktiGroup.apk"');
          }
          next();
        });
      },
      configurePreviewServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && (req.url.includes('.apk') || req.url === '/YuvaShaktiGroup.apk')) {
            res.setHeader('Content-Type', 'application/vnd.android.package-archive');
            res.setHeader('Content-Disposition', 'attachment; filename="YuvaShaktiGroup.apk"');
          }
          next();
        });
      },
    },
    {
      name: 'github-pages-dual-support',
      enforce: 'pre',
      transformIndexHtml: {
        order: 'pre',
        handler(html) {
          html = html.replace(/<link\s+rel="stylesheet"[^>]*href="[^"]*index\.css"[^>]*>\s*/gi, '');
          html = html.replace(
            /<script\s+type="module"[^>]*src="[^"]*index\.js"[^>]*><\/script>/gi,
            '<script type="module" src="/src/main.tsx"></script>'
          );
          return html;
        },
      },
    },
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
});
