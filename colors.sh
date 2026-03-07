#!/bin/bash

# --- COLOR DEFINITIONS ---
# Use these in your scripts to maintain consistency

# Reset
NC='\033[0m' # No Color

# Regular Colors
BLACK='\033[0;30m'
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[0;37m'

# Bold Colors
BBLACK='\033[1;30m'
BRED='\033[1;31m'
BGREEN='\033[1;32m'
BYELLOW='\033[1;33m'
BBLUE='\033[1;34m'
BPURPLE='\033[1;35m'
BCYAN='\033[1;36m'
BWHITE='\033[1;37m'

# --- THEME ASSIGNMENTS ---
# Change these to swap the look of your terminal outputs globally

HEADER=${BBLUE}
SUCCESS=${BGREEN}
ERROR=${BRED}
INFO=${BCYAN}
WARNING=${BYELLOW}
ACTION=${BLUE}

# --- EXAMPLE USAGE ---
# source colors.sh
# echo -e "${HEADER}Starting Deployment...${NC}"
# echo -e "${SUCCESS}Service is Ready!${NC}"
