package com.lankacapital.server.controllers;

import com.lankacapital.server.dtos.*;
import com.lankacapital.server.entities.Employee;
import com.lankacapital.server.entities.Loan;

import com.lankacapital.server.entities.SalaryMetaData;
import com.lankacapital.server.exceptions.ResourceNotFoundException;
import com.lankacapital.server.services.*;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.lankacapital.server.services.ReportService;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

import static org.springframework.data.jpa.domain.AbstractPersistable_.id;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping(path = "/api/v1/admin")
@AllArgsConstructor

public class AdminController {

    private final RoleService roleService;

    private final EmployeeService employeeService;
    private final LoanService loanService;
    private final PettyCashService pettyCashService;
    private final MonthlyExpenseService monthlyExpenseService;
    private final FinancialStatementService financialStatementService;
    private final ReportService reportService;
    private final DailyCollectionService dailyCollectionService;
    private final CustomerService customerService;
    private final DashboardService dashboardService;
    private final SalaryConditionService salaryConditionService;
    private final SalaryMetaDataService salaryMetaDataService;

    @PostMapping(path = "/role")
    public ResponseEntity<?> addNewRole(@RequestBody RoleRegisterDto dto){
        return new ResponseEntity<>(roleService.addNewRole(dto), HttpStatus.CREATED);
    }

    @PostMapping("/role/name")
    public ResponseEntity<?> getRoleByName(@RequestBody RoleRegisterDto dto) {
        return ResponseEntity.ok(roleService.getRoleByRoleName(dto));
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

    @GetMapping(path = "/salary-meta-data")
    public ResponseEntity<?> getSalaryMetaData(Authentication authentication){
        if(authentication.getName() == null){
            throw new ResourceNotFoundException("Invalid token");
        }
        return new ResponseEntity<>(salaryMetaDataService.getAllSalaryMetaData(), HttpStatus.OK);
    }

    @PutMapping(path = "/salary-meta-data")
    public ResponseEntity<?> updateSalaryMetaData(
            Authentication authentication,
            @RequestBody List<SalaryMetaData> metaDataList){
        if(authentication.getName() == null){
            throw new ResourceNotFoundException("Invalid token");
        }
        return new ResponseEntity<>(salaryMetaDataService.updateAllSalaryMetaData(metaDataList), HttpStatus.OK);
    }

    @PostMapping(path = "/employee")
    public ResponseEntity<?> addNewEmployee(Authentication authentication,
                                            @RequestBody EmployeeAddDto dto){
        Employee newEmployee = employeeService.addNewEmployee(authentication.getName(), dto);
        return new ResponseEntity<>(newEmployee, HttpStatus.CREATED);
    }

    @GetMapping("/employees")
    public ResponseEntity<List<EmployeeResponseDto>> getAllEmployees(Authentication authentication) {
        return ResponseEntity.ok(employeeService.getAllEmployees(authentication.getName()));
    }

    @PutMapping("/employees/{id}")
    public ResponseEntity<?> updateEmployee(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody EmployeeResponseDto dto
    ) {

        return ResponseEntity.ok(
                employeeService.updateEmployee(authentication.getName(),id, dto)
        );
    }

    @PostMapping("/employees/delete/{id}")
    public ResponseEntity<?> deleteEmployee(
            Authentication authentication,
            @PathVariable Long id
    ) {
        employeeService.deleteEmployee(id);

        return ResponseEntity.ok("Employee deleted successfully");
    }

    @GetMapping("/loans")
    public ResponseEntity<?> getAllLoans(Authentication authentication) {
        return ResponseEntity.ok(loanService.getAllLoans(authentication.getName()));
    }

    @PostMapping("/loans")
    public ResponseEntity<Loan> addLoan(
            @RequestBody LoanCreateDto dto,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                loanService.addLoan(dto, authentication.getName())
        );
    }

    @GetMapping("/loans/customer/{id}")
    public ResponseEntity<?> getLoansByCustomerId(@PathVariable String id){
        return ResponseEntity.ok(loanService.getLoansByCustomerId(id));
    }

    @GetMapping("/loans/{fileNumber}")
    public ResponseEntity<?> getLoanById(@PathVariable String fileNumber) {
        return ResponseEntity.ok(loanService.getLoan(fileNumber));
    }

    @PutMapping("/loans/{fileNumber}")
    public ResponseEntity<?> updateLoan(
            @PathVariable String fileNumber,
            @RequestBody LoanUpdateDto loanUpdateDto,
            Authentication authentication)
    {
        return new ResponseEntity<>(loanService.updateLoan(authentication.getName(),loanUpdateDto,fileNumber), HttpStatus.OK);
    }

    //loan actions
//    @PutMapping("/approve")
//    public ResponseEntity<?> approve(@RequestBody LoanActionDto dto){
//        return  ResponseEntity.ok(loanService.approveLoan(dto));
//    }
//
//    @PutMapping("/reject")
//    public ResponseEntity<?> reject(@RequestBody LoanActionDto dto){
//        return ResponseEntity.ok(loanService.rejectLoan(dto));
//    }
//
//    @PutMapping("/reset")
//    public ResponseEntity<Loan> resetLoan(@RequestBody LoanActionDto dto) {
//        return ResponseEntity.ok(loanService.resetLoan(dto));
//    }

    //admin interest management
    @PutMapping("/loans/interest")
    public ResponseEntity<?> updateInterest(@RequestBody InterestUpdateDTO dto, Authentication authentication){
        return ResponseEntity.ok(loanService.updateInterest(dto, authentication.getName()));
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
//        public ResponseEntity<?> getMonthlyLoanReport(@RequestParam String month) {
        try {
            YearMonth ym = YearMonth.parse(month);
            System.out.println("184 : "+ym);
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

    //revenue tracking
    @GetMapping("/revenue/summary")
    public ResponseEntity<?> getRevenueSummary() {

        var today = dailyCollectionService.getTodayCollection();
        var week = dailyCollectionService.getWeeklyCollection();

        return ResponseEntity.ok(
                new RevenueSummary(today, week)
        );
    }

    @GetMapping("/revenue/collections")
    public ResponseEntity<?> getRevenueCollections() {

        return ResponseEntity.ok(
                dailyCollectionService.getAllCollections()
        );
    }

    record RevenueSummary(
            java.math.BigDecimal today,
            java.math.BigDecimal week
    ) {}

    // ================= CUSTOMER MANAGEMENT =================

    @GetMapping("/customers")
    public ResponseEntity<List<CustomerResponseDto>> getAllCustomers() {
        return ResponseEntity.ok(customerService.getAllActiveCustomers());
    }

    @GetMapping("/customers/{nic}")
    public ResponseEntity<?> getCustomer(@PathVariable String nic) {

        return ResponseEntity.ok(
                customerService.getActiveCustomerById(nic)
        );
    }

    @DeleteMapping("/customers/{nic}")
    public ResponseEntity<?> deleteCustomer(@PathVariable String nic) {

        customerService.deleteCustomer(nic);

        return ResponseEntity.ok("Customer deleted successfully");
    }

    @PostMapping("/customers")
    public ResponseEntity<?> createCustomer(
            @RequestBody CustomerRegisterDto dto,
            Authentication authentication
    ) {

        return new ResponseEntity<>(
                customerService.registerCustomer(dto, authentication.getName()),
                HttpStatus.CREATED
        );
    }

    @PutMapping("/customers/{nic}")
    public ResponseEntity<?> updateCustomer(
            @PathVariable String nic,
            @RequestBody CustomerRegisterDto dto
    ) {

        return ResponseEntity.ok(
                customerService.updateCustomerById(nic, dto)
        );
    }

    @GetMapping("/financial-dashboard/summary")
    public ResponseEntity<FinancialDashboardDto> getFinancialDashboard() {
        return ResponseEntity.ok(
                dashboardService.getFinancialDashboard()
        );
    }






    // Undo delete
    @PutMapping("/customers/{nic}/undo")
    public ResponseEntity<?> undoDeleteCustomer(@PathVariable String nic) {

        customerService.undoDelete(nic);

        return ResponseEntity.ok("Customer restored successfully");
    }
}


