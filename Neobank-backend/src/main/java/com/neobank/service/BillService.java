package com.neobank.service;

import com.neobank.dto.BillDTO;
import com.neobank.dto.BillPaymentRequest;
import com.neobank.dto.BillRequest;

import java.util.List;

public interface BillService {
    BillDTO createBill(Long userId, BillRequest request);

    List<BillDTO> getBillsForUser(Long userId);

    List<BillDTO> getUpcomingBills(Long userId);

    List<BillDTO> getOverdueBills(Long userId);

    BillDTO getBillById(Long billId, Long userId);

    BillDTO payBill(Long userId, Long billId);

    BillDTO createAndPayBill(Long userId, BillPaymentRequest request);

    BillDTO updateBillStatus(Long billId, Long userId, String status);
}
