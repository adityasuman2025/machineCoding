import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { reactScopedCssPlugin } from 'rollup-plugin-react-scoped-css';
import path from 'path';
import fs from 'fs';

function vanillaJsServePlugin(): Plugin {
    return {
        name: 'vanillajs-serve-plugin',
        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                if (req.url && req.url.startsWith('/vanillaJs')) {
                    let filePath = path.join(process.cwd(), req.url.split('?')[0]);
                    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
                        filePath = path.join(filePath, 'index.html');
                    }
                    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                        const ext = path.extname(filePath);
                        const mimeTypes: Record<string, string> = {
                            '.html': 'text/html',
                            '.js': 'application/javascript',
                            '.css': 'text/css',
                            '.json': 'application/json',
                            '.png': 'image/png',
                            '.jpg': 'image/jpeg',
                            '.svg': 'image/svg+xml',
                        };
                        res.setHeader('Content-Type', mimeTypes[ext] || 'text/plain');
                        return res.end(fs.readFileSync(filePath));
                    }
                }
                next();
            });
        },
    };
}

export default defineConfig({
    plugins: [
        vanillaJsServePlugin(),
        tailwindcss(),
        react(),
        reactScopedCssPlugin()
    ],
    base: "./",
});
