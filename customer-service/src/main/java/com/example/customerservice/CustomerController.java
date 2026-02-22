package com.example.customerservice;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customers")
@CrossOrigin(origins = "*")
public class CustomerController {

    private static final Logger log = LoggerFactory.getLogger(CustomerController.class);

    private final CustomerRepository repository;

    public CustomerController(CustomerRepository repository) {
        this.repository = repository;
        log.info("CustomerController initialized");
    }

    @GetMapping
    public ResponseEntity<List<Customer>> getAll() {
        log.info("GET /api/v1/customers - Fetching all customers");
        List<Customer> customers = repository.findAll();
        log.debug("Found {} customers", customers.size());
        return ResponseEntity.ok(customers);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Customer> getById(@PathVariable Long id) {
        log.info("GET /api/v1/customers/{} - Fetching customer by ID", id);
        return repository.findById(id)
                .map(c -> {
                    log.debug("Customer found with ID: {}", id);
                    return ResponseEntity.ok(c);
                })
                .orElseGet(() -> {
                    log.warn("Customer not found with ID: {}", id);
                    return ResponseEntity.notFound().build();
                });
    }

    @PostMapping
    public ResponseEntity<Customer> create(@RequestBody Customer customer) {
        log.info("POST /api/v1/customers - Creating new customer");
        Customer saved = repository.save(customer);
        log.info("Customer created with ID: {}", saved.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Customer> update(@PathVariable Long id, @RequestBody Customer updated) {
        log.info("PUT /api/v1/customers/{} - Updating customer", id);
        return repository.findById(id)
                .map(existing -> {
                    updated.setId(id);
                    Customer saved = repository.save(updated);
                    log.info("Customer updated with ID: {}", id);
                    return ResponseEntity.ok(saved);
                })
                .orElseGet(() -> {
                    log.warn("Customer not found for update with ID: {}", id);
                    return ResponseEntity.notFound().build();
                });
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("DELETE /api/v1/customers/{} - Deleting customer", id);
        if (!repository.existsById(id)) {
            log.warn("Customer not found for deletion with ID: {}", id);
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        log.info("Customer deleted with ID: {}", id);
        return ResponseEntity.noContent().build();
    }
}
