import process from "node:process";
import { startLocalApiServer } from "../src/dev-runtime/server/local-api-server.mjs";

const host = process.env.GAMEFOUNDRY_LOCAL_API_HOST || "127.0.0.1";
const port = Number(process.env.GAMEFOUNDRY_LOCAL_API_PORT || 5501);

const localServer = await startLocalApiServer({ host, port });

console.log(`GameFoundry API-backed local server running at ${localServer.baseUrl}/login.html`);
console.log("Press Ctrl+C to stop.");

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, async () => {
    await localServer.close();
    process.exit(0);
  });
}
