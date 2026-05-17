package com.neobank.service;

import com.neobank.dto.MoneyTransferRequest;

public interface MoneyTransferService {
    void transfer(MoneyTransferRequest request, String senderUsername);
}
