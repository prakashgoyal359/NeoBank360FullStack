package com.neobank.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String mobileNumber;
    private String role;
    private Boolean isActive;
    private Boolean isApproved;
}
