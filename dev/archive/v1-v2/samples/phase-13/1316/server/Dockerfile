# Toolbox Aid
# David Quesenberry
# 04/06/2026
# Dockerfile
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production \
    NETWORK_SAMPLE_A_DASHBOARD_HOST=0.0.0.0 \
    NETWORK_SAMPLE_A_DASHBOARD_PORT=4310 \
    NETWORK_SAMPLE_A_DASHBOARD_REFRESH_MS=1000 \
    NETWORK_SAMPLE_A_ADMIN_KEY=sample-a-admin \
    NETWORK_SAMPLE_A_ALLOW_LOCALHOST_WITHOUT_KEY=0 \
    NETWORK_SAMPLE_A_ALLOW_REMOTE_WITH_KEY=1

COPY server/networkSampleADashboardServer.mjs ./server/networkSampleADashboardServer.mjs
COPY game/FakeLoopbackNetworkModel.js ./game/FakeLoopbackNetworkModel.js

EXPOSE 4310

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${NETWORK_SAMPLE_A_DASHBOARD_PORT}/admin/network-sample-a/health" || exit 1

CMD ["node", "server/networkSampleADashboardServer.mjs"]
