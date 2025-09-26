/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações para deploy na Vercel
  output: 'standalone',
  
  // The `serverExternalPackages` option allows you to opt-out of bundling dependencies in your Server Components.
  serverExternalPackages: ["@sparticuz/chromium-min", "puppeteer-core"],
  
  // Otimizações de performance
  compress: true,
  
  // Configurações de imagens
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  
  // Headers de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Configurações de experimental (se necessário)
  experimental: {
    // Otimizações para Turbopack
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // Configurações de webpack (se necessário)
  webpack: (config, { isServer }) => {
    // Otimizações para cliente
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
  
  // Configurações de redirect (se necessário)
  async redirects() {
    return [
      // Exemplo de redirect
      // {
      //   source: '/old-page',
      //   destination: '/new-page',
      //   permanent: true,
      // },
    ];
  },
  
  // Configurações de rewrites (se necessário)
  async rewrites() {
    return [
      // Exemplo de rewrite
      // {
      //   source: '/api/:path*',
      //   destination: '/api/:path*',
      // },
    ];
  },
  
  // Configurações de environment
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Configurações de trailing slash
  trailingSlash: false,
  
  // Configurações de powered by header
  poweredByHeader: false,
  
  // Configurações de strict mode
  reactStrictMode: true,
  
  // Configurações de swc minify
  swcMinify: true,
};

module.exports = nextConfig;
