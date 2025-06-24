#!/bin/bash
# This script is used to consistently re-initialize the local test database.
# It MUST be run from the project root directory.
#
# It performs the following steps:
# 1. Finds the latest Drizzle-generated SQL schema file.
# 2. Copies it to the Supabase migrations directory as the initial schema.
# 3. Starts the local Supabase instance.
# 4. Resets the local Supabase database, applying all migrations.

set -e # Exit immediately if a command exits with a non-zero status.

# --- Configuration ---
# These paths are relative to the project root.
SERVER_DIR="server"
DRIZZLE_MIGRATIONS_DIR="server/drizzle/migrations"
SUPABASE_MIGRATIONS_DIR="server/supabase/migrations"
INITIAL_SCHEMA_FILE="0000_initial_schema.sql"
# --- End Configuration ---

# Check if we're in the project root by looking for the server directory.
if [ ! -d "${SERVER_DIR}" ]; then
    echo "Error: This script must be run from the project root directory (the one containing '${SERVER_DIR}/')."
    exit 1
fi

# Check for Supabase CLI
if ! command -v supabase &> /dev/null
then
    echo "Error: Supabase CLI is not installed. Please install it to continue."
    echo "See: https://supabase.com/docs/guides/cli"
    exit 1
fi

echo "Starting test database re-initialization..."

# 1. Find the latest Drizzle migration file.
latest_drizzle_file=$(ls -t1 "${DRIZZLE_MIGRATIONS_DIR}"/*.sql 2>/dev/null | head -n 1)

if [ -z "${latest_drizzle_file}" ]; then
  echo "Error: No Drizzle migration files found in ${DRIZZLE_MIGRATIONS_DIR}."
  echo "Please run '(cd server && npx drizzle-kit generate)' to create a schema file."
  exit 1
fi

echo "Using latest Drizzle schema: ${latest_drizzle_file}"

# 2. Ensure the Supabase migrations directory exists.
mkdir -p "${SUPABASE_MIGRATIONS_DIR}"

# 3. Copy the latest Drizzle schema as the initial Supabase migration.
initial_schema_path="${SUPABASE_MIGRATIONS_DIR}/${INITIAL_SCHEMA_FILE}"
# Remove both the CREATE SCHEMA "auth" line and the CREATE TABLE "auth"."users" block.
grep -v '^CREATE SCHEMA "auth";$' "${latest_drizzle_file}" | awk '
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
' > "${initial_schema_path}"
echo "Copied schema to ${initial_schema_path}"

# 4. Start Supabase services and reset the database.
echo "Starting local Supabase instance and resetting database..."
(cd "${SERVER_DIR}" && supabase start && supabase db reset)

echo "✅ Test database re-initialized successfully."
