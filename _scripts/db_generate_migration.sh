#!/bin/bash
# This script automates the process of moving and renaming a Drizzle-generated migration
# to a format compatible with Supabase's migration system.
# It MUST be run from the project root directory.

set -e # Exit immediately if a command exits with a non-zero status.

# --- Configuration ---
# These paths are relative to the project root.
SERVER_DIR="server"
DRIZZLE_MIGRATIONS_DIR="server/drizzle/migrations"
SUPABASE_MIGRATIONS_DIR="server/supabase/migrations"
# --- End Configuration ---

# Check if we're in the project root by looking for the server directory.
if [ ! -d "${SERVER_DIR}" ]; then
    echo "Error: This script must be run from the project root directory (the one containing '${SERVER_DIR}/')."
    exit 1
fi

# 1. Find the latest Drizzle migration file.
latest_migration_file=$(ls -t1 "${DRIZZLE_MIGRATIONS_DIR}"/*.sql 2>/dev/null | head -n 1)

if [ -z "${latest_migration_file}" ]; then
  echo "No Drizzle migration files found in ${DRIZZLE_MIGRATIONS_DIR}."
  echo "Please run '(cd server && npx drizzle-kit generate)' first."
  exit 1
fi

echo "Found latest Drizzle migration: ${latest_migration_file}"

# 2. Prompt for a description.
read -p "Enter a short description for the migration (e.g., 'add_user_profiles'): " description

if [ -z "$description" ]; then
    echo "Error: Description cannot be empty."
    exit 1
fi

# 3. Sanitize the description.
sanitized_description=$(echo "$description" | tr '[:upper:]' '[:lower:]' | tr ' ' '_' | tr '-' '_')

# 4. Generate a timestamp.
timestamp=$(date +'%Y%m%d%H%M%S')

# 5. Construct the new filename.
new_filename="${timestamp}_${sanitized_description}.sql"
new_filepath="${SUPABASE_MIGRATIONS_DIR}/${new_filename}"

# 6. Ensure the Supabase migrations directory exists.
mkdir -p "${SUPABASE_MIGRATIONS_DIR}"

# 7. Move and rename the file, removing both the CREATE SCHEMA and CREATE TABLE blocks.
grep -v '^CREATE SCHEMA "auth";$' "${latest_migration_file}" | awk '
  in_block {
    if (/^);/) {
      in_block=0
    }
    next
  }
  /CREATE TABLE "auth"\."users"/ {
    in_block=1
    next
  }
  {print}
' > "${new_filepath}"
rm "${latest_migration_file}" # Clean up the original file from the drizzle/migrations dir

echo "✅ Successfully moved and renamed migration."
echo "   From: ${latest_migration_file}"
echo "   To:   ${new_filepath}"
