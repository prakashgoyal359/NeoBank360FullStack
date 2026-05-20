package com.neobank.util;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;

/**
 * EMI Calculator Utility
 * Implements accurate EMI calculation using the standard formula:
 *
 * EMI = P × r × (1+r)^n / ((1+r)^n − 1)
 *
 * Where:
 * - P = Principal loan amount
 * - r = Monthly interest rate (annual rate / 12)
 * - n = Number of monthly installments
 */
public class EmiCalculatorUtil {

    private static final int SCALE = 2;
    private static final RoundingMode ROUNDING_MODE = RoundingMode.HALF_UP;
    private static final MathContext MATH_CONTEXT = new MathContext(20, ROUNDING_MODE);

    /**
     * Calculate EMI for the given principal, annual interest rate, and tenure in months
     *
     * @param principal       The principal loan amount
     * @param annualRate      The annual interest rate (as decimal, e.g., 0.10 for 10%)
     * @param tenureInMonths The number of monthly installments
     * @return The calculated EMI amount
     */
    public static BigDecimal calculateEmi(BigDecimal principal, BigDecimal annualRate, int tenureInMonths) {
        if (principal == null || annualRate == null || tenureInMonths <= 0) {
            throw new IllegalArgumentException("Invalid input parameters");
        }

        if (principal.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Principal must be positive");
        }

        if (annualRate.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Interest rate cannot be negative");
        }

        // If interest rate is 0, simple division
        if (annualRate.compareTo(BigDecimal.ZERO) == 0) {
            return principal.divide(BigDecimal.valueOf(tenureInMonths), SCALE, ROUNDING_MODE);
        }

        // Convert annual rate to monthly rate
        BigDecimal monthlyRate = annualRate.divide(BigDecimal.valueOf(12), 6, ROUNDING_MODE);

        // Calculate (1 + r)^n
        BigDecimal onePlusR = BigDecimal.ONE.add(monthlyRate);
        BigDecimal onePlusRPowN = onePlusR.pow(tenureInMonths, MATH_CONTEXT);

        // EMI = P × r × (1+r)^n / ((1+r)^n − 1)
        BigDecimal numerator = principal.multiply(monthlyRate).multiply(onePlusRPowN);
        BigDecimal denominator = onePlusRPowN.subtract(BigDecimal.ONE);

        return numerator.divide(denominator, SCALE, ROUNDING_MODE);
    }

    /**
     * Calculate total interest payable over the loan tenure
     */
    public static BigDecimal calculateTotalInterest(BigDecimal principal, BigDecimal emi, int tenureInMonths) {
        return emi.multiply(BigDecimal.valueOf(tenureInMonths))
                .subtract(principal)
                .setScale(SCALE, ROUNDING_MODE);
    }

    /**
     * Calculate total amount payable (principal + interest)
     */
    public static BigDecimal calculateTotalAmount(BigDecimal principal, BigDecimal totalInterest) {
        return principal.add(totalInterest);
    }

    /**
     * Generate amortization schedule
     *
     * @return Array of objects containing [principalComponent, interestComponent, remainingBalance]
     */
    public static AmortizationSchedule[] generateAmortizationSchedule(
            BigDecimal principal,
            BigDecimal annualRate,
            int tenureInMonths) {

        BigDecimal standardEmi = calculateEmi(principal, annualRate, tenureInMonths);
        BigDecimal monthlyRate = annualRate.divide(BigDecimal.valueOf(12), 6, ROUNDING_MODE);

        AmortizationSchedule[] schedule = new AmortizationSchedule[tenureInMonths];
        BigDecimal remainingBalance = principal;

        for (int i = 0; i < tenureInMonths; i++) {
            BigDecimal interestComponent = remainingBalance.multiply(monthlyRate)
                    .setScale(SCALE, ROUNDING_MODE);

            BigDecimal emi = standardEmi;
            BigDecimal principalComponent = emi.subtract(interestComponent);

            // Final installment absorbs rounding differences so the balance closes exactly.
            if (i == tenureInMonths - 1) {
                principalComponent = remainingBalance;
                emi = principalComponent.add(interestComponent).setScale(SCALE, ROUNDING_MODE);
            }

            remainingBalance = remainingBalance.subtract(principalComponent);

            // Ensure remaining balance doesn't go negative due to rounding
            if (remainingBalance.compareTo(BigDecimal.ZERO) < 0) {
                remainingBalance = BigDecimal.ZERO;
            }

            schedule[i] = new AmortizationSchedule(
                    i + 1,
                    emi,
                    principalComponent,
                    interestComponent,
                    remainingBalance
            );
        }

        return schedule;
    }

    /**
     * Calculate EMI using flat rate method (for comparison)
     */
    public static BigDecimal calculateFlatRateEmi(BigDecimal principal, BigDecimal annualRate, int tenureInMonths) {
        BigDecimal totalInterest = principal.multiply(annualRate)
                .multiply(BigDecimal.valueOf(tenureInMonths))
                .divide(BigDecimal.valueOf(12), SCALE, ROUNDING_MODE);

        return principal.add(totalInterest)
                .divide(BigDecimal.valueOf(tenureInMonths), SCALE, ROUNDING_MODE);
    }

    /**
     * Inner class to hold amortization schedule entry
     */
    public static class AmortizationSchedule {
        private final int installmentNumber;
        private final BigDecimal emi;
        private final BigDecimal principalComponent;
        private final BigDecimal interestComponent;
        private final BigDecimal remainingBalance;

        public AmortizationSchedule(int installmentNumber, BigDecimal emi, BigDecimal principalComponent,
                                    BigDecimal interestComponent, BigDecimal remainingBalance) {
            this.installmentNumber = installmentNumber;
            this.emi = emi;
            this.principalComponent = principalComponent;
            this.interestComponent = interestComponent;
            this.remainingBalance = remainingBalance;
        }

        public int getInstallmentNumber() {
            return installmentNumber;
        }

        public BigDecimal getEmi() {
            return emi;
        }

        public BigDecimal getPrincipalComponent() {
            return principalComponent;
        }

        public BigDecimal getInterestComponent() {
            return interestComponent;
        }

        public BigDecimal getRemainingBalance() {
            return remainingBalance;
        }
    }
}
