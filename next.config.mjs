/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  async rewrites() {
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: "/devapi/:path*",
          // destination: `${process.env.NEXT_PUBLIC_BASE_URL}/dev/:path*/`,
          destination: `http://localhost:3456/devapi/:path*`,
        },
      ];
    } else {
      return [];
    }
  },
  trailingSlash: false,

  images: {},

  webpack: (config, { isServer }) => {
    // let found = config.module.rules.filter(ru => {
    //   if (ru.use.some(u => u.includes('post'))) {
    //     return true
    //   }
    //   return false
    // })

    // console.log(found)

    // config.module.rules.push({
    //   test: /\.css$/i,
    //   use: ["style-loader", "css-loader", "postcss-loader"],
    // })

    // console.log(config.module.rules)

    config.module.rules = config.module.rules.filter((rule) => {
      return rule.loader !== "next-image-loader";
    });

    // config.module.rules.push({
    //   test: /\.(png|jpg|jpeg|gif|webp|avif|ico|bmp|svg)$/i,
    //   exclude: /node_modules/,
    //   use: [
    //     {
    //       //${config.assetPrefix}
    //       loader: 'file-loader',
    //       options: {
    //         limit: 0, /// config.inlineImageLimit,
    //         fallback: 'file-loader',
    //         publicPath: `/_next/static/images/`,
    //         outputPath: `${isServer ? '../' : ''}static/images/`,
    //         name: '[name]-[hash].[ext]',
    //         esModule: config.esModule || false,
    //       },
    //     },
    //   ],
    // })

    config.module.rules.push({
      test: /\.(glb|gltf|hdr|exr|fbx|ttf|png|jpg|jpeg|gif|webp|avif|ico|bmp|svg|mov|mp4|task|wasm|webm)$/,
      exclude: /node_modules/,
      use: [
        {
          //${config.assetPrefix}
          loader: "file-loader",
          options: {
            limit: 0, /// config.inlineImageLimit,
            fallback: "file-loader",
            publicPath: `/_next/static/images/`,
            outputPath: `${isServer ? "../" : ""}static/images/`,
            name: "[name]-[hash].[ext]",
            esModule: config.esModule || false,
          },
        },
      ],
    });

    // shader support
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      exclude: /node_modules/,
      use: ["raw-loader", "glslify-loader"],
    });

    config.experiments = config.experiments || {};
    config.experiments.topLevelAwait = true;
    // config.experiments.outputModule = true;

    config.output.environment = config.output.environment || {};
    config.output.environment.asyncFunction = true;
    return config;
  },

  //
};

export default nextConfig;
