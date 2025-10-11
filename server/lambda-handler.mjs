import serverless from "serverless-http";

let cachedHandler;
let secretsLoaded = false;

export const handler = async (event, context) => {
  // Avoid waiting for open handles (DB pools, etc.)
  context.callbackWaitsForEmptyEventLoop = false;

  // Load AWS secrets once on cold start
  if (!secretsLoaded) {
    try {
      const { loadAWSSecrets } = await import("./src/config/aws-secrets.js");
      await loadAWSSecrets();
      secretsLoaded = true;
    } catch (error) {
      console.error('Failed to load secrets:', error);
      throw error;
    }
  }

  if (!cachedHandler) {
    const mod = await import("./src/app-minimal.js");
    const app = mod.default || mod.app || mod;
    cachedHandler = serverless(app);
  }

  return cachedHandler(event, context);
};