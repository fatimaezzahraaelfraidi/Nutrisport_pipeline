package com.example.usermanagementservice.config;

import com.example.usermanagementservice.model.Session;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;

import static org.junit.jupiter.api.Assertions.*;
@ExtendWith(MockitoExtension.class)
class KafkaConfigTest {
    @Test
    public void testProducerFactory() {
        KafkaConfig kafkaConfig = new KafkaConfig();
        ProducerFactory<String, Session> producerFactory = kafkaConfig.producerFactory();

        assertNotNull(producerFactory, "ProducerFactory should not be null");
    }

    @Test
    public void testProducerFactory2() {
        KafkaConfig kafkaConfig = new KafkaConfig();
        ProducerFactory<String, String> producerFactory2 = kafkaConfig.producerFactory2();

        assertNotNull(producerFactory2, "ProducerFactory2 should not be null");
    }
    @Test
    public void testProducerFactory3() {
        KafkaConfig kafkaConfig = new KafkaConfig();
        ProducerFactory<String, String> producerFactory3 = kafkaConfig.producerFactory3();

        assertNotNull(producerFactory3, "ProducerFactory3 should not be null");
    }
    @Test
    public void testKafkaTemplate() {
        KafkaConfig kafkaConfig = new KafkaConfig();
        KafkaTemplate<String, Session> kafkaTemplate = kafkaConfig.kafkaTemplate();

        assertNotNull(kafkaTemplate, "KafkaTemplate should not be null");
    }

    @Test
    public void testKafkaTemplate2() {
        KafkaConfig kafkaConfig = new KafkaConfig();
        KafkaTemplate<String, String> kafkaTemplate2 = kafkaConfig.kafkaTemplate2();

        assertNotNull(kafkaTemplate2, "KafkaTemplate2 should not be null");
    }
    @Test
    public void testKafkaTemplate3() {
        KafkaConfig kafkaConfig = new KafkaConfig();
        KafkaTemplate<String, String> kafkaTemplate3 = kafkaConfig.kafkaTemplate3();

        assertNotNull(kafkaTemplate3, "KafkaTemplate3 should not be null");
    }
}