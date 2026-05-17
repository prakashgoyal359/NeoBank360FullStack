package com.neobank.service;

import com.neobank.entity.Notification;

import java.util.List;

public interface NotificationService {
    Notification createNotification(Long userId, String title, String message);

    List<Notification> getNotificationsForUser(Long userId);

    List<Notification> getUnreadNotifications(Long userId);

    void markAsRead(Long notificationId, Long userId);

    void markAllAsRead(Long userId);

    void deleteNotification(Long notificationId, Long userId);
}