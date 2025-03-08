module.exports = {
    apps: [
      {
        name: "FoodieBook backend",
        script: "./dist/src/server.js",
        env_production: {
          NODE_ENV: "production",
        },
      },
    ],
  };
  