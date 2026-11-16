package com.lankacapital.server.config;

import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowCallbackHandler;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.sql.ResultSet;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ApiResponseCacheFilterTest {

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void cachesJsonGetResponsesUntilRelatedDatabaseRevisionChanges() throws Exception {
        JdbcTemplate jdbcTemplate = mock(JdbcTemplate.class);
        AtomicInteger roleRevision = new AtomicInteger(0);
        doAnswer(invocation -> {
            RowCallbackHandler callback = invocation.getArgument(1);
            ResultSet resultSet = mock(ResultSet.class);
            when(resultSet.getString("resource_key")).thenReturn("roles");
            when(resultSet.getLong("revision")).thenAnswer(ignored -> (long) roleRevision.get());
            callback.processRow(resultSet);
            return null;
        }).when(jdbcTemplate).query(
                anyString(),
                any(RowCallbackHandler.class),
                any(Object[].class)
        );

        ApiResponseCacheFilter filter = new ApiResponseCacheFilter(jdbcTemplate);
        AtomicInteger controllerCalls = new AtomicInteger();
        authenticateAs("admin@email.com");

        MockHttpServletResponse firstResponse = performRequest(filter, controllerCalls);
        MockHttpServletResponse cachedResponse = performRequest(filter, controllerCalls);

        assertEquals(1, controllerCalls.get());
        assertEquals(firstResponse.getContentAsString(), cachedResponse.getContentAsString());

        roleRevision.incrementAndGet();
        MockHttpServletResponse refreshedResponse = performRequest(filter, controllerCalls);

        assertEquals(2, controllerCalls.get());
        assertEquals("{\"revision\":2}", refreshedResponse.getContentAsString());
    }

    private MockHttpServletResponse performRequest(
            ApiResponseCacheFilter filter,
            AtomicInteger controllerCalls
    ) throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/admin/role");
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request, response, (servletRequest, servletResponse) -> {
            int revision = controllerCalls.incrementAndGet();
            HttpServletResponse httpResponse = (HttpServletResponse) servletResponse;
            httpResponse.setContentType("application/json");
            httpResponse.getWriter().write("{\"revision\":" + revision + "}");
        });
        return response;
    }

    private void authenticateAs(String username) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(username, null, List.of())
        );
    }
}
