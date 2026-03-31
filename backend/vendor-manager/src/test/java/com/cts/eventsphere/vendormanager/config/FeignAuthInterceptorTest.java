package com.cts.eventsphere.vendormanager.config;

import feign.RequestTemplate;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import static org.assertj.core.api.Assertions.assertThat;

class FeignAuthInterceptorTest {

    private final FeignAuthInterceptor interceptor = new FeignAuthInterceptor();

    @AfterEach
    void clearRequestContext() {
        RequestContextHolder.resetRequestAttributes();
    }

    @Test
    void apply_nullAttributes_doesNotAddHeader() {
        RequestContextHolder.resetRequestAttributes();
        RequestTemplate template = new RequestTemplate();

        interceptor.apply(template);

        assertThat(template.headers()).doesNotContainKey("Authorization");
    }

    @Test
    void apply_attributesPresentButNoAuthHeader_doesNotAddHeader() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));
        RequestTemplate template = new RequestTemplate();

        interceptor.apply(template);

        assertThat(template.headers()).doesNotContainKey("Authorization");
    }

    @Test
    void apply_withAuthHeader_addsHeaderToTemplate() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer test-token");
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));
        RequestTemplate template = new RequestTemplate();

        interceptor.apply(template);

        assertThat(template.headers()).containsKey("Authorization");
        assertThat(template.headers().get("Authorization")).contains("Bearer test-token");
    }
}
