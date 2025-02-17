module.exports = {
  apps: [
    {
      name: "nextjs",
      script: "pnpm start:frontend",
      restart_delay: 1000,
    },
    {
      name: "booker",
      script: "pnpm start:booker",
      restart_delay: 1000,
    },
  ],
};
