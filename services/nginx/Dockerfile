FROM ubuntu:latest

# Install required packages
RUN apt-get update && apt-get install -y \
    openssl \
    nginx \
    apt-utils \
    autoconf \
    automake \
    build-essential \
    git \
    libcurl4-openssl-dev \
    libgeoip-dev \
    liblmdb-dev \
    libpcre3-dev \
    libxml2-dev \
    libyajl-dev \
    pkgconf \
    wget \
    zlib1g-dev \
    libtool \
    pkg-config \
    libpcre3-dev

# Create nginx user and group if they do not exist
RUN groupadd -r nginx && useradd -r -g nginx nginx

# Clone ModSecurity and build it
RUN git clone --depth 1 -b v3/master --single-branch https://github.com/SpiderLabs/ModSecurity && \
    cd ModSecurity && \
    git submodule init && \
    git submodule update && \
    ./build.sh && \
    ./configure && \
    make && \
    make install && \
    cd ..

# Clone ModSecurity-nginx module
RUN git clone https://github.com/SpiderLabs/ModSecurity-nginx.git

# Download Nginx and compile with ModSecurity-nginx
RUN wget http://nginx.org/download/nginx-1.24.0.tar.gz && \
    tar zxvf nginx-1.24.0.tar.gz && \
    cd nginx-1.24.0 && \
    ./configure --with-compat --add-dynamic-module=../ModSecurity-nginx && \
    make modules && \
    rm -rf /etc/nginx/modules && \
    mkdir -p /etc/nginx/modules && \
    cp objs/ngx_http_modsecurity_module.so /etc/nginx/modules/ && \
    cd ..

# Configure and enable ModSecurity
RUN mkdir /etc/nginx/modsec && \
    wget -P /etc/nginx/modsec/ https://raw.githubusercontent.com/SpiderLabs/ModSecurity/v3/master/modsecurity.conf-recommended && \
    mv /etc/nginx/modsec/modsecurity.conf-recommended /etc/nginx/modsec/modsecurity.conf && \
    cp ModSecurity/unicode.mapping /etc/nginx/modsec && \
    sed -i 's/SecRuleEngine DetectionOnly/SecRuleEngine On/' /etc/nginx/modsec/modsecurity.conf

# Copy Nginx configuration file
COPY ./conf/nginx.conf /etc/nginx/nginx.conf

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

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]