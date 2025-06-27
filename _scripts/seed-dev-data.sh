#!/bin/bash

# seed-dev-data-direct.sh - Seeds development database with test data using psql directly
# Usage: ./_scripts/seed-dev-data-direct.sh

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== SnapConnect Development Data Seeder ===${NC}"
echo ""

# Check if we're in the project root
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Must run this script from the project root directory${NC}"
    exit 1
fi

# Direct database URL
DATABASE_URL="postgresql://postgres:postgres@10.0.0.7:54322/postgres"

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}Error: psql command not found${NC}"
    echo "Please install PostgreSQL client tools:"
    echo "  macOS: brew install postgresql"
    echo "  Ubuntu/Debian: sudo apt-get install postgresql-client"
    exit 1
fi

echo -e "${YELLOW}Connecting to database...${NC}"
echo ""
echo "This will look for a user with email: dev@snapconnect.com"
echo "If the user doesn't exist, the script will fail with instructions."
echo ""

# Run the seed SQL file using psql
psql "$DATABASE_URL" -f _scripts/seed.sql 2>&1 | tee /tmp/seed-output.log

RESULT=${PIPESTATUS[0]}

if [ $RESULT -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ Seed data created successfully!${NC}"
    echo ""
    echo "You can now log in with:"
    echo "  Email: dev@snapconnect.com"
    echo "  Password: [whatever you set during signup]"
    echo ""
    echo "The following test data has been created:"
    echo "  - 10 friends connected to your account"
    echo "  - 5 incoming friend requests"
    echo "  - 5 outgoing friend requests"
    echo "  - Multiple conversations with realistic messages"
    echo ""
    echo -e "${GREEN}Happy developing!${NC}"
else
    echo ""
    if grep -q "No user found with email dev@snapconnect.com" /tmp/seed-output.log; then
        echo -e "${RED}Error: Dev user not found${NC}"
        echo ""
        echo "Please follow these steps:"
        echo "1. Start the app: npm start"
        echo "2. Sign up with email: dev@snapconnect.com"
        echo "3. Run this script again"
    else
        echo -e "${RED}Error: Failed to run seed script${NC}"
        echo ""
        echo "Error details:"
        cat /tmp/seed-output.log
    fi
    rm -f /tmp/seed-output.log
    exit 1
fi

rm -f /tmp/seed-output.log