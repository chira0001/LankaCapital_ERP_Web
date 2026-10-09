package com.lankacapital.server.services.impl;

import com.lankacapital.server.entities.DailyCollection;
import com.lankacapital.server.entities.Employee;
import com.lankacapital.server.entities.Loan;
import com.lankacapital.server.enums.LoanStatus;
import com.lankacapital.server.enums.LoanType;
import com.lankacapital.server.repositories.DailyCollectionRepository;
import com.lankacapital.server.repositories.EmployeeRepository;
import com.lankacapital.server.repositories.LoanRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class CollectionSchedulerService {

    private static final Logger log = LoggerFactory.getLogger(CollectionSchedulerService.class);

    private final DailyCollectionRepository collectionRepository;
    private final EmployeeRepository employeeRepository;
    private final LoanRepository loanRepository;

    public CollectionSchedulerService(
            DailyCollectionRepository collectionRepository,
            EmployeeRepository employeeRepository,
            LoanRepository loanRepository
    ) {
        this.collectionRepository = collectionRepository;
        this.employeeRepository = employeeRepository;
        this.loanRepository = loanRepository;
    }

    @Scheduled(cron = "0 30 23 * * *", zone = "Asia/Colombo")
    @Transactional
    public void runEndOfDayCollectionJob() {
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime dayStart = today.atStartOfDay();
        LocalDateTime dayEnd = today.atTime(LocalTime.MAX);

        List<DailyCollection> zeroRecords = new ArrayList<>();
        List<Loan> completedLoans = new ArrayList<>();

        Employee admin = employeeRepository.findByEmail("admin@email.com");

        List<Loan> activeDailyLoans = loanRepository.findActiveLoansStartedOnOrBefore(
                LoanStatus.APPROVED, LoanType.DAILY, yesterday
        );

        for (Loan loan : activeDailyLoans) {
            boolean hasPaymentToday = collectionRepository.existsByLoanIdAndPaidAtBetween(
                    loan.getId(), dayStart, dayEnd
            );

            if (!hasPaymentToday) {
                DailyCollection record = createZeroCollection(loan, now, admin);
                zeroRecords.add(record);

                if (isLoanCompleted(loan, record.getInstallmentNumber())) {
                    loan.setStatus(LoanStatus.COMPLETED);
                    completedLoans.add(loan);
                }
            } else {
                Integer currentMaxInstallment = collectionRepository.findMaxInstallmentNumberByLoanId(loan.getId());
                if (isLoanCompleted(loan, currentMaxInstallment)) {
                    loan.setStatus(LoanStatus.COMPLETED);
                    completedLoans.add(loan);
                }
            }
        }

        List<Loan> activeWeeklyLoans = loanRepository.findActiveLoansStartedOnOrBefore(
                LoanStatus.APPROVED, LoanType.WEEKLY, yesterday
        );

        for (Loan loan : activeWeeklyLoans) {
            LocalDate paymentStartDate = loan.getApprovedAt().toLocalDate().plusDays(1);
            long daysActive = ChronoUnit.DAYS.between(paymentStartDate, today) + 1;

            if (daysActive > 0 && daysActive % 7 == 0) {
                LocalDateTime cycleStart = today.minusDays(6).atStartOfDay();
                boolean hasPaymentInCycle = collectionRepository.existsByLoanIdAndPaidAtBetween(
                        loan.getId(), cycleStart, dayEnd
                );

                if (!hasPaymentInCycle) {
                    DailyCollection record = createZeroCollection(loan, now, admin);
                    zeroRecords.add(record);

                    if (isLoanCompleted(loan, record.getInstallmentNumber())) {
                        loan.setStatus(LoanStatus.COMPLETED);
                        completedLoans.add(loan);
                    }
                } else {
                    Integer currentMaxInstallment = collectionRepository.findMaxInstallmentNumberByLoanId(loan.getId());
                    if (isLoanCompleted(loan, currentMaxInstallment)) {
                        loan.setStatus(LoanStatus.COMPLETED);
                        completedLoans.add(loan);
                    }
                }
            }
        }

        if (!zeroRecords.isEmpty()) {
            collectionRepository.saveAll(zeroRecords);
            log.info("Inserted {} default Rs. 0 collections for date: {}", zeroRecords.size(), today);
        }

        if (!completedLoans.isEmpty()) {
            loanRepository.saveAll(completedLoans);
            log.info("Marked {} loans as COMPLETED.", completedLoans.size());
        }
    }

    private boolean isLoanCompleted(Loan loan, Integer currentInstallment) {
        return loan.getInstallment() != null
                && loan.getInstallment() > 0
                && currentInstallment != null
                && currentInstallment >= loan.getInstallment();
    }

    private DailyCollection createZeroCollection(Loan loan, LocalDateTime executionTime, Employee admin) {
        DailyCollection record = new DailyCollection();

        BigDecimal interestAmount = loan.getAmount()
                .multiply(BigDecimal.valueOf(loan.getInterestRate()))
                .divide(BigDecimal.valueOf(100), 10, RoundingMode.HALF_UP);

        BigDecimal totalAmount = loan.getAmount()
                .add(interestAmount)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal installmentAmount = BigDecimal.ZERO;
        if (loan.getInstallment() != null && loan.getInstallment() > 0) {
            installmentAmount = totalAmount.divide(
                    BigDecimal.valueOf(loan.getInstallment()),
                    2,
                    RoundingMode.HALF_UP
            );
        }

        record.setLoan(loan);
        record.setPaidAmount(BigDecimal.ZERO);
        record.setPaidAt(executionTime);

        Integer maxInstallment = collectionRepository.findMaxInstallmentNumberByLoanId(loan.getId());
        record.setInstallmentNumber(maxInstallment != null ? maxInstallment + 1 : 1);

        record.setDueAmount(installmentAmount.negate());
        record.setEmployee(admin);

        return record;
    }
}