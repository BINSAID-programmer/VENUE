# VENUE — container image for Google Cloud Run
FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production

# Install all dependencies (build tools included), build, then drop dev dependencies
COPY package.json ./
RUN npm install --include=dev --no-audit --no-fund
COPY . .
RUN npm run build && npm prune --omit=dev

# Cloud Run sends traffic to $PORT (8080 by default); server.ts reads it
EXPOSE 8080
CMD ["node", "dist/server.cjs"]
