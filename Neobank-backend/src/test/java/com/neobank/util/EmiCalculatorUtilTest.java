package com.neobank.util;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class EmiCalculatorUtilTest {

    @Test
    void calculateEmiUsesReducingBalanceFormula() {
        BigDecimal emi = EmiCalculatorUtil.calculateEmi(
                new BigDecimal("200000"),
                new BigDecimal("0.115"),
                24);

        assertEquals(new BigDecimal("9368.72"), emi);
    }

    @Test
    void calculateEmiSupportsZeroInterestLoans() {
        BigDecimal emi = EmiCalculatorUtil.calculateEmi(
                new BigDecimal("120000"),
                BigDecimal.ZERO,
                12);

        assertEquals(new BigDecimal("10000.00"), emi);
    }

    @Test
    void generateAmortizationScheduleClosesFinalBalance() {
        EmiCalculatorUtil.AmortizationSchedule[] schedule =
                EmiCalculatorUtil.generateAmortizationSchedule(
                        new BigDecimal("100000"),
                        new BigDecimal("0.10"),
                        12);

        assertEquals(12, schedule.length);
        assertEquals(BigDecimal.ZERO.setScale(2), schedule[11].getRemainingBalance().setScale(2));
        assertEquals(12, schedule[11].getInstallmentNumber());
    }

    @Test
    void calculateEmiRejectsInvalidInputs() {
        assertThrows(IllegalArgumentException.class,
                () -> EmiCalculatorUtil.calculateEmi(BigDecimal.ZERO, new BigDecimal("0.10"), 12));
        assertThrows(IllegalArgumentException.class,
                () -> EmiCalculatorUtil.calculateEmi(new BigDecimal("10000"), new BigDecimal("-0.01"), 12));
        assertThrows(IllegalArgumentException.class,
                () -> EmiCalculatorUtil.calculateEmi(new BigDecimal("10000"), new BigDecimal("0.10"), 0));
    }
}
