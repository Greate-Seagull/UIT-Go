package microservice.notification_service.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class RabbitMQConfig {
    private final ApplicationProperties properties;

    RabbitMQConfig(ApplicationProperties properties) {
        this.properties = properties;
    }

    @Bean
    DirectExchange exchange() {
        return new DirectExchange(properties.tripEventsExchange());
    }

    @Bean
    Queue tripCreatedQueue() {
        return QueueBuilder.durable(properties.tripCreatedQueue()).build();
    }

    @Bean
    Binding tripCreatedQueueBinding() {
        return BindingBuilder.bind(tripCreatedQueue()).to(exchange()).with(properties.tripCreatedQueue());
    }

    @Bean
    Queue tripCancelledQueue() {
        return QueueBuilder.durable(properties.tripCancelledQueue()).build();
    }

    @Bean
    Binding tripCancelledQueueBinding() {
        return BindingBuilder.bind(tripCancelledQueue()).to(exchange()).with(properties.tripCancelledQueue());
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, ObjectMapper objectMapper) {
        final var rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jacksonConverter(objectMapper));
        return rabbitTemplate;
    }

    @Bean
    public Jackson2JsonMessageConverter jacksonConverter(ObjectMapper mapper) {
        return new Jackson2JsonMessageConverter(mapper);
    }
}
