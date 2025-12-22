import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import createNextIntlPlugin from 'next-intl/plugin';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from a .env.local and set them manually
try {
  const envPath = resolve(__dirname, "../../.env.local");
  const envFile = readFileSync(envPath, "utf-8");
  const envLines = envFile.split("\n");
  
  for (const line of envLines) {
    const trimmed = line.trim();
    
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      if (key && valueParts.length > 0) {
        let value = valueParts.join("=");

        const commentIndex = value.indexOf("#");
        if (commentIndex !== -1) {
          value = value.substring(0, commentIndex).trim();
        }

        process.env[key] = value;
      }
    }
  }
} catch (err) {
  console.warn(".env.local file not found or could not be read.", err.message);
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@gladia-app/ui", "@gladia-app/auth", "@gladia-app/db", "@gladia-app/validation"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: https://accounts.google.com https://apis.google.com",
              "style-src 'self' 'unsafe-inline' https://accounts.google.com",
              "img-src 'self' data: blob: https://*.googleusercontent.com https://accounts.google.com",
              "connect-src 'self' https://accounts.google.com https://play.google.com https://apis.google.com",
              "frame-src 'self' https://accounts.google.com",
              "font-src 'self' data:",
              "worker-src 'self' blob:",
            ].join("; "),
          }
        ]
      }
    ]
  }
}

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
