package com.cts.eventsphere.eventmanager.config;

import feign.RequestTemplate;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import static org.mockito.Mockito.*;

class FeignAuthInterceptorTest {

    private final FeignAuthInterceptor interceptor = new FeignAuthInterceptor();

    @AfterEach
    void cleanup() {
        RequestContextHolder.resetRequestAttributes();
    }

    @Test
    @DisplayName("does nothing when no request context is present (RequestContextHolder returns null)")
    void apply_noRequestContext_doesNothing() {
        RequestContextHolder.resetRequestAttributes(); // ensure null
        RequestTemplate template = mock(RequestTemplate.class);

        interceptor.apply(template);

        verify(template, never()).header(anyString(), anyString());
    }

    @Test
    @DisplayName("does not set header when Authorization header is absent from current request")
    void apply_noAuthHeader_doesNotSetHeader() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        // No Authorization header set
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));
        RequestTemplate template = mock(RequestTemplate.class);

        interceptor.apply(template);

        verify(template, never()).header(anyString(), anyString());
    }

    @Test
    @DisplayName("propagates Authorization header from current request to Feign template")
    void apply_withAuthHeader_setsHeaderOnTemplate() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer test.jwt.token");
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));
        RequestTemplate template = mock(RequestTemplate.class);

        interceptor.apply(template);

        verify(template).header("Authorization", "Bearer test.jwt.token");
    }
}
