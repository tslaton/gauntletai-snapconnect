#!/usr/bin/env bash
# rename_migration.sh
# Usage: ./rename_migration.sh path/to/file.sql
# Description: Renames a migration file to include a timestamp and a clean name.

set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <filename.sql>" >&2
  exit 1
fi

file="$1"

if [[ ! -f "$file" ]]; then
  echo "Error: '$file' does not exist." >&2
  exit 1
fi

# Enable extended globs for prefix-stripping
shopt -s extglob

dir="$(dirname "$file")"
base="$(basename "$file")"

# Remove any leading timestamp and underscore that might already be there
clean="${base##+([0-9])_}"

# Current local time in Supabase’s 14-digit format
timestamp="$(date +"%Y%m%d%H%M%S")"

new_path="${dir}/${timestamp}_${clean}"

if [[ -e "$new_path" ]]; then
  echo "Error: target file '$new_path' already exists." >&2
  exit 1
fi

mv "$file" "$new_path"
echo "Renamed → $new_path"