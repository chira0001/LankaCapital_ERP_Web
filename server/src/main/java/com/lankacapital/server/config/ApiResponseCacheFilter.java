package com.lankacapital.server.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.time.Duration;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@RequiredArgsConstructor
public class ApiResponseCacheFilter extends OncePerRequestFilter {

    private static final long CACHE_TTL_MILLIS = Duration.ofMinutes(5).toMillis();
    private static final int MAX_CACHE_ENTRIES = 2_000;

    private final JdbcTemplate jdbcTemplate;
    private final Map<CacheKey, CacheEntry> cache = new ConcurrentHashMap<>();

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return !"GET".equalsIgnoreCase(request.getMethod())
                || !path.startsWith("/api/v1/")
                || path.startsWith("/api/v1/auth/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        Set<String> resourceTags = resourceTagsFor(request.getRequestURI());
        CacheKey key = new CacheKey(
                currentUsername(),
                request.getRequestURI(),
                request.getQueryString() == null ? "" : request.getQueryString(),
                request.getHeader("Accept") == null ? "" : request.getHeader("Accept")
        );
        long now = System.currentTimeMillis();
        removeExpiredEntries(now);

        Map<String, Long> revisions = readRevisions(resourceTags);
        CacheEntry cached = cache.get(key);
        if (cached != null) {
            if (cached.expiresAtMillis > now && cached.revisions.equals(revisions)) {
                writeCachedResponse(response, cached);
                return;
            }
            cache.remove(key, cached);
        }

        ContentCachingResponseWrapper wrappedResponse = new ContentCachingResponseWrapper(response);
        filterChain.doFilter(request, wrappedResponse);

        byte[] responseBody = wrappedResponse.getContentAsByteArray();
        String contentType = wrappedResponse.getContentType();
        if (wrappedResponse.getStatus() >= 200
                && wrappedResponse.getStatus() < 300
                && responseBody.length > 0
                && contentType != null
                && contentType.toLowerCase().contains("json")) {
            Map<String, Long> afterRevisions = readRevisions(resourceTags);
            if (revisions.equals(afterRevisions)) {
                cache.put(key, new CacheEntry(
                        wrappedResponse.getStatus(),
                        contentType,
                        wrappedResponse.getCharacterEncoding(),
                        responseBody,
                        revisions,
                        System.currentTimeMillis() + CACHE_TTL_MILLIS
                ));
                enforceCacheLimit();
            }
        }

        wrappedResponse.copyBodyToResponse();
    }

    private String currentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication == null ? "anonymous" : authentication.getName();
    }

    private Map<String, Long> readRevisions(Set<String> resourceTags) {
        String placeholders = String.join(",", Collections.nCopies(resourceTags.size(), "?"));
        String sql = "SELECT resource_key, revision FROM api_cache_revisions WHERE resource_key IN ("
                + placeholders + ")";
        Map<String, Long> revisions = new HashMap<>();
        Object[] parameters = resourceTags.toArray();
        jdbcTemplate.query(sql, resultSet -> {
            revisions.put(
                    resultSet.getString("resource_key"),
                    resultSet.getLong("revision")
            );
        }, parameters);

        if (revisions.size() != resourceTags.size()) {
            throw new IllegalStateException("API cache revision keys are missing from the database");
        }
        return Map.copyOf(revisions);
    }

    private Set<String> resourceTagsFor(String requestPath) {
        String path = requestPath.toLowerCase(Locale.ROOT);
        if (path.startsWith("/api/v1/admin/")) {
            String resource = path.substring("/api/v1/admin".length());
            if (resource.startsWith("/salary-meta-data")) return Set.of("salary-meta-data");
            if (resource.startsWith("/salary")) return Set.of("salary");
            if (resource.startsWith("/role")) return Set.of("roles");
            if (resource.startsWith("/employees") || resource.startsWith("/menu-permissions")) return Set.of("employees");
            if (resource.startsWith("/loans") || resource.startsWith("/loan-summary")) return Set.of("loans");
            if (resource.startsWith("/customers")) return Set.of("customers");
            if (resource.startsWith("/dailycollections")) return Set.of("collections");
            if (resource.startsWith("/administrative-expense-categories")) return Set.of("expense-categories");
            if (resource.startsWith("/administrative-expenses")) return Set.of("expenses");
            if (resource.startsWith("/assets")) return Set.of("assets");
            if (resource.startsWith("/financial-dashboard")) return Set.of("dashboard");
            if (resource.startsWith("/trialbalance")
                    || resource.startsWith("/equitychange")
                    || resource.startsWith("/cashflow")
                    || resource.startsWith("/financialnotes")
                    || resource.startsWith("/shares")
                    || resource.startsWith("/incometax")
                    || resource.startsWith("/reports")) {
                return Set.of("reports");
            }
        } else if (path.startsWith("/api/v1/recep/")) {
            String resource = path.substring("/api/v1/recep".length());
            if (resource.startsWith("/customers")) return Set.of("customers");
            if (resource.startsWith("/loans") || resource.startsWith("/loan-summary")) return Set.of("loans");
            if (resource.startsWith("/dashboard")) return Set.of("dashboard");
            if (resource.startsWith("/employees")) return Set.of("employees");
            if (resource.startsWith("/administrative-expense-categories")) return Set.of("expense-categories");
            if (resource.startsWith("/administrative-expenses")) return Set.of("expenses");
            if (resource.startsWith("/loan/collection")) return Set.of("collections");
        } else if (path.startsWith("/api/v1/field/")) {
            String resource = path.substring("/api/v1/field".length());
            if (resource.startsWith("/customers") || resource.startsWith("/manage/customer")) return Set.of("customers");
            if (resource.startsWith("/employees") || resource.startsWith("/manage/employee") || resource.startsWith("/ping")) {
                return Set.of("employees");
            }
            if (resource.startsWith("/manage/loan")) return Set.of("loans");
            if (resource.startsWith("/collection")) return Set.of("collections");
        }
        return ApiCacheRevisionInitializer.ALL_TAGS;
    }

    private void writeCachedResponse(HttpServletResponse response, CacheEntry cached) throws IOException {
        response.setStatus(cached.status);
        response.setContentType(cached.contentType);
        response.setCharacterEncoding(cached.characterEncoding);
        response.setContentLength(cached.body.length);
        response.getOutputStream().write(cached.body);
    }

    private void removeExpiredEntries(long now) {
        cache.entrySet().removeIf(entry -> entry.getValue().expiresAtMillis <= now);
    }

    private void enforceCacheLimit() {
        if (cache.size() <= MAX_CACHE_ENTRIES) {
            return;
        }
        CacheKey oldestKey = cache.entrySet().stream()
                .min(Map.Entry.comparingByValue((first, second) ->
                        Long.compare(first.expiresAtMillis, second.expiresAtMillis)))
                .map(Map.Entry::getKey)
                .orElse(null);
        if (oldestKey != null) {
            cache.remove(oldestKey);
        }
    }

    private record CacheKey(String username, String path, String query, String accept) {
    }

    private record CacheEntry(
            int status,
            String contentType,
            String characterEncoding,
            byte[] body,
            Map<String, Long> revisions,
            long expiresAtMillis
    ) {
    }
}
