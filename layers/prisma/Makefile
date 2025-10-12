# Build Makefile for PrismaLayer (Logical ID: PrismaLayer)
# SAM will call the target named build-<LogicalId>

build-PrismaLayer:
	@echo "==> Building Prisma Lambda Layer"
	# Prepare directories in artifacts dir
	mkdir -p $(ARTIFACTS_DIR)/nodejs
	# Copy layer sources explicitly (nodejs deps and prisma schema)
	cp -a nodejs/. $(ARTIFACTS_DIR)/nodejs/
	cp -a prisma $(ARTIFACTS_DIR)/
	# Install deps (need dev deps to run prisma CLI)
	cd $(ARTIFACTS_DIR)/nodejs && npm ci
	# Generate Prisma client using the layer's schema (downloads linux-arm64 libqueryengine)
	cd $(ARTIFACTS_DIR)/nodejs && npx prisma generate --schema=../prisma/schema.prisma
	# Remove devDependencies to keep the layer small (the generated client stays)
	cd $(ARTIFACTS_DIR)/nodejs && npm prune --omit=dev
	@echo "==> Prisma layer built at $(ARTIFACTS_DIR)"
