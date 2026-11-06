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
      name: 'html-entry-and-webview-transform',
      enforce: 'pre',
      transformIndexHtml: {
        order: 'pre',
        handler(html) {
          return html.replace(
            /<script\s+(?:type="module"\s+)?(?:defer\s+)?(?:crossorigin\s+)?src="[^"]*index\.js"[^>]*><\/script>/gi,
            '<script type="module" src="/src/main.tsx"></script>'
          );
        },
      },
    },
    {
      name: 'html-post-transform-for-webview',
      apply: 'build',
      transformIndexHtml: {
        order: 'post',
        handler(html) {
          return html.replace(
            /<script\s+type="module"\s+(?:crossorigin\s+)?src="([^"]*assets\/index\.js)"\s*><\/script>/gi,
            '<script defer src="$1"></script>'
          );
        },
      },
    },
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        format: 'iife',
        name: 'YuvaShaktiApp',
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
        inlineDynamicImports: true,
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
});
