package com.qacts.apigateway.filter;

import com.qacts.apigateway.util.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    private static final Logger log = LoggerFactory.getLogger(AuthenticationFilter.class);

    private final RouteValidator validator;
    private final JwtUtil jwtUtil;

    public AuthenticationFilter(RouteValidator validator, JwtUtil jwtUtil) {
        super(Config.class);
        this.validator = validator;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return ((exchange, chain) -> {
            if (validator.isSecured.test(exchange.getRequest())) {
                // header contains token or not
                if (!exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                    log.warn("Missing Authorization header for request: {}", exchange.getRequest().getURI());
                    return onError(exchange, HttpStatus.UNAUTHORIZED);
                }

                String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
                if (authHeader == null || authHeader.isBlank()) {
                    log.warn("Blank Authorization header for request: {}", exchange.getRequest().getURI());
                    return onError(exchange, HttpStatus.UNAUTHORIZED);
                }
                if (authHeader.startsWith("Bearer ")) {
                    authHeader = authHeader.substring(7);
                }
                try {
                    jwtUtil.validateToken(authHeader);

                    // Extract claims and inject into headers
                    Long userId = jwtUtil.getUserId(authHeader);
                    String role = jwtUtil.getRole(authHeader);

                    exchange = exchange.mutate()
                            .request(exchange.getRequest().mutate()
                                    .header("X-User-Id", String.valueOf(userId))
                                    .header("X-User-Role", role)
                                    .build())
                            .build();

                } catch (Exception e) {
                    log.error("Token validation failed for request: {}. Error: {}", exchange.getRequest().getURI(),
                            e.getMessage());
                    return onError(exchange, HttpStatus.UNAUTHORIZED);
                }
            }
            return chain.filter(exchange);
        });
    }

    private Mono<Void> onError(ServerWebExchange exchange, HttpStatus httpStatus) {
        exchange.getResponse().setStatusCode(httpStatus);
        return exchange.getResponse().setComplete();
    }

    public static class Config {
    }
}
