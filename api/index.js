// api/index.js
import serverless from "serverless-http";

async function loadApp() {
  try {
    // ưu tiên dùng bản đã build
    const mod = await import("../server/dist/app.js");
    return mod.default || mod.app || mod;
  } catch (e) {
    // fallback: dùng source nếu bạn push JS thuần
    const mod = await import("../server/src/app.js");
    return mod.default || mod.app || mod;
  }
}

let handlerPromise = null;

export default async function handler(req, res) {
  if (!handlerPromise) {
    const app = await loadApp();
    handlerPromise = serverless(app);
  }
  const h = await handlerPromise;
  return h(req, res);
}
