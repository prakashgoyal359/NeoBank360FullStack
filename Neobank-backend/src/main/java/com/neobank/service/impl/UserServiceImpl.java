package com.neobank.service.impl;

import com.neobank.dto.UserDTO;
import com.neobank.entity.User;
import com.neobank.exception.BadRequestException;
import com.neobank.exception.ResourceNotFoundException;
import com.neobank.repository.UserRepository;
import com.neobank.service.AuditLogService;
import com.neobank.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    @Override
    public Page<UserDTO> getUsers(Pageable pageable, String search) {
        Page<User> page;
        if (search != null && !search.isBlank()) {
            page = userRepository.findAll(pageable).map(user -> user);
        } else {
            page = userRepository.findAll(pageable);
        }
        List<UserDTO> users = page.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
        return new PageImpl<>(users, pageable, page.getTotalElements());
    }

    @Override
    public UserDTO updateUser(Long userId, UserDTO userDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (userDTO.getEmail() != null) {
            user.setEmail(userDTO.getEmail());
        }
        if (userDTO.getFullName() != null) {
            user.setFullName(userDTO.getFullName());
        }
        if (userDTO.getMobileNumber() != null) {
            user.setMobileNumber(userDTO.getMobileNumber());
        }
        if (userDTO.getIsActive() != null) {
            user.setIsActive(userDTO.getIsActive());
        }
        userRepository.save(user);
        return mapToDto(user);
    }

    @Override
    public void deleteUser(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        userRepository.deleteById(userId);
    }

    @Override
    public UserDTO toggleUserStatus(Long userId, boolean active, Long actingAdminId) {
        if (userId.equals(actingAdminId) && !active) {
            throw new BadRequestException("Admin cannot deactivate own account");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setIsActive(active);
        User saved = userRepository.save(user);
        auditLogService.log(actingAdminId, active ? "ACTIVATE_USER" : "DEACTIVATE_USER", "USER", String.valueOf(userId));
        return mapToDto(saved);
    }

    private UserDTO mapToDto(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .mobileNumber(user.getMobileNumber())
                .role(user.getRole().name())
                .isActive(user.getIsActive())
                .isApproved(user.getIsApproved())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
