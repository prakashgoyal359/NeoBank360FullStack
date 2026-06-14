package com.neobank.security;

import com.neobank.entity.SystemAuditLog;
import com.neobank.entity.User;
import com.neobank.repository.UserRepository;
import com.neobank.service.SystemAuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;

@Aspect
@Component
@RequiredArgsConstructor
public class AuditLogAspect {

    private final SystemAuditLogService auditLogService;
    private final UserRepository userRepository;

    @Around("within(@org.springframework.web.bind.annotation.RestController *)")
    public Object auditControllerCall(ProceedingJoinPoint joinPoint) throws Throwable {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs == null) {
            return joinPoint.proceed();
        }

        HttpServletRequest request = attrs.getRequest();
        long start = System.currentTimeMillis();
        int responseStatus = 200;
        String errorMessage = null;
        try {
            Object result = joinPoint.proceed();
            if (result instanceof ResponseEntity<?> response) {
                responseStatus = response.getStatusCode().value();
            }
            return result;
        } catch (Throwable ex) {
            responseStatus = resolveErrorStatus(ex);
            errorMessage = sanitize(ex.getMessage());
            throw ex;
        } finally {
            SystemAuditLog log = buildLog(request, joinPoint, responseStatus,
                    System.currentTimeMillis() - start, errorMessage);
            auditLogService.save(log);
        }
    }

    private SystemAuditLog buildLog(HttpServletRequest request, ProceedingJoinPoint joinPoint, int status,
            long executionTimeMs, String errorMessage) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication != null && authentication.isAuthenticated()
                ? authentication.getName()
                : null;
        User user = username != null ? userRepository.findByUsername(username).orElse(null) : null;

        return SystemAuditLog.builder()
                .endpoint(request.getRequestURI())
                .httpMethod(request.getMethod())
                .responseStatus(status)
                .executionTimeMs(executionTimeMs)
                .actingUserId(user != null ? user.getId() : null)
                .actingUsername(user != null ? user.getUsername() : username)
                .eventType(resolveEventType(request.getRequestURI(), request.getMethod(), joinPoint.getSignature().getName()))
                .eventTimestamp(LocalDateTime.now())
                .errorMessage(errorMessage)
                .build();
    }

    private int resolveErrorStatus(Throwable ex) {
        String simpleName = ex.getClass().getSimpleName();
        if (simpleName.contains("AccessDenied")) {
            return 403;
        }
        if (simpleName.contains("NotFound")) {
            return 404;
        }
        if (simpleName.contains("BadRequest") || simpleName.contains("Validation")) {
            return 400;
        }
        return 500;
    }

    private String resolveEventType(String uri, String method, String methodName) {
        String path = uri == null ? "" : uri.toLowerCase();
        if (path.contains("/auth/login")) return "LOGIN";
        if (path.contains("/transfer")) return "MONEY_TRANSFER";
        if (path.contains("/budgets")) return method.equalsIgnoreCase("POST") ? "BUDGET_CREATION" : "BUDGET_ACCESS";
        if (path.contains("/bills") && path.contains("/pay")) return "BILL_PAYMENT";
        if (path.contains("/loans/apply")) return "LOAN_APPLICATION";
        if (path.contains("/decision")) return "LOAN_APPROVAL_DECISION";
        if (path.contains("/admin/users")) return "USER_UPDATE_OR_ACCESS";
        if (path.contains("/admin")) return "ADMIN_ACTION";
        return methodName == null ? "API_REQUEST" : methodName.toUpperCase();
    }

    private String sanitize(String message) {
        if (message == null) {
            return null;
        }
        String sanitized = message.replaceAll("(?i)(password|token|aadhaar|pan)[^,;\\n]*", "$1=[REDACTED]");
        return sanitized.length() > 1000 ? sanitized.substring(0, 1000) : sanitized;
    }
}
