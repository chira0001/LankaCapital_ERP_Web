package com.lankacapital.server.controllers;

import com.lankacapital.server.dtos.*;
import com.lankacapital.server.dtos.AdminDto.DailyCollectionRequestDto;
import com.lankacapital.server.dtos.AdminDto.ReportsDtos.AssetsDto;
import com.lankacapital.server.dtos.AdminDto.ReportsDtos.TrialBalanceDataDto;
import com.lankacapital.server.entities.Employee;

import com.lankacapital.server.entities.SalaryMetaData;
import com.lankacapital.server.exceptions.ResourceNotFoundException;
import com.lankacapital.server.mappers.LoanMapper;
import com.lankacapital.server.services.*;
import com.lankacapital.server.services.ReportsService.AssetsRegistryService;
import com.lankacapital.server.services.ReportsService.TrialBalanceDataService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping(path = "/api/v1/admin")
@AllArgsConstructor

public class AdminController {

    private final RoleService roleService;

    private final EmployeeService employeeService;
    private final LoanService loanService;
    private final PettyCashService pettyCashService;
//    private final MonthlyExpenseService monthlyExpenseService;
    private final FinancialStatementService financialStatementService;
    private final AssetsRegistryService assetsRegistryService;
    private final DailyCollectionService dailyCollectionService;
    private final CustomerService customerService;
    private final DashboardService dashboardService;
    private final SalaryConditionService salaryConditionService;
    private final SalaryMetaDataService salaryMetaDataService;
    private final PettyCashCategoryService pettyCashCategoryService;
    private final TrialBalanceDataService trialBalanceDataService;

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
    public ResponseEntity<?> getAllLoans(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                loanService.getAllLoans(authentication.getName(), page, size, search)
        );
    }

    @PostMapping("/loans")
    public ResponseEntity<LoanResponseDto> addLoan(
            @RequestBody LoanCreateDto dto,
            Authentication authentication
    ) {
        return new ResponseEntity<>(
                LoanMapper.mapToLoanResponseDto(loanService.addLoan(dto, authentication.getName())),
                HttpStatus.CREATED
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

    @PutMapping(path = "/pettyCash/{id}")
    public ResponseEntity<?> updatePettyCash(
            Authentication authentication,
            @RequestBody PettyCashDto pettyCashDto,
            @PathVariable Long id
    ){
        if(authentication == null || authentication.getName().isEmpty()){
            throw new ResourceNotFoundException("Token is invalid");
        }
        return new ResponseEntity<>(pettyCashService.updatePettyCash(authentication.getName(),id,pettyCashDto), HttpStatus.OK);
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

    @GetMapping(path = "/employees/profile")
    public ResponseEntity<?> getProfileDetails(Authentication authentication){
        return new ResponseEntity<>(employeeService.getEmployeeDetailByUsername(authentication.getName()), HttpStatus.OK);
    }

    @PutMapping(path = "/employees/profile/password")
    public ResponseEntity<?> changeProfilePassword(Authentication authentication, @RequestBody PasswordRequestDto passwordRequestDto){
        return new ResponseEntity<>(employeeService.updatePasswordByUsername(authentication.getName(), passwordRequestDto), HttpStatus.OK);
    }

    @PutMapping(path = "/employees/profile")
    public ResponseEntity<?> updateProfileInfo(Authentication authentication, @RequestBody EmployeeResponseDto dto){
        return new ResponseEntity<>(employeeService.updateEmployeeInfo(authentication.getName(),dto), HttpStatus.OK);
    }

    @GetMapping(path = "/dailyCollections")
    public ResponseEntity<?> getDailyCollection(
            Authentication authentication,
            @RequestParam String startDate,
            @RequestParam String endDate)
    {
        if(authentication == null || authentication.getName().isEmpty()){
            throw new ResourceNotFoundException("Token is invalid");
        }

        DailyCollectionRequestDto dto = new DailyCollectionRequestDto();
        dto.setStartDate(startDate);
        dto.setEndDate(endDate);

        return new ResponseEntity<>(
                dailyCollectionService.getDailyCollections(dto),
                HttpStatus.OK
        );
    }

    @GetMapping(path = "/pettyCashCategories")
    public ResponseEntity<?> getAllPettyCashCategories(Authentication authentication){
        if(authentication == null || authentication.getName().isEmpty()){
            throw new ResourceNotFoundException("Token is invalid");
        }
        return new ResponseEntity<>(pettyCashCategoryService.getAllCategories(), HttpStatus.OK);
    }

    @PostMapping(path = "/pettyCashCategories")
    public ResponseEntity<?> createNewCategory(Authentication authentication, @RequestParam String newCategory){
        if(authentication == null || authentication.getName().isEmpty()){
            throw new ResourceNotFoundException("Token is invalid");
        }
        
        return new ResponseEntity<>(pettyCashCategoryService.createNewCategory(newCategory, authentication.getName()), HttpStatus.OK);
    }

    @GetMapping(path = "/loan-summary")
    public ResponseEntity<?> fetchLoanSummary(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            Authentication authentication
    ) {
        if (authentication == null || authentication.getName().isEmpty()) {
            throw new ResourceNotFoundException("Token is invalid");
        }

        return new ResponseEntity<>(loanService.fetchLoanSummary(page, size, search), HttpStatus.OK);
    }

    @GetMapping(path = "/loan-summary/{loanId}/payments")
    public ResponseEntity<?> fetchLoanPayments(
            @PathVariable Long loanId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "15") int size,
            Authentication authentication
    ) {
        if (authentication == null || authentication.getName().isEmpty()) {
            throw new ResourceNotFoundException("Token is invalid");
        }

        return new ResponseEntity<>(loanService.fetchLoanPayments(loanId, page, size), HttpStatus.OK);
    }

    //reports
    @GetMapping("/reports")
    public ResponseEntity<?> generateReport(
            @RequestParam String reportType,
            @RequestParam String startDate,
            @RequestParam String endDate
    ) {
        return ResponseEntity.ok(financialStatementService.generateReports(reportType,startDate,endDate));
    }

    @GetMapping(path = "/assets")
    public ResponseEntity<?> getFromAssetsRegistry(Authentication authentication){
        if(authentication == null || authentication.getName().isEmpty()){
            throw new ResourceNotFoundException("Token is invalid");
        }
        return new ResponseEntity<>(assetsRegistryService.getAllAssets(), HttpStatus.CREATED);
    }

    @PostMapping(path = "/assets")
    public ResponseEntity<?> addToAssetsRegistry(
            Authentication authentication,
            @RequestBody AssetsDto assetsDto
    ){
        if(authentication == null || authentication.getName().isEmpty()){
            throw new ResourceNotFoundException("Token is invalid");
        }
        return new ResponseEntity<>(assetsRegistryService.addAssetToRegistry(assetsDto), HttpStatus.CREATED);
    }

    @PostMapping(path = "/trialBalance")
    public ResponseEntity<?> addToTrialBalance(
            Authentication authentication,
            @RequestBody List<TrialBalanceDataDto> trialBalanceDataDto
    ){
        if(authentication == null || authentication.getName().isEmpty()){
            throw new ResourceNotFoundException("Token is invalid");
        }
        return new ResponseEntity<>(trialBalanceDataService.addToTrialBalance(trialBalanceDataDto), HttpStatus.CREATED);
    }

    @GetMapping(path = "/trialBalance")
    public ResponseEntity<?> fetchTrialBalances(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate,
            Authentication authentication
    ){
        if(authentication == null || authentication.getName().isEmpty()){
            throw new ResourceNotFoundException("Token is invalid");
        }
        return new ResponseEntity<>(trialBalanceDataService.fetchTrialBalances(startDate,endDate), HttpStatus.CREATED);
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









    // Undo delete
    @PutMapping("/customers/{nic}/undo")
    public ResponseEntity<?> undoDeleteCustomer(@PathVariable String nic) {

        customerService.undoDelete(nic);

        return ResponseEntity.ok("Customer restored successfully");
    }
}


