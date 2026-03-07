#!/bin/bash
# switch-traffic.sh
# Usage: ./switch-traffic.sh <service-name> <color> [namespace]

source "$(dirname "$0")/colors.sh"

SERVICE=$1
COLOR=$2 # blue or green
NAMESPACE=${3:-"backend"}

if [ -z "$SERVICE" ] || [ -z "$COLOR" ]; then
    echo -e "${ERROR}Usage: ./switch-traffic.sh <service-name> <color> [namespace]${NC}"
    echo -e "${INFO}Example: ./switch-traffic.sh account-service green${NC}"
    exit 1
fi

echo -e "${INFO}Switching traffic for ${HEADER}$SERVICE${INFO} to ${BBLUE}$COLOR${NC}..."

# Patch the service selector to point to the new color
kubectl patch service "$SERVICE" -n "$NAMESPACE" -p "{\"spec\":{\"selector\":{\"app\":\"$SERVICE\",\"color\":\"$COLOR\"}}}"

if [ $? -eq 0 ]; then
    echo -e "${SUCCESS}Traffic successfully switched to ${BBLUE}$COLOR${NC}!"
else
    echo -e "${ERROR}Failed to switch traffic for $SERVICE.${NC}"
    exit 1
fi
