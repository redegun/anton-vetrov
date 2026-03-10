#!/bin/bash

# Cleanup script to remove example/test files from content queue

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
QUEUE_DIR="$PROJECT_DIR/content-queue"

echo "Cleaning up example/test files from content queue..."

# Remove example files
echo "Removing example blog posts..."
find "$QUEUE_DIR/blog" -name "EXAMPLE-*" -type f -delete 2>/dev/null || echo "No example blog posts found"

echo "Removing example service pages..."
find "$QUEUE_DIR/services" -name "EXAMPLE-*" -type f -delete 2>/dev/null || echo "No example service pages found"

echo "Removing example images..."
find "$QUEUE_DIR/images" -name "EXAMPLE-*" -type f -delete 2>/dev/null || echo "No example images found"

echo "✓ Cleanup completed!"
echo ""
echo "Content queue is now ready for production use."
echo ""
echo "To add content:"
echo "  1. Place .md files in content-queue/blog/"
echo "  2. Place .astro files in content-queue/services/"
echo "  3. Place images in content-queue/images/blog/"
echo ""
echo "To check status:"
echo "  ./scripts/publish-queue.sh --status"