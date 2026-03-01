/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "prisma"],
    outputFileTracingIncludes: {
      "/*": [
        "./node_modules/.prisma/master/**/*",
        "./node_modules/.prisma/tenant/**/*",
        "./node_modules/.prisma/client/**/*",
        "./node_modules/@prisma/**/*",
        "./prisma/schema.prisma",
        "./prisma/tenant/schema.prisma",
      ],
    },
  },
};

export default nextConfig;
