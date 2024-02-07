package com.example.usermanagementservice.service;


import com.example.usermanagementservice.model.Session;
import lombok.AllArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class PageEventProducer {
    private final KafkaTemplate<String, Session> kafkaTemplate;
    private final KafkaTemplate<String, String> kafkaTemplate2;
    private final KafkaTemplate<String, String> kafkaTemplate3;


    public void sendSessionEvent(Session session) {
        System.out.println("Producing Session event: " + session.toString());
        kafkaTemplate.send("session-topic1", session);
        kafkaTemplate.send("session-topic2", session);
    }

    public void sendSessionLogOut(String sessionInfo) {
        System.out.println("Producing Session logOut: " + sessionInfo);
        kafkaTemplate2.send("sessionLogOut-topic1", sessionInfo);
        kafkaTemplate2.send("sessionLogOut-topic2", sessionInfo);
    }

    public void sendSessionLocationEvent(String message) {
        kafkaTemplate3.send("sessionLocation-topic1", message);
        kafkaTemplate3.send("sessionLocation-topic2", message);
    }



}
