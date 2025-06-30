#!/bin/bash

# Create SSL directory if it doesn't exist
mkdir -p ssl

# Generate private key
openssl genrsa -out ssl/key.pem 2048

# Generate certificate signing request
openssl req -new -key ssl/key.pem -out ssl/cert.csr -subj "/C=US/ST=CA/L=San Francisco/O=Category.AI/OU=Development/CN=localhost"

# Generate self-signed certificate
openssl x509 -req -days 365 -in ssl/cert.csr -signkey ssl/key.pem -out ssl/cert.pem

# Set proper permissions
chmod 600 ssl/key.pem
chmod 644 ssl/cert.pem

# Clean up CSR file
rm ssl/cert.csr

echo "SSL certificates generated successfully!"
echo "Certificate: ssl/cert.pem"
echo "Private Key: ssl/key.pem"
echo ""
echo "Note: These are self-signed certificates for development only."
echo "Your browser will show a security warning that you can safely ignore for local development."