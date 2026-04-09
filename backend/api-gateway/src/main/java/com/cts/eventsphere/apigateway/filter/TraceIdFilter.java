package com.cts.eventsphere.apigateway.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Enumeration;
import java.util.List;
import java.util.UUID;

/**
 * Servlet filter that generates a per-request trace ID and injects it into every
 * downstream request forwarded by the gateway.
 *
 * <p>If the incoming request already carries an {@code X-Trace-ID} header (e.g. from
 * a trusted upstream proxy), that value is reused; otherwise a new UUID is generated.
 * The trace ID is:</p>
 * <ul>
 *   <li>Added to the outbound response header so callers can correlate client-side errors.</li>
 *   <li>Injected into the proxied request via {@link TraceRequestWrapper} so all downstream
 *       services receive it without requiring explicit forwarding logic.</li>
 *   <li>Stored in the SLF4J {@link MDC} under {@code traceId} for the duration of the
 *       request so gateway log lines are automatically correlated.</li>
 * </ul>
 *
 * <p>Runs at {@link Ordered#HIGHEST_PRECEDENCE} — before rate limiting — so that even
 * rejected (429) responses carry the trace ID.</p>
 *
 * @author test-in-prod-10x
 * @version 1.0
 * @since 2026-04-08
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class TraceIdFilter extends OncePerRequestFilter {

    public static final String TRACE_HEADER = "X-Trace-ID";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String traceId = request.getHeader(TRACE_HEADER);
        if (traceId == null || traceId.isBlank()) {
            traceId = UUID.randomUUID().toString();
        }

        response.setHeader(TRACE_HEADER, traceId);
        MDC.put("traceId", traceId);

        try {
            chain.doFilter(new TraceRequestWrapper(request, traceId), response);
        } finally {
            MDC.remove("traceId");
        }
    }

    /**
     * Wraps the incoming {@link HttpServletRequest} to inject the {@code X-Trace-ID} header.
     * Spring Cloud Gateway MVC reads headers from the wrapped request when building the
     * proxied HTTP call, so the header is transparently forwarded to all downstream services.
     */
    private static final class TraceRequestWrapper extends HttpServletRequestWrapper {

        private final String traceId;

        TraceRequestWrapper(HttpServletRequest request, String traceId) {
            super(request);
            this.traceId = traceId;
        }

        @Override
        public String getHeader(String name) {
            if (TRACE_HEADER.equalsIgnoreCase(name)) return traceId;
            return super.getHeader(name);
        }

        @Override
        public Enumeration<String> getHeaders(String name) {
            if (TRACE_HEADER.equalsIgnoreCase(name)) {
                return Collections.enumeration(Collections.singletonList(traceId));
            }
            return super.getHeaders(name);
        }

        @Override
        public Enumeration<String> getHeaderNames() {
            List<String> names = Collections.list(super.getHeaderNames());
            if (names.stream().noneMatch(TRACE_HEADER::equalsIgnoreCase)) {
                names.add(TRACE_HEADER);
            }
            return Collections.enumeration(names);
        }
    }
}
