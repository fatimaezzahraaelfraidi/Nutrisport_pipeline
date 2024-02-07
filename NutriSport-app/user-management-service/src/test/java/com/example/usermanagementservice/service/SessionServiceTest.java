package com.example.usermanagementservice.service;

import com.example.usermanagementservice.model.Account;
import com.example.usermanagementservice.model.Session;
import com.example.usermanagementservice.repository.SessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SessionServiceTest {

    private SessionService sessionService;
    @Mock
    private SessionRepository sessionRepository;
    @Mock
    private  PageEventProducer pageEventProducer;
    @BeforeEach
    void setUp(){

        sessionService=new SessionService(sessionRepository,pageEventProducer);
    }
    @Test

    void createSession() {
        // Given
        Session sessionToSave = new Session(/* Initialize with necessary parameters */);
        Session savedSession = new Session(/* Initialize with necessary parameters */);
        when(sessionRepository.save(sessionToSave)).thenReturn(savedSession);



        SessionService sessionService = new SessionService(sessionRepository, pageEventProducer);

        // When
        Session createdSession = sessionService.createSession(sessionToSave);

        // Then
        verify(sessionRepository).save(sessionToSave); // Verifies that sessionRepository.save was called with the correct session

        ArgumentCaptor<Session> sessionArgumentCaptor = ArgumentCaptor.forClass(Session.class);
        verify(pageEventProducer).sendSessionEvent(sessionArgumentCaptor.capture()); // Verifies that sendSessionEvent was called with the correct session
        Session capturedSession = sessionArgumentCaptor.getValue();
        assertThat(capturedSession).isEqualTo(savedSession); // Verifies that the captured session matches the saved session

        assertThat(createdSession).isEqualTo(savedSession); // Verifies that the returned session is the same as the saved session
    }


    @Test

    void testCreateSession() {
        // Given
        Account mockAccount = mock(Account.class);
        String token = "testToken";
        String fcmToken = "testFcmToken";
        Date startTime = new Date();
        Date endTime = new Date();
        boolean isAuthenticated = true;

        SessionService spySessionService = spy(new SessionService(sessionRepository, pageEventProducer));
        // Mocking the behavior of the createSession method to return the provided session
        doAnswer(invocation -> invocation.getArgument(0)).when(spySessionService).createSession(any(Session.class));

        // When
        Session createdSession = spySessionService.createSession(mockAccount, token, fcmToken, startTime, endTime, isAuthenticated);

        // Then
        assertThat(createdSession.getAccount()).isEqualTo(mockAccount);
        assertThat(createdSession.getToken()).isEqualTo(token);
        assertThat(createdSession.getStartTime()).isEqualTo(startTime);
        assertThat(createdSession.getEndTime()).isEqualTo(endTime);
        assertThat(createdSession.getFcmToken()).isEqualTo(fcmToken);
        assertThat(createdSession.getIsAuthenticated()).isEqualTo(isAuthenticated);
    }


    @Test

    void getSessionByToken() {
        // Given
        String token = "testToken";
        Session expectedSession = new Session();
        when(sessionRepository.findByToken(token)).thenReturn(Optional.of(expectedSession));

        // When
        Optional<Session> result = sessionService.getSessionByToken(token);

        // Then
        assertTrue(result.isPresent()); // Check if result is present
        assertEquals(expectedSession, result.get()); // Check if the returned session matches the expected session
    }


    @Test

    void deleteSessionByToken() {
        // Given
        String token = "testToken";

        // When
        sessionService.deleteSessionByToken(token);

        // Then
        ArgumentCaptor<String> tokenCaptor = ArgumentCaptor.forClass(String.class);
        verify(sessionRepository).deleteByToken(tokenCaptor.capture());
        assertEquals(token, tokenCaptor.getValue());
    }



    @Test

    void getSessionsByAccountId() {
        // Given
        Long accountId = 1L;
        List<Session> expectedSessions = Arrays.asList(
                new Session(),
                new Session()
        );
        when(sessionRepository.findByAccount_Id(accountId)).thenReturn(expectedSessions);

        // When
        List<Session> resultSessions = sessionService.getSessionsByAccountId(accountId);

        // Then
        ArgumentCaptor<Long> accountIdCaptor = ArgumentCaptor.forClass(Long.class);
        verify(sessionRepository).findByAccount_Id(accountIdCaptor.capture());
        assertThat(accountIdCaptor.getValue()).isEqualTo(accountId);
        assertThat(resultSessions).isEqualTo(expectedSessions);
    }


    @Test
    void save() {
        //given
        Session session= new Session(
                1L,null,null,"aaa",true,"aaaa",null,null);
        sessionService.save(session);
        //then
        ArgumentCaptor<Session> sessionArgumentCaptor =
                ArgumentCaptor.forClass(Session.class);
        verify(sessionRepository)
                .save(sessionArgumentCaptor.capture());
        Session capturedSession = sessionArgumentCaptor.getValue();
        assertThat(capturedSession).isEqualTo(session);
    }

    @Test

    void saveAndFlush() {
        // Given
        Session sessionToSave = new Session();

        // When
        sessionService.saveAndFlush(sessionToSave);

        // Then
        ArgumentCaptor<Session> sessionArgumentCaptor = ArgumentCaptor.forClass(Session.class);
        verify(sessionRepository).save(sessionArgumentCaptor.capture());
        Session capturedSession = sessionArgumentCaptor.getValue();
        assertThat(capturedSession).isEqualTo(sessionToSave);
    }

}
