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

# Bind all interfaces. docker-compose.yml sets this too, but hosts that build
# from this Dockerfile never read the compose file — and a server listening on
# 127.0.0.1 is unreachable from the platform's proxy, which shows up as
# "Application failed to respond" rather than as a crash.
ENV HOST=0.0.0.0

# PORT is supplied by the platform (Railway injects it) and Directus binds
# whatever PORT says. 8055 is only the fallback for hosts that supply nothing.
ENV PORT=8055
EXPOSE 8055
