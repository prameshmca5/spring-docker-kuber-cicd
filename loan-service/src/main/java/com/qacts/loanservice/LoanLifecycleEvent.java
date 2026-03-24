package com.qacts.loanservice;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "loan_lifecycle_events")
public class LoanLifecycleEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long loanId;
    private String eventType;
    private String description;
    private LocalDateTime eventDate;
    private String performedBy;

    @PrePersist
    void onCreate() {
        if (eventDate == null) {
            eventDate = LocalDateTime.now();
        }
        if (performedBy == null || performedBy.isBlank()) {
            performedBy = "SYSTEM";
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getLoanId() {
        return loanId;
    }

    public void setLoanId(Long loanId) {
        this.loanId = loanId;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getEventDate() {
        return eventDate;
    }

    public void setEventDate(LocalDateTime eventDate) {
        this.eventDate = eventDate;
    }

    public String getPerformedBy() {
        return performedBy;
    }

    public void setPerformedBy(String performedBy) {
        this.performedBy = performedBy;
    }
}
