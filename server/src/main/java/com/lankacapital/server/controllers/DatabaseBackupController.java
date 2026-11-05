package com.lankacapital.server.controllers;

import com.lankacapital.server.services.impl.DatabaseBackupExportService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.sql.SQLException;
import java.time.LocalDate;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping(path = "/api/v1/admin/database")
@AllArgsConstructor
public class DatabaseBackupController {
    private final DatabaseBackupExportService databaseBackupExportService;

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportDatabase(Authentication authentication)
            throws SQLException, IOException {
        if (authentication == null || authentication.getName() == null
                || authentication.getName().isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        byte[] backup = databaseBackupExportService.exportDatabase();
        String filename = "LankaCapital-Database-Backup-" + LocalDate.now() + ".xlsx";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(backup);
    }
}