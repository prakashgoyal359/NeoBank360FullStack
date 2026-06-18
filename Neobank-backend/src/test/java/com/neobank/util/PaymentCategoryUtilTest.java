package com.neobank.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class PaymentCategoryUtilTest {

    @Test
    void normalizeBillCategoryMapsUtilityBillsToBillPayment() {
        assertEquals(PaymentCategoryUtil.BILL_PAYMENT, PaymentCategoryUtil.normalizeBillCategory("Electricity"));
        assertEquals(PaymentCategoryUtil.BILL_PAYMENT, PaymentCategoryUtil.normalizeBillCategory("GAS/LPG"));
    }

    @Test
    void normalizeBillCategoryMapsRechargeAndTravelTypes() {
        assertEquals(PaymentCategoryUtil.RECHARGE_PAYMENT, PaymentCategoryUtil.normalizeBillCategory("mobile"));
        assertEquals(PaymentCategoryUtil.TRAVEL_PAYMENT, PaymentCategoryUtil.normalizeBillCategory("Metro"));
    }

    @Test
    void normalizeBillCategoryMapsCardEmiAndInsuranceTypes() {
        assertEquals(PaymentCategoryUtil.CARD_PAYMENT, PaymentCategoryUtil.normalizeBillCategory("credit card"));
        assertEquals(PaymentCategoryUtil.EMI_PAYMENT, PaymentCategoryUtil.normalizeBillCategory("Loan EMI"));
        assertEquals(PaymentCategoryUtil.INSURANCE_PAYMENT, PaymentCategoryUtil.normalizeBillCategory("Insurance"));
    }

    @Test
    void normalizeBillCategoryUsesReadableFallback() {
        assertEquals("Education Fees", PaymentCategoryUtil.normalizeBillCategory("education_fees"));
        assertEquals(PaymentCategoryUtil.BILL_PAYMENT, PaymentCategoryUtil.normalizeBillCategory(" "));
    }
}
