#!/bin/sh

# Debug output to check environment variables and configurations
echo "MAIN_HOST is set to: $MAIN_HOST"
echo "Checking if the Nginx config file has the correct substitution"
cat /etc/nginx/conf.d/default.conf

# Check if MAIN_HOST is set
if [ -z "$MAIN_HOST" ]; then
  echo "MAIN_HOST environment variable is not set. Exiting."
  exit 1
fi

# Replace the placeholder in the Nginx config with the MAIN_HOST value
echo "Replacing ${MAIN_HOST} in Nginx configuration..."
sed -i "s|\${MAIN_HOST}|$MAIN_HOST|g" /etc/nginx/conf.d/default.conf

echo "Testing Nginx configuration..."
nginx -t
if [ $? -ne 0 ]; then
  echo "Nginx configuration test failed. Exiting."
  exit 1
fi

# Show updated config (for debugging)
echo "Updated Nginx configuration:"
cat /etc/nginx/conf.d/default.conf

exec "$@"