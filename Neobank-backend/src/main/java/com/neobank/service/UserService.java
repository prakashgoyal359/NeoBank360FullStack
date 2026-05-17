package com.neobank.service;

import com.neobank.dto.UserDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {
    Page<UserDTO> getUsers(Pageable pageable, String search);

    UserDTO updateUser(Long userId, UserDTO userDTO);

    void deleteUser(Long userId);

    void toggleUserStatus(Long userId, boolean active);
}
