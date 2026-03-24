#!/bin/bash

export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"

resolve_binary() {
    local name="$1"
    shift
    local candidate

    candidate=$(command -v "$name" 2>/dev/null || true)
    if [ -n "$candidate" ]; then
        echo "$candidate"
        return 0
    fi

    for candidate in "$@"; do
        if [ -x "$candidate" ]; then
            echo "$candidate"
            return 0
        fi
    done

    return 1
}

init_k8s_binaries() {
    DOCKER_BIN=$(resolve_binary docker /usr/local/bin/docker /opt/homebrew/bin/docker)
    MINIKUBE_BIN=$(resolve_binary minikube /usr/local/bin/minikube /opt/homebrew/bin/minikube)
    KUBECTL_BIN=$(resolve_binary kubectl /usr/local/bin/kubectl /opt/homebrew/bin/kubectl)

    if [ -z "$DOCKER_BIN" ] || [ -z "$MINIKUBE_BIN" ] || [ -z "$KUBECTL_BIN" ]; then
        echo -e "${RED}Required tools are missing from PATH.${NC}"
        [ -z "$DOCKER_BIN" ] && echo -e "${YELLOW}Missing: docker${NC}"
        [ -z "$MINIKUBE_BIN" ] && echo -e "${YELLOW}Missing: minikube${NC}"
        [ -z "$KUBECTL_BIN" ] && echo -e "${YELLOW}Missing: kubectl${NC}"
        return 1
    fi

    export PATH="$(dirname "$DOCKER_BIN"):$(dirname "$MINIKUBE_BIN"):$(dirname "$KUBECTL_BIN"):$PATH"
    export DOCKER_BIN MINIKUBE_BIN KUBECTL_BIN
}

wait_for_docker_daemon() {
    local max_retries="${1:-45}"
    local sleep_seconds="${2:-2}"
    local attempt=1

    if "$DOCKER_BIN" info >/dev/null 2>&1; then
        return 0
    fi

    if [ "$(uname -s)" = "Darwin" ] && [ -d "/Applications/Docker.app" ]; then
        echo -e "${YELLOW}Docker Desktop is not ready. Attempting to start it...${NC}"
        open -a Docker >/dev/null 2>&1 || true
    fi

    echo -e "${BLUE}Waiting for Docker daemon to become ready...${NC}"
    while [ "$attempt" -le "$max_retries" ]; do
        if "$DOCKER_BIN" info >/dev/null 2>&1; then
            echo -e "${GREEN}Docker daemon is ready.${NC}"
            return 0
        fi

        sleep "$sleep_seconds"
        attempt=$((attempt + 1))
    done

    echo -e "${RED}Docker daemon is still unavailable after $((max_retries * sleep_seconds)) seconds.${NC}"
    echo -e "${YELLOW}Docker context: $("$DOCKER_BIN" context show 2>/dev/null || echo unknown)${NC}"
    return 1
}
