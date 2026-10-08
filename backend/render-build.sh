#!/usr/bin/env bash
# exit on error
set -o errexit

echo "=== Installing backend dependencies ==="
npm install

echo "=== Installing frontend dependencies ==="
cd ../frontend
npm install

echo "=== Building frontend application ==="
npm run build

echo "=== Build process completed successfully! ==="
