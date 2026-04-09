package com.cts.eventsphere.iamservice.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Reads the {@code X-Trace-ID} header injected by the API Gateway and stores it in
 * the SLF4J {@link MDC} for the duration of the request, making the trace ID available
 * in all log statements without explicit passing.
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-04-08
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class TraceIdFilter extends OncePerRequestFilter {

    private static final String TRACE_HEADER = "X-Trace-ID";
    private static final String MDC_KEY      = "traceId";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String traceId = request.getHeader(TRACE_HEADER);
        if (traceId != null && !traceId.isBlank()) {
            MDC.put(MDC_KEY, traceId);
            response.setHeader(TRACE_HEADER, traceId);
        }
        try {
            chain.doFilter(request, response);
        } finally {
            MDC.remove(MDC_KEY);
        }
    }
}
