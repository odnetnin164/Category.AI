#!/bin/bash

# Load environment variables
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Use SERVER_HOST from env or default to localhost
SERVER_HOST=${SERVER_HOST:-localhost}

echo "Generating SSL certificates for: $SERVER_HOST"

# Create SSL directory if it doesn't exist
mkdir -p ssl

# Generate private key
openssl genrsa -out ssl/key.pem 2048

# Generate certificate signing request with IP in both CN and SAN
openssl req -new -key ssl/key.pem -out ssl/cert.csr -subj "/C=US/ST=CA/L=San Francisco/O=Category.AI/OU=Development/CN=$SERVER_HOST" -addext "subjectAltName=IP:$SERVER_HOST,DNS:$SERVER_HOST,DNS:localhost"

# Generate self-signed certificate with SAN extension
openssl x509 -req -days 365 -in ssl/cert.csr -signkey ssl/key.pem -out ssl/cert.pem -extensions v3_req -extfile <(echo "[v3_req]"; echo "subjectAltName=IP:$SERVER_HOST,DNS:$SERVER_HOST,DNS:localhost")

# Set proper permissions
chmod 600 ssl/key.pem
chmod 644 ssl/cert.pem

# Clean up CSR file
rm ssl/cert.csr

echo "SSL certificates generated successfully for: $SERVER_HOST"
echo "Certificate: ssl/cert.pem"
echo "Private Key: ssl/key.pem"
echo ""
echo "Certificate includes Subject Alternative Names (SAN) for:"
echo "  - IP: $SERVER_HOST"
echo "  - DNS: $SERVER_HOST"
echo "  - DNS: localhost"
echo ""
echo "Note: These are self-signed certificates for development only."
echo "Your browser will show a security warning that you can safely ignore for local development."