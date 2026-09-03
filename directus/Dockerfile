# Directus for Railway / Render / any Docker host.
#
# Deliberately just the official image at a pinned tag: it already ships the
# native modules (isolated-vm, sharp) prebuilt, so there is nothing to compile
# and no npm install step. Configuration comes from environment variables.
#
# This file exists because hosts like Railway build from a Dockerfile and IGNORE
# docker-compose.yml. Without it, a service pointed at the repo finds the root
# package.json and builds the storefront instead of the CMS.
#
# Pinned on purpose: `latest` would upgrade Directus on an unrelated redeploy
# and run migrations that cannot be rolled back.
FROM directus/directus:12.3.1

# The host supplies PORT; Directus binds it via the PORT env var.
EXPOSE 8055
