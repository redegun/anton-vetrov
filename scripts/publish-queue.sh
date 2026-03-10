#!/bin/bash

# Content Publishing Queue Script for antonvetrov.ru
# Publishes one item per run from the content queue

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
QUEUE_DIR="$PROJECT_DIR/content-queue"
LOG_DIR="$PROJECT_DIR/logs"
LOG_FILE="$LOG_DIR/publish-queue.log"
MANIFEST_FILE="$QUEUE_DIR/manifest.json"

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

# Error logging
log_error() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $*" | tee -a "$LOG_FILE" >&2
}

# Show usage
usage() {
    cat << EOF
Usage: $0 [OPTION]

Options:
    --publish       Publish next item in queue (default)
    --dry-run       Show what would be published without doing it
    --status        Show queue status
    --help          Show this help message

Examples:
    $0                      # Publish next item
    $0 --dry-run           # Test run without publishing
    $0 --status            # Check queue status
EOF
}

# Check if queue directory exists
check_queue_dir() {
    if [[ ! -d "$QUEUE_DIR" ]]; then
        log_error "Queue directory not found: $QUEUE_DIR"
        exit 1
    fi
}

# Get next item to publish
get_next_item() {
    local manifest_item=""
    local auto_item=""
    
    # Check manifest first
    if [[ -f "$MANIFEST_FILE" ]]; then
        # Parse JSON manually for better compatibility
        if command -v jq >/dev/null 2>&1; then
            manifest_item=$(jq -r '.queue[0] // empty' "$MANIFEST_FILE" 2>/dev/null || echo "")
        else
            # Fallback: simple grep for first queue item (basic JSON parsing)
            manifest_item=$(grep -A 10 '"queue"' "$MANIFEST_FILE" | grep -A 5 '{' | head -20 | tr '\n' ' ' 2>/dev/null || echo "")
        fi
    fi
    
    # If no manifest or empty, use alphabetical order
    if [[ -z "$manifest_item" ]]; then
        # Find first file by alphabetical order in blog/ or services/
        auto_item=$(find "$QUEUE_DIR/blog" "$QUEUE_DIR/services" -type f \( -name "*.md" -o -name "*.astro" \) 2>/dev/null | sort | head -1 || echo "")
        if [[ -n "$auto_item" ]]; then
            local file_basename=$(basename "$auto_item")
            local dir_basename=$(basename "$(dirname "$auto_item")")
            echo "{\"type\":\"$dir_basename\",\"file\":\"$file_basename\"}"
        fi
    else
        echo "$manifest_item"
    fi
}

# Parse item JSON
parse_item() {
    local item="$1"
    if command -v jq >/dev/null 2>&1; then
        echo "$item" | jq -r "$2" 2>/dev/null || echo ""
    else
        # Simple fallback parsing
        case "$2" in
            ".type") echo "$item" | grep -o '"type":"[^"]*"' | cut -d'"' -f4 ;;
            ".file") echo "$item" | grep -o '"file":"[^"]*"' | cut -d'"' -f4 ;;
            ".heroImage") echo "$item" | grep -o '"heroImage":"[^"]*"' | cut -d'"' -f4 || echo "" ;;
            *) echo "" ;;
        esac
    fi
}

# Show queue status
show_status() {
    log "=== Queue Status ==="
    
    local blog_count=$(find "$QUEUE_DIR/blog" -name "*.md" 2>/dev/null | wc -l)
    local services_count=$(find "$QUEUE_DIR/services" -name "*.astro" 2>/dev/null | wc -l)
    local total_count=$((blog_count + services_count))
    
    log "Blog posts in queue: $blog_count"
    log "Service pages in queue: $services_count"
    log "Total items in queue: $total_count"
    
    if [[ -f "$MANIFEST_FILE" ]]; then
        log "Manifest file: EXISTS"
    else
        log "Manifest file: NOT FOUND (using alphabetical order)"
    fi
    
    local next_item=$(get_next_item)
    if [[ -n "$next_item" ]]; then
        local type=$(parse_item "$next_item" ".type")
        local file=$(parse_item "$next_item" ".file")
        log "Next item to publish: $type/$file"
    else
        log "Next item to publish: NONE (queue is empty)"
    fi
    
    log "=================="
}

# Validate file content
validate_content() {
    local type="$1"
    local file_path="$2"
    
    case "$type" in
        "blog")
            # Check markdown frontmatter
            if ! head -20 "$file_path" | grep -q "^---$"; then
                log_error "Blog post missing frontmatter: $file_path"
                return 1
            fi
            # Check required fields
            if ! grep -q "^title:" "$file_path" || ! grep -q "^description:" "$file_path" || ! grep -q "^pubDate:" "$file_path"; then
                log_error "Blog post missing required frontmatter fields: $file_path"
                return 1
            fi
            ;;
        "services")
            # Check astro file structure
            if ! grep -q "ServicePage" "$file_path"; then
                log_error "Service page doesn't use ServicePage layout: $file_path"
                return 1
            fi
            ;;
    esac
    return 0
}

# Publish item
publish_item() {
    local dry_run="$1"
    local item="$2"
    
    local type=$(parse_item "$item" ".type")
    local file=$(parse_item "$item" ".file")
    local hero_image=$(parse_item "$item" ".heroImage")
    
    if [[ -z "$type" || -z "$file" ]]; then
        log_error "Invalid item format: $item"
        return 1
    fi
    
    local source_path="$QUEUE_DIR/$type/$file"
    local target_dir=""
    local target_path=""
    
    # Determine target paths
    case "$type" in
        "blog")
            target_dir="$PROJECT_DIR/src/content/blog"
            target_path="$target_dir/$file"
            ;;
        "services")
            target_dir="$PROJECT_DIR/src/pages/services"
            target_path="$target_dir/$file"
            ;;
        *)
            log_error "Unknown content type: $type"
            return 1
            ;;
    esac
    
    # Check source file exists
    if [[ ! -f "$source_path" ]]; then
        log_error "Source file not found: $source_path"
        return 1
    fi
    
    # Validate content
    if ! validate_content "$type" "$source_path"; then
        return 1
    fi
    
    log "Publishing $type: $file"
    
    if [[ "$dry_run" == "true" ]]; then
        log "[DRY RUN] Would copy: $source_path -> $target_path"
        
        # Check for hero image from manifest
        if [[ -n "$hero_image" && "$hero_image" != "null" ]]; then
            local image_source="$QUEUE_DIR/images/blog/$hero_image"
            local image_target="$PROJECT_DIR/public/images/blog/$hero_image"
            if [[ -f "$image_source" ]]; then
                log "[DRY RUN] Would copy image: $image_source -> $image_target"
            else
                log "[DRY RUN] Warning: Hero image not found: $image_source"
            fi
        fi
        
        # Check for auto-detected hero images for blog posts
        if [[ "$type" == "blog" ]]; then
            local auto_hero=$(grep "^heroImage:" "$source_path" | cut -d'"' -f2 | sed 's|^/images/blog/||' || echo "")
            if [[ -n "$auto_hero" ]]; then
                local auto_image_source="$QUEUE_DIR/images/blog/$auto_hero"
                if [[ -f "$auto_image_source" ]]; then
                    local auto_image_target="$PROJECT_DIR/public/images/blog/$auto_hero"
                    log "[DRY RUN] Would copy auto-detected image: $auto_image_source -> $auto_image_target"
                fi
            fi
        fi
        
        log "[DRY RUN] Would remove from queue: $source_path"
        log "[DRY RUN] Would build and deploy site"
        return 0
    fi
    
    # Real publishing
    log "Copying file to target location..."
    cp "$source_path" "$target_path"
    
    # Handle hero image from manifest
    if [[ -n "$hero_image" && "$hero_image" != "null" ]]; then
        local image_source="$QUEUE_DIR/images/blog/$hero_image"
        local image_target="$PROJECT_DIR/public/images/blog/$hero_image"
        if [[ -f "$image_source" ]]; then
            log "Copying hero image: $hero_image"
            mkdir -p "$(dirname "$image_target")"
            cp "$image_source" "$image_target"
            rm "$image_source"
        fi
    fi
    
    # Handle auto-detected hero images for blog posts
    if [[ "$type" == "blog" ]]; then
        local auto_hero=$(grep "^heroImage:" "$source_path" | cut -d'"' -f2 | sed 's|^/images/blog/||' || echo "")
        if [[ -n "$auto_hero" ]]; then
            local auto_image_source="$QUEUE_DIR/images/blog/$auto_hero"
            if [[ -f "$auto_image_source" ]]; then
                local auto_image_target="$PROJECT_DIR/public/images/blog/$auto_hero"
                log "Copying auto-detected hero image: $auto_hero"
                mkdir -p "$(dirname "$auto_image_target")"
                cp "$auto_image_source" "$auto_image_target"
                rm "$auto_image_source"
            fi
        fi
    fi
    
    # Remove from queue
    log "Removing from queue: $source_path"
    rm "$source_path"
    
    # Update manifest if it exists
    if [[ -f "$MANIFEST_FILE" ]] && command -v jq >/dev/null 2>&1; then
        log "Updating manifest..."
        local temp_manifest=$(mktemp)
        jq '.queue |= .[1:]' "$MANIFEST_FILE" > "$temp_manifest"
        mv "$temp_manifest" "$MANIFEST_FILE"
    fi
    
    # Build and deploy
    log "Building site..."
    cd "$PROJECT_DIR"
    rm -rf dist
    npm run build
    
    if [[ $? -eq 0 ]]; then
        log "Build successful. Starting FTP deploy..."
        
        # Deploy using the process from DEPLOY.md
        log "Step 1: Mirror deploy..."
        lftp -u redegun_openclo,99smbHmB 185.114.245.107 -e "
mirror -R --delete --verbose=0 dist/ /antonvetrov/public_html/
quit"
        
        log "Step 2: Force HTML update..."
        find dist -name 'index.html' | while read f; do
            remote="/antonvetrov/public_html/${f#dist/}"
            echo "put -O $(dirname "$remote") $f"
        done | lftp -u redegun_openclo,99smbHmB 185.114.245.107
        
        log "Deploy completed successfully!"
        log "Published: $type/$file"
        
        # Git commit
        log "Committing changes to git..."
        git add .
        git commit -m "Auto-publish: $type/$file" || log "No changes to commit"
        git push origin main || log "Failed to push to git"
        
    else
        log_error "Build failed! Deploy aborted."
        return 1
    fi
    
    return 0
}

# Main function
main() {
    local action="publish"
    local dry_run="false"
    
    # Parse arguments
    case "${1:-}" in
        --dry-run)
            dry_run="true"
            ;;
        --status)
            action="status"
            ;;
        --publish|"")
            action="publish"
            ;;
        --help)
            usage
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
    
    check_queue_dir
    
    case "$action" in
        "status")
            show_status
            ;;
        "publish")
            log "=== Starting Content Publishing Queue ==="
            
            local next_item=$(get_next_item)
            if [[ -z "$next_item" ]]; then
                log "Queue is empty. Nothing to publish."
                exit 0
            fi
            
            if [[ "$dry_run" == "true" ]]; then
                log "=== DRY RUN MODE ==="
            fi
            
            if publish_item "$dry_run" "$next_item"; then
                if [[ "$dry_run" == "false" ]]; then
                    log "Publishing completed successfully!"
                else
                    log "Dry run completed successfully!"
                fi
            else
                log_error "Publishing failed!"
                exit 1
            fi
            ;;
    esac
}

# Run main function
main "$@"