FROM public.ecr.aws/lambda/nodejs:18-arm64

# Set working directory
WORKDIR ${LAMBDA_TASK_ROOT}

# Copy package files first for better Docker layer caching
COPY server/package*.json ./
COPY server/prisma/ ./prisma/

# Install dependencies and generate Prisma client
RUN npm install --only=production && \
    npx prisma generate && \
    npm cache clean --force

# Copy source code
COPY server/src/ ./src/
COPY server/lambda-handler.mjs ./

# Set environment variables for Lambda
ENV NODE_ENV=production
ENV NODE_OPTIONS="--enable-source-maps"

# Set the handler
CMD ["lambda-handler.handler"]
