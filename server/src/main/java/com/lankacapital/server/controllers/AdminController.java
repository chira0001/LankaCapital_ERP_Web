package com.lankacapital.server.controllers;

import com.lankacapital.server.dtos.*;
import com.lankacapital.server.entities.Employee;
import com.lankacapital.server.entities.Loan;
import com.lankacapital.server.services.*;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.lankacapital.server.services.ReportService;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Optional;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping(path = "/api/v1/admin")
@AllArgsConstructor

public class AdminController {

    private final RoleService roleService;
    private final SalaryConditionService salaryConditionService;
    private final EmployeeService employeeService;
    private final LoanService loanService;
    private final PettyCashService pettyCashService;
    private final MonthlyExpenseService monthlyExpenseService;
    private final FinancialStatementService financialStatementService;
    private final ReportService reportService;

    @PostMapping(path = "/role")
    public ResponseEntity<?> addNewRole(@RequestBody RoleRegisterDto dto){
        return new ResponseEntity<>(roleService.addNewRole(dto), HttpStatus.CREATED);
    }

    @GetMapping(path = "/role/{roleName}")
    public ResponseEntity<?> getRoleByRoleName(@PathVariable RoleRegisterDto dto){
        return new ResponseEntity<>(roleService.getRoleByRoleName(dto), HttpStatus.OK);
    }

    @GetMapping(path = "/role")
    public ResponseEntity<?> getAllRoles(){
        return new ResponseEntity<>(roleService.getAllRoles(), HttpStatus.OK);
    }


    @PostMapping(path = "/salary-condition")
    public ResponseEntity<?> addNewSalaryCondition(@RequestBody ConditionRegisterDto dto){
        return new ResponseEntity<>(salaryConditionService.addNewSalaryCondition(dto), HttpStatus.CREATED);
    }

    @GetMapping(path = "/salary-condition/{conditionName}")
    public ResponseEntity<?> getSalaryConditionBySalaryCondition(@PathVariable ConditionRegisterDto dto){
        return new ResponseEntity<>(salaryConditionService.getSalaryConditionByConditionName(dto), HttpStatus.OK);
    }

    @GetMapping(path = "/salary-condition")
    public ResponseEntity<?> getAllSalaryConditions(){
        return new ResponseEntity<>(salaryConditionService.getAllSalaryConditions(), HttpStatus.OK);
    }

    @PostMapping(path = "/employee")
    public ResponseEntity<?> addNewEmployee(@RequestBody EmployeeAddDto dto){
        Employee newEmployee = employeeService.addNewEmployee(dto);
        return new ResponseEntity<>(newEmployee, HttpStatus.CREATED);
    }

    //admin loan view
    //@GetMapping("/loans")
    //public ResponseEntity<?> getAllLoans(){
     //   return ResponseEntity.ok(loanService.getAllLoans());
    //}

    ///  /////////new
    @GetMapping("/loans")
    public ResponseEntity<?> getAllLoans() {

        try {
            return ResponseEntity.ok(loanService.getAllLoans());
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/loans/customer/{id}")
    public ResponseEntity<?> getLoansByCustomerId(@PathVariable String id){
        return ResponseEntity.ok(loanService.getLoansByCustomerId(id));
    }

    @GetMapping("/loans/{fileNumber}")
    public ResponseEntity<?> getLoanById(@PathVariable String fileNumber) {
        return ResponseEntity.ok(loanService.getLoan(fileNumber));
    }

    //loan actions
    @PutMapping("/approve")
    public ResponseEntity<?> approve(@RequestBody LoanActionDto dto){
        return  ResponseEntity.ok(loanService.approveLoan(dto));
    }

    @PutMapping("/reject")
    public ResponseEntity<?> reject(@RequestBody LoanActionDto dto){
        return ResponseEntity.ok(loanService.rejectLoan(dto));
    }

    @PutMapping("/reset")
    public ResponseEntity<Loan> resetLoan(@RequestBody LoanActionDto dto) {
        return ResponseEntity.ok(loanService.resetLoan(dto));
    }

    //admin interest management
    @PutMapping("/loans/interest")
    public ResponseEntity<?> updateInterest(@RequestBody InterestUpdateDTO dto){
        return ResponseEntity.ok(loanService.updateInterest(dto));
    }

    @GetMapping("/loans/interest/{fileNumber}")
    public ResponseEntity<?> getInterest(@PathVariable String fileNumber){
        return ResponseEntity.ok(loanService.getInterest(fileNumber));
    }

    @DeleteMapping("/loans/interest/{fileNumber}")
    public ResponseEntity<?> resetInterest(@PathVariable String fileNumber){
        return ResponseEntity.ok(loanService.resetInterest(fileNumber));
    }

    //petty cash
    @GetMapping("/pettyCash")
    public ResponseEntity<?>getAllPettyCash(){
        return ResponseEntity.ok(pettyCashService.getAllPettyCash());
    }

    @PutMapping("/pettyCash/approve/{id}")
    public ResponseEntity<?>approvePettyCash(
            @PathVariable Long id,
            Authentication authentication
    ){
        return ResponseEntity.ok(
                pettyCashService.approvePettyCash(id,authentication.getName())
        );

    }

    @PutMapping("/pettyCash/reject/{id}")
    public ResponseEntity<?>rejectPettyCash(
            @PathVariable Long id,
            Authentication authentication
            ){
        return ResponseEntity.ok(
                pettyCashService.rejectPettyCash(id,authentication.getName())
        );
    }

    @GetMapping("/pettyCash/pending")
    public ResponseEntity<?>getPendingPettyCash(){
        return ResponseEntity.ok(pettyCashService.getPendingRequests());
    }

    @PutMapping("/undo/{id}/{adminUsername}")
    public PettyCashResponseDto undo(@PathVariable Long id,
                                     @PathVariable String adminUsername) {
        return pettyCashService.undoStatus(id, adminUsername);
    }


    //reports
    @GetMapping("/reports/loans/monthly")
    public ResponseEntity<?> getMonthlyLoanReport(@RequestParam String month) {
        try {
            YearMonth ym = YearMonth.parse(month);
            return ResponseEntity.ok(loanService.getMonthlyLoanReport(ym));
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/reports/expenses/monthly")
    public ResponseEntity<?> getMonthlyExpenseReport(@RequestParam String month) {
        Optional<MonthlyExpenseReportRow> report =
                monthlyExpenseService.getMonthlyExpenseReport(month);

        if (report.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok(report.get());
    }

    @GetMapping("/financial-statement")
    public ResponseEntity<?> getFinancialStatement(
            @RequestParam String month
    ) {
        return ResponseEntity.ok(
                financialStatementService.getFinancialStatement(month)
        );
    }

    @GetMapping("/financial-dashboard")
    public ResponseEntity<?> getDashboard(
            @RequestParam String month
    ) {
        return ResponseEntity.ok(
                financialStatementService.getFinancialDashboard(month)
        );
    }

    @GetMapping("/financial-trend")
    public ResponseEntity<?> getTrend(
            @RequestParam String month
    ) {
        return ResponseEntity.ok(
                financialStatementService.getMonthlyTrend(month)
        );
    }

    @GetMapping("/financial-profit-loss")
    public ResponseEntity<?> getProfitLoss(
            @RequestParam String month
    ) {
        return ResponseEntity.ok(
                financialStatementService.getProfitLoss(month)
        );
    }

    @GetMapping("/financial-report/pdf")
    public ResponseEntity<byte[]> downloadPdf(
            @RequestParam String month
    ) {

        byte[] pdf = financialStatementService.generateFinancialReportPdf(month);

        return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=financial-report.pdf")
                .body(pdf);
    }

    @GetMapping("/financial-cashflow")
    public ResponseEntity<?> getCashFlow(
            @RequestParam String month
    ) {
        return ResponseEntity.ok(
                financialStatementService.getCashFlow(month)
        );
    }

    @GetMapping("/financial-balance-sheet")
    public ResponseEntity<?> getBalanceSheet(
            @RequestParam String month
    ) {
        return ResponseEntity.ok(
                financialStatementService.getBalanceSheet(month)
        );
    }

    @GetMapping("/financial-report")
    public ResponseEntity<?> getFinancialReport(
            @RequestParam String month
    ) {
        return ResponseEntity.ok(
                financialStatementService.getFinancialReport(month)
        );
    }

    //daily collection
    @GetMapping("/admin/reports/collections/daily/details")
    public ResponseEntity<?> getDetails(@RequestParam String date) {

        return ResponseEntity.ok(
                reportService.getDailyCollectionDetails(LocalDate.parse(date))
        );
    }

    @GetMapping("/reports/collections/daily")
    public ResponseEntity<?> getDailySummary(@RequestParam String date) {

        return ResponseEntity.ok(
                reportService.getDailyCollectionSummary(LocalDate.parse(date))
        );
    }


    @GetMapping("/annual-report")
    public FinancialReportDto annualReport(@RequestParam String year) {
        return financialStatementService.getAnnualFinancialReport(year);
    }

    @GetMapping("/annual-balance-sheet")
    public BalanceSheetDto annualBalanceSheet(@RequestParam String year) {
        return financialStatementService.getAnnualBalanceSheet(year);
    }

    @GetMapping("/annual-cash-flow")
    public CashFlowDto annualCashFlow(@RequestParam String year) {
        return financialStatementService.getAnnualCashFlow(year);
    }

    @PostMapping(path = "/financial-statement/import", consumes = "multipart/form-data")
    public ResponseEntity<?> importAssetsLiabilities(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        return ResponseEntity.ok(
                financialStatementService.importAssetsLiabilities(file)
        );
    }
}


