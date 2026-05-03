import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  productionBrowserSourceMaps: false,
  webpack: (config, { isServer }) => {
    config.externals.push(
      "pino-pretty",
      "lokijs",
      "encoding",
      "@react-native-async-storage/async-storage"
    );

    // Disable terser webpack plugin (use SWC instead)
    config.optimization.minimize = true;
    config.optimization.minimizer = config.optimization.minimizer.filter(
      (plugin: { constructor: { name: string } }) =>
        plugin.constructor.name !== "TerserPlugin"
    );

    return config;
  },
};

export default nextConfig;
