-- Insert Countries
INSERT IGNORE INTO countries (name, code) VALUES ('India', 'IN');
INSERT IGNORE INTO countries (name, code) VALUES ('United States', 'US');
INSERT IGNORE INTO countries (name, code) VALUES ('United Kingdom', 'GB');

-- Insert Account Types
INSERT IGNORE INTO account_types (name) VALUES ('Savings');
INSERT IGNORE INTO account_types (name) VALUES ('Checking');
INSERT IGNORE INTO account_types (name) VALUES ('Business');

-- Insert Customer Types
INSERT IGNORE INTO customer_types (name) VALUES ('Individual');
INSERT IGNORE INTO customer_types (name) VALUES ('Corporate');
INSERT IGNORE INTO customer_types (name) VALUES ('Government');

-- Insert Payment Types
INSERT IGNORE INTO payment_types (name) VALUES ('Credit Card');
INSERT IGNORE INTO payment_types (name) VALUES ('Wire Transfer');
INSERT IGNORE INTO payment_types (name) VALUES ('UPI');
INSERT IGNORE INTO payment_types (name) VALUES ('Cash');
