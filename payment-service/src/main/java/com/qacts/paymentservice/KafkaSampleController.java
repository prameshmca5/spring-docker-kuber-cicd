package com.qacts.paymentservice;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/kafka-sample")
@CrossOrigin(origins = "*")
public class KafkaSampleController {

    private final KafkaSampleService kafkaSampleService;

    public KafkaSampleController(KafkaSampleService kafkaSampleService) {
        this.kafkaSampleService = kafkaSampleService;
    }

    @PostMapping("/publish")
    public ResponseEntity<Map<String, String>> publish(@RequestBody Map<String, String> payload) {
        String content = payload.getOrDefault("content", "Empty message");
        kafkaSampleService.publishMessage(content);
        return ResponseEntity.ok(Map.of("status", "Message published successfully!"));
    }

    @GetMapping("/messages")
    public ResponseEntity<List<KafkaSampleMessage>> getMessages() {
        return ResponseEntity.ok(kafkaSampleService.getReceivedMessages());
    }
}
