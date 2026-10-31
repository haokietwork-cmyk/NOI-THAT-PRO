/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.vietqr.io",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "awpzkxurcqyzdedipymx.supabase.co",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self';",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval';",
              "style-src 'self' 'unsafe-inline';",
              "img-src 'self' data: blob: https://img.vietqr.io https://*.supabase.co;",
              "font-src 'self' data:;",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://img.vietqr.io;",
              "frame-ancestors 'self';",
            ].join(" "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
