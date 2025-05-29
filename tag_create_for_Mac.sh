#!/bin/bash

# Navigate to the Git repository's root directory
# (This script should work regardless of where it's placed within the repo)
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
if [ -z "$REPO_ROOT" ]; then
    echo ""
    echo "ERROR: Not a Git repository."
    echo ""
    exit 1
fi
cd "$REPO_ROOT" || { echo "ERROR: Could not change to repository root."; exit 1; }

# Get current date and time in YYYYMMDD-HHMMSS format
# Using `date` command
TAG_NAME=$(date +"%Y%m%d-%H%M%S")

echo ""
echo "==========================================="
echo "Creating Git Tag"
echo "==========================================="
echo ""
echo "Tag name to be created: $TAG_NAME"
echo ""

# Create an annotated tag
git tag -a "$TAG_NAME" -m "Release $TAG_NAME"

if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: Failed to create tag."
    echo "Please check if a tag with the same name already exists."
    echo ""
    exit 1
fi

echo ""
echo "Tag created successfully. Local tags list:"
git tag -n1
echo ""

# Confirm push to remote repository
read -p "Do you want to push this tag to the remote repository? (y/n): " PUSH_TO_REMOTE

if [[ "$PUSH_TO_REMOTE" == "y" || "$PUSH_TO_REMOTE" == "Y" ]]; then
    echo ""
    echo "Pushing to remote repository..."
    git push origin "$TAG_NAME"
    if [ $? -ne 0 ]; then
        echo ""
        echo "ERROR: Failed to push to remote."
        echo ""
        exit 1
    fi
    echo ""
    echo "Tag successfully pushed to the remote repository."
else
    echo ""
    echo "Tag was not pushed. You can push it manually if needed."
fi

echo ""
echo "Operation complete."
echo ""