package com.example.usermanagementservice.exception;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;
@ExtendWith(MockitoExtension.class)
class UserManagementExceptionHandlerTest {
    @Test
    public void testHandleAccountException() {
        // Arrange
        UserManagementExceptionHandler exceptionHandler = new UserManagementExceptionHandler();
        AccountException accountException = new AccountException("Test error message");

        // Act
        ResponseEntity<String> responseEntity = exceptionHandler.handleAccountException(accountException);

        // Assert
        assertEquals(HttpStatus.BAD_REQUEST, responseEntity.getStatusCode(), "HTTP status should be 400");
        assertEquals("Error : \nTest error message", responseEntity.getBody(), "Response body should match");
    }
}