package com.lankacapital.server.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class ApiCacheRevisionInitializer implements ApplicationRunner {

    private static final String REVISION_TABLE = "api_cache_revisions";
    static final Set<String> ALL_TAGS = Set.of(
            "all",
            "employees",
            "roles",
            "salary",
            "salary-meta-data",
            "loans",
            "customers",
            "collections",
            "expenses",
            "expense-categories",
            "assets",
            "reports",
            "dashboard"
    );
    private static final Map<String, Set<String>> TABLE_TAGS = Map.ofEntries(
            Map.entry("employees", Set.of("employees", "roles", "salary", "loans", "customers", "collections", "expenses", "reports", "dashboard")),
            Map.entry("roles", Set.of("roles", "employees")),
            Map.entry("salary_meta_data", Set.of("salary-meta-data", "salary", "reports", "dashboard")),
            Map.entry("salary_conditions", Set.of("salary", "reports", "dashboard")),
            Map.entry("salaries", Set.of("salary", "reports", "dashboard")),
            Map.entry("loans", Set.of("loans", "customers", "collections", "reports", "dashboard")),
            Map.entry("customers", Set.of("customers", "loans", "collections", "reports", "dashboard")),
            Map.entry("daily_collections", Set.of("collections", "loans", "customers", "reports", "dashboard")),
            Map.entry("administrative_expense", Set.of("expenses", "reports", "dashboard")),
            Map.entry("administrative_expense_category", Set.of("expense-categories", "expenses", "reports", "dashboard")),
            Map.entry("assets", Set.of("assets", "reports", "dashboard")),
            Map.entry("trial_balance", Set.of("reports", "dashboard")),
            Map.entry("note_shares_data", Set.of("reports", "dashboard")),
            Map.entry("income_tax", Set.of("reports", "dashboard")),
            Map.entry("financial_note_data", Set.of("reports", "dashboard")),
            Map.entry("equity_change", Set.of("reports", "dashboard")),
            Map.entry("cash_flow_data", Set.of("reports", "dashboard")),
            Map.entry("monthly_expenses", Set.of("reports", "dashboard")),
            Map.entry("monthly_income", Set.of("reports", "dashboard")),
            Map.entry("petty_cash", Set.of("reports", "dashboard")),
            Map.entry("petty_cash_category", Set.of("reports", "dashboard"))
    );

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) {
        jdbcTemplate.execute("""
                CREATE TABLE IF NOT EXISTS api_cache_revisions (
                    resource_key VARCHAR(96) NOT NULL PRIMARY KEY,
                    revision BIGINT NOT NULL DEFAULT 0
                ) ENGINE=InnoDB
                """);

        for (String tag : ALL_TAGS) {
            jdbcTemplate.update(
                    "INSERT IGNORE INTO api_cache_revisions (resource_key, revision) VALUES (?, 0)",
                    tag
            );
        }

        List<String> tableNames = jdbcTemplate.query(
                """
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = DATABASE()
                  AND table_type = 'BASE TABLE'
                  AND table_name <> ?
                """,
                (resultSet, rowNumber) -> resultSet.getString("table_name"),
                REVISION_TABLE
        );

        for (String tableName : tableNames) {
            createRevisionTriggers(tableName);
        }
    }

    private void createRevisionTriggers(String tableName) {
        Set<String> revisionTags = new LinkedHashSet<>();
        revisionTags.add("all");
        revisionTags.addAll(TABLE_TAGS.getOrDefault(tableName.toLowerCase(Locale.ROOT), ALL_TAGS));

        String values = revisionTags.stream()
                .map(tag -> "('" + tag + "', 1)")
                .reduce((first, second) -> first + ", " + second)
                .orElseThrow();
        String tableIdentifier = quoteIdentifier(tableName);

        for (String operation : List.of("INSERT", "UPDATE", "DELETE")) {
            String triggerName = triggerName(tableName, operation);
            Integer triggerCount = jdbcTemplate.queryForObject(
                    """
                    SELECT COUNT(*)
                    FROM information_schema.triggers
                    WHERE trigger_schema = DATABASE() AND trigger_name = ?
                    """,
                    Integer.class,
                    triggerName
            );

            if (triggerCount != null && triggerCount > 0) {
                continue;
            }

            String triggerSql = """
                    CREATE TRIGGER %s AFTER %s ON %s
                    FOR EACH ROW
                    INSERT INTO api_cache_revisions (resource_key, revision)
                    VALUES %s
                    ON DUPLICATE KEY UPDATE revision = revision + 1
                    """.formatted(
                    quoteIdentifier(triggerName),
                    operation,
                    tableIdentifier,
                    values
            );
            jdbcTemplate.execute(triggerSql);
        }
    }

    private String triggerName(String tableName, String operation) {
        String safeTableName = tableName.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9_]", "_");
        if (safeTableName.length() > 40) {
            safeTableName = safeTableName.substring(0, 40);
        }
        String operationCode = switch (operation) {
            case "INSERT" -> "ai";
            case "UPDATE" -> "au";
            case "DELETE" -> "ad";
            default -> throw new IllegalArgumentException("Unsupported trigger operation: " + operation);
        };
        return "api_cache_" + safeTableName + "_" + operationCode;
    }

    private String quoteIdentifier(String identifier) {
        return "`" + identifier.replace("`", "``") + "`";
    }
}
