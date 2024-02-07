package com.example.usermanagementservice.service;

import com.example.usermanagementservice.model.Session;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import static org.assertj.core.api.AssertionsForInterfaceTypes.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class PageEventProducerTest {
    private PageEventProducer pageEventProducer;
    @Mock
    private  KafkaTemplate<String, Session> kafkaTemplate;
    @Mock
    private  KafkaTemplate<String, String> kafkaTemplate2;
    @Mock
    private  KafkaTemplate<String, String> kafkaTemplate3;

    @Test
    void sendSessionEvent() {
        // Given

        PageEventProducer pageEventProducer = new PageEventProducer(kafkaTemplate, null,null);
        Session session = new Session();

        // When
        pageEventProducer.sendSessionEvent(session);

        // Then
        ArgumentCaptor<String> topicCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<Session> sessionCaptor = ArgumentCaptor.forClass(Session.class);
        verify(kafkaTemplate, times(2)).send(topicCaptor.capture(), sessionCaptor.capture());

        // Assert that the correct topics are used
        assertThat(topicCaptor.getAllValues()).containsExactlyInAnyOrder("session-topic1", "session-topic2");

        // Assert that the correct session object is sent
        assertThat(sessionCaptor.getAllValues()).containsExactly(session, session);
    }

    @Test
    void sendSessionLogOut() {
        // Given
        PageEventProducer pageEventProducer = new PageEventProducer(null, kafkaTemplate2,null);
        String sessionInfo = "logout-info";

        // When
        pageEventProducer.sendSessionLogOut(sessionInfo);

        // Then
        ArgumentCaptor<String> topicCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> sessionInfoCaptor = ArgumentCaptor.forClass(String.class);
        verify(kafkaTemplate2, times(2)).send(topicCaptor.capture(), sessionInfoCaptor.capture());

        // Assert that the correct topics are used
        assertThat(topicCaptor.getAllValues()).containsExactlyInAnyOrder("sessionLogOut-topic1", "sessionLogOut-topic2");

        // Assert that the correct session info is sent
        assertThat(sessionInfoCaptor.getAllValues()).containsExactly(sessionInfo, sessionInfo);
    }
    @Test
    void sendSessionLocationEvent() {
        // Given
        PageEventProducer pageEventProducer = new PageEventProducer(null, null,kafkaTemplate3);
        String sessionInfo = "location-info";

        // When
        pageEventProducer.sendSessionLocationEvent(sessionInfo);

        // Then
        ArgumentCaptor<String> topicCaptor = ArgumentCaptor.forClass(String.class);
        ArgumentCaptor<String> sessionInfoCaptor = ArgumentCaptor.forClass(String.class);
        verify(kafkaTemplate3, times(2)).send(topicCaptor.capture(), sessionInfoCaptor.capture());

        // Assert that the correct topics are used
        assertThat(topicCaptor.getAllValues()).containsExactlyInAnyOrder("sessionLocation-topic1", "sessionLocation-topic2");

        // Assert that the correct session info is sent
        assertThat(sessionInfoCaptor.getAllValues()).containsExactly(sessionInfo, sessionInfo);
    }
}