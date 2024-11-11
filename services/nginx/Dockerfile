# Dockerfile.nginx
FROM nginx:latest

# Install OpenSSL
RUN apt-get update && apt-get install -y openssl

# Copy Nginx configuration file
COPY ./conf/nginx.conf /etc/nginx/conf.d/default.conf

# Create directories for SSL certificates
RUN mkdir -p /etc/nginx/ssl

# Generate self-signed SSL certificates
RUN openssl req -newkey rsa:4096 -x509 -sha256 -days 365 -nodes \
    -out /etc/nginx/ssl/hcorrea-.crt \
    -keyout /etc/nginx/ssl/hcorrea-.key \
    -subj "/C=PT/ST=Lisbon/L=Lisbon/O=42 School/OU=hcorrea-/CN=hcorrea-/"

# Expose ports
EXPOSE 443
EXPOSE 80