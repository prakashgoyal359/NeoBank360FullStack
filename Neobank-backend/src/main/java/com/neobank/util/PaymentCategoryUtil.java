package com.neobank.util;

import java.util.Locale;

public final class PaymentCategoryUtil {

    public static final String BILL_PAYMENT = "Bill Payment";
    public static final String RECHARGE_PAYMENT = "Recharge Payment";
    public static final String CARD_PAYMENT = "Card Payment";
    public static final String EMI_PAYMENT = "EMI Payment";
    public static final String INSURANCE_PAYMENT = "Insurance Payment";
    public static final String TRAVEL_PAYMENT = "Travel Payment";

    private PaymentCategoryUtil() {
    }

    public static String normalizeBillCategory(String category) {
        if (category == null || category.isBlank()) {
            return BILL_PAYMENT;
        }

        String normalized = category.trim().toUpperCase(Locale.ROOT)
                .replace("/", "_")
                .replace(" ", "_");
        return switch (normalized) {
            case "ELECTRICITY", "WATER", "GAS", "LPG", "GAS_LPG" -> BILL_PAYMENT;
            case "BROADBAND", "INTERNET", "MOBILE", "DTH", "RECHARGE" -> RECHARGE_PAYMENT;
            case "CREDIT_CARD", "CARD" -> CARD_PAYMENT;
            case "LOAN", "LOAN_EMI", "EMI" -> EMI_PAYMENT;
            case "INSURANCE" -> INSURANCE_PAYMENT;
            case "METRO", "BUS", "TRAIN", "TRAVEL" -> TRAVEL_PAYMENT;
            default -> toTitleCase(category);
        };
    }

    private static String toTitleCase(String value) {
        String[] parts = value.trim().replace("_", " ").toLowerCase(Locale.ROOT).split("\\s+");
        StringBuilder result = new StringBuilder();
        for (String part : parts) {
            if (part.isBlank()) {
                continue;
            }
            if (!result.isEmpty()) {
                result.append(' ');
            }
            result.append(Character.toUpperCase(part.charAt(0))).append(part.substring(1));
        }
        return result.isEmpty() ? BILL_PAYMENT : result.toString();
    }
}
