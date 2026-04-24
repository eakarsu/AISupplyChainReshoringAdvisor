#!/bin/bash

# ============================================
# AI Supply Chain Reshoring Advisor - Start Script
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${PURPLE}============================================${NC}"
echo -e "${PURPLE}  AI Supply Chain Reshoring Advisor${NC}"
echo -e "${PURPLE}============================================${NC}"
echo ""

# Load .env
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
  echo -e "${GREEN}✓ Environment variables loaded${NC}"
else
  echo -e "${RED}✗ .env file not found! Please create one.${NC}"
  exit 1
fi

BACKEND_PORT=${BACKEND_PORT:-4000}
FRONTEND_PORT=${FRONTEND_PORT:-3000}

# ---- Clean up used ports ----
echo -e "${YELLOW}→ Cleaning up ports ${BACKEND_PORT} and ${FRONTEND_PORT}...${NC}"

cleanup_port() {
  local port=$1
  local pids=$(lsof -ti :$port 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo -e "${YELLOW}  Killing processes on port $port: $pids${NC}"
    echo "$pids" | xargs kill -9 2>/dev/null || true
    sleep 1
  fi
}

cleanup_port $BACKEND_PORT
cleanup_port $FRONTEND_PORT
echo -e "${GREEN}✓ Ports cleaned${NC}"

# ---- Check PostgreSQL ----
echo -e "${YELLOW}→ Checking PostgreSQL...${NC}"
if ! command -v psql &> /dev/null; then
  echo -e "${RED}✗ PostgreSQL not found. Please install it.${NC}"
  exit 1
fi

# Try to create database if it doesn't exist
createdb $DB_NAME 2>/dev/null || true
echo -e "${GREEN}✓ PostgreSQL ready (database: $DB_NAME)${NC}"

# ---- Install dependencies ----
echo -e "${YELLOW}→ Installing backend dependencies...${NC}"
cd backend
npm install --silent 2>&1 | tail -1
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

cd ../frontend
echo -e "${YELLOW}→ Installing frontend dependencies...${NC}"
npm install --silent 2>&1 | tail -1
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
cd ..

# ---- Seed database ----
echo -e "${YELLOW}→ Seeding database...${NC}"
cd backend
node seed.js
echo -e "${GREEN}✓ Database seeded successfully${NC}"
cd ..

# ---- Start services with hot reload ----
echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  Starting services with hot reload...${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Start backend with nodemon for hot reload
echo -e "${GREEN}→ Starting backend on port ${BACKEND_PORT} (with nodemon hot reload)...${NC}"
cd backend
npx nodemon server.js &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Start frontend with React's built-in hot reload
echo -e "${GREEN}→ Starting frontend on port ${FRONTEND_PORT} (with React hot reload)...${NC}"
cd frontend
BROWSER=none PORT=$FRONTEND_PORT npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${PURPLE}============================================${NC}"
echo -e "${GREEN}  Application is starting!${NC}"
echo -e "${PURPLE}============================================${NC}"
echo ""
echo -e "  ${BLUE}Frontend:${NC}  http://localhost:${FRONTEND_PORT}"
echo -e "  ${BLUE}Backend:${NC}   http://localhost:${BACKEND_PORT}"
echo -e "  ${BLUE}API:${NC}       http://localhost:${BACKEND_PORT}/api/health"
echo ""
echo -e "  ${YELLOW}Demo Login:${NC}"
echo -e "    Email:    admin@reshoring.ai"
echo -e "    Password: admin123"
echo ""
echo -e "  ${GREEN}Hot reload is enabled - changes auto-refresh!${NC}"
echo -e "  ${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Handle cleanup on exit
cleanup() {
  echo ""
  echo -e "${YELLOW}→ Shutting down services...${NC}"
  kill $BACKEND_PID 2>/dev/null || true
  kill $FRONTEND_PID 2>/dev/null || true
  cleanup_port $BACKEND_PORT
  cleanup_port $FRONTEND_PORT
  echo -e "${GREEN}✓ All services stopped${NC}"
  exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
