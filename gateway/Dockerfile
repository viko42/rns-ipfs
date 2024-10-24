# Dockerfile for ENS/IPFS Gateway
# Utiliser une image de base Debian au lieu d'Alpine
FROM node:22-bullseye-slim

# Installer nginx et les paquets requis
RUN apt-get update -y && apt-get upgrade -y && apt-get install -y \
    nginx \
    supervisor \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Installer IPFS
RUN curl -sSL https://dist.ipfs.tech/kubo/v0.20.0/kubo_v0.20.0_linux-amd64.tar.gz | tar xzf - && \
    cd kubo && \
    ./install.sh && \
    cd .. && \
    rm -rf kubo && \
    ipfs init

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src/ ./src/
COPY nginx.conf /etc/nginx/nginx.conf
COPY supervisord.conf /etc/supervisord.conf

# Create required directories
RUN mkdir -p /var/cache/nginx/gateway_cache \
    && mkdir -p /var/log/nginx \
    && mkdir -p /data/ipfs \
    && chown -R www-data:www-data /var/log/nginx \
    && chmod 755 /var/log/nginx

# Set environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    IPFS_PATH=/data/ipfs

# Expose ports
EXPOSE 80 443 3000 4001 5001 8080

# Start services using supervisord
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
