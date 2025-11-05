import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Configure dev-time proxy for the chat endpoint so frontend can call /api/chat
  // and Vite will forward requests to the configured function URL.
  const chatUrl = process.env.VITE_CHAT_FUNCTION_URL;
  const proxy: Record<string, any> = {};
  if (chatUrl) {
    try {
      const u = new URL(chatUrl);
      const target = u.origin; // protocol + host + port
      const pathname = u.pathname.replace(/\/$/, ''); // e.g. '/chat' or ''
      proxy['/api/chat'] = {
        target,
        changeOrigin: true,
        secure: false,
        // rewrite will map '/api/chat' -> pathname on the target (or '' to strip)
        rewrite: (p: string) => (pathname ? pathname : p.replace(/^\/api\/chat/, '')),
      };
    } catch (e) {
      // ignore invalid URL
      console.warn('Invalid VITE_CHAT_FUNCTION_URL, dev proxy not configured', e);
    }
  }

  return ({
    server: {
      host: "::",
      port: 8080,
      proxy,
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  });
});
