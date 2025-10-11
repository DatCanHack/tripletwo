import serverless from "serverless-http";

let cachedHandler;

export const handler = async (event, context) => {
  // Avoid waiting for open handles (DB pools, etc.)
  context.callbackWaitsForEmptyEventLoop = false;

  if (!cachedHandler) {
    const mod = await import("../server/src/app.js");
    const app = mod.default || mod.app || mod;
    cachedHandler = serverless(app);
  }

  return cachedHandler(event, context);
};