#!/usr/bin/env bash
# exit on error
set -o errexit

echo "=== Installing backend dependencies ==="
npm install

echo "=== Installing frontend dependencies (including devDependencies for build) ==="
cd ../frontend
npm install --include=dev

echo "=== Building frontend application ==="
npm run build

echo "=== Build process completed successfully! ==="
