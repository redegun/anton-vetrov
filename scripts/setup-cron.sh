#!/bin/bash

# Setup cron job for automatic content publishing
# Runs daily at 09:00 UTC

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PUBLISH_SCRIPT="$SCRIPT_DIR/publish-queue.sh"

echo "Setting up cron job for antonvetrov.ru content publishing..."

# Check if publish script exists
if [[ ! -f "$PUBLISH_SCRIPT" ]]; then
    echo "ERROR: Publish script not found: $PUBLISH_SCRIPT"
    exit 1
fi

# Make sure publish script is executable
chmod +x "$PUBLISH_SCRIPT"

# Create cron entry
CRON_ENTRY="0 9 * * * cd $PROJECT_DIR && $PUBLISH_SCRIPT >> $PROJECT_DIR/logs/cron-publish.log 2>&1"

# Check if cron job already exists
if crontab -l 2>/dev/null | grep -F "$PUBLISH_SCRIPT" > /dev/null; then
    echo "Cron job already exists. Updating..."
    # Remove old entry and add new one
    (crontab -l 2>/dev/null | grep -v "$PUBLISH_SCRIPT"; echo "$CRON_ENTRY") | crontab -
else
    echo "Adding new cron job..."
    # Add new entry to existing crontab
    (crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -
fi

echo "✓ Cron job installed successfully!"
echo ""
echo "Schedule: Daily at 09:00 UTC"
echo "Script: $PUBLISH_SCRIPT"
echo "Logs: $PROJECT_DIR/logs/cron-publish.log"
echo ""
echo "To verify the installation:"
echo "  crontab -l | grep publish-queue"
echo ""
echo "To remove the cron job:"
echo "  crontab -l | grep -v publish-queue | crontab -"
echo ""
echo "To test the publishing script:"
echo "  $PUBLISH_SCRIPT --dry-run"
echo "  $PUBLISH_SCRIPT --status"