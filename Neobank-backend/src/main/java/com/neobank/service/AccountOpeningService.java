package com.neobank.service;

import com.neobank.dto.AccountOpeningRequest;
import com.neobank.dto.AccountOpeningResponse;
import com.neobank.dto.ApproveAccountRequest;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface AccountOpeningService {
    AccountOpeningResponse submitApplication(AccountOpeningRequest request, MultipartFile aadhaarFile,
            MultipartFile panFile, MultipartFile photoFile);

    List<AccountOpeningResponse> getPendingApplications();

    List<AccountOpeningResponse> getAllApplications();

    AccountOpeningResponse approveApplication(Long applicationId, ApproveAccountRequest request);

    AccountOpeningResponse rejectApplication(Long applicationId, String reason);
}
