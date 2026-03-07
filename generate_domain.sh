#!/bin/bash
set -e

PARENT_DIR="/Users/rohit/JavaApplication/springbootapps"
cd $PARENT_DIR

# ---------------------------------------------------------
# account-service
# ---------------------------------------------------------
PKG="com.qacts.accountservice"
DIR="account-service/src/main/java/com/qacts/accountservice"

cat <<EOF > $DIR/Account.java
package $PKG;
import jakarta.persistence.*;

@Entity
@Table(name = "accounts")
public class Account {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long customerId;
    private Double balance;
    private String accountType;

    public Account() {}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public Double getBalance() { return balance; }
    public void setBalance(Double balance) { this.balance = balance; }
    public String getAccountType() { return accountType; }
    public void setAccountType(String accountType) { this.accountType = accountType; }
}
EOF

cat <<EOF > $DIR/AccountRepository.java
package $PKG;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByCustomerId(Long customerId);
}
EOF

cat <<EOF > $DIR/AccountController.java
package $PKG;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/accounts")
public class AccountController {
    private final AccountRepository repository;
    public AccountController(AccountRepository repository) { this.repository = repository; }

    @GetMapping
    public List<Account> getAll() { return repository.findAll(); }
    
    @PostMapping
    public Account create(@RequestBody Account acc) { return repository.save(acc); }
}
EOF

# ---------------------------------------------------------
# customer-service
# ---------------------------------------------------------
PKG="com.qacts.customerservice"
DIR="customer-service/src/main/java/com/qacts/customerservice"

cat <<EOF > $DIR/Customer.java
package $PKG;
import jakarta.persistence.*;

@Entity
@Table(name = "customers")
public class Customer {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String firstName;
    private String lastName;
    private String email;

    public Customer() {}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
EOF

cat <<EOF > $DIR/CustomerRepository.java
package $PKG;
import org.springframework.data.jpa.repository.JpaRepository;
public interface CustomerRepository extends JpaRepository<Customer, Long> {}
EOF

cat <<EOF > $DIR/CustomerController.java
package $PKG;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/customers")
public class CustomerController {
    private final CustomerRepository repository;
    public CustomerController(CustomerRepository repository) { this.repository = repository; }

    @GetMapping
    public List<Customer> getAll() { return repository.findAll(); }
    
    @PostMapping
    public Customer create(@RequestBody Customer customer) { return repository.save(customer); }
}
EOF

# ---------------------------------------------------------
# transaction-service
# ---------------------------------------------------------
PKG="com.qacts.transactionservice"
DIR="transaction-service/src/main/java/com/qacts/transactionservice"

cat <<EOF > $DIR/BankTransaction.java
package $PKG;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bank_transactions")
public class BankTransaction {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long accountId;
    private Double amount;
    private String type;
    private LocalDateTime timestamp = LocalDateTime.now();

    public BankTransaction() {}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getAccountId() { return accountId; }
    public void setAccountId(Long accountId) { this.accountId = accountId; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
EOF

cat <<EOF > $DIR/TransactionRepository.java
package $PKG;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface TransactionRepository extends JpaRepository<BankTransaction, Long> {
    List<BankTransaction> findByAccountId(Long accountId);
}
EOF

cat <<EOF > $DIR/TransactionController.java
package $PKG;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/transactions")
public class TransactionController {
    private final TransactionRepository repository;
    public TransactionController(TransactionRepository repository) { this.repository = repository; }

    @GetMapping
    public List<BankTransaction> getAll() { return repository.findAll(); }
    
    @PostMapping
    public BankTransaction create(@RequestBody BankTransaction tx) { return repository.save(tx); }
}
EOF

# ---------------------------------------------------------
# notification-service
# ---------------------------------------------------------
PKG="com.qacts.notificationservice"
DIR="notification-service/src/main/java/com/qacts/notificationservice"

cat <<EOF > $DIR/Notification.java
package $PKG;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long customerId;
    private String message;
    private LocalDateTime timestamp = LocalDateTime.now();

    public Notification() {}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
EOF

cat <<EOF > $DIR/NotificationRepository.java
package $PKG;
import org.springframework.data.jpa.repository.JpaRepository;
public interface NotificationRepository extends JpaRepository<Notification, Long> {}
EOF

cat <<EOF > $DIR/NotificationController.java
package $PKG;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {
    private final NotificationRepository repository;
    public NotificationController(NotificationRepository repository) { this.repository = repository; }

    @GetMapping
    public List<Notification> getAll() { return repository.findAll(); }
    
    @PostMapping
    public Notification create(@RequestBody Notification n) { return repository.save(n); }
}
EOF

# ---------------------------------------------------------
# payment-service
# ---------------------------------------------------------
PKG="com.qacts.paymentservice"
DIR="payment-service/src/main/java/com/qacts/paymentservice"

cat <<EOF > $DIR/Payment.java
package $PKG;
import jakarta.persistence.*;

@Entity
@Table(name = "payments")
public class Payment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long accountId;
    private Double amount;
    private String status;

    public Payment() {}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getAccountId() { return accountId; }
    public void setAccountId(Long accountId) { this.accountId = accountId; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
EOF

cat <<EOF > $DIR/PaymentRepository.java
package $PKG;
import org.springframework.data.jpa.repository.JpaRepository;
public interface PaymentRepository extends JpaRepository<Payment, Long> {}
EOF

cat <<EOF > $DIR/PaymentController.java
package $PKG;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {
    private final PaymentRepository repository;
    public PaymentController(PaymentRepository repository) { this.repository = repository; }

    @GetMapping
    public List<Payment> getAll() { return repository.findAll(); }
    
    @PostMapping
    public Payment create(@RequestBody Payment p) { return repository.save(p); }
}
EOF

echo "All Java domain classes created successfully."
