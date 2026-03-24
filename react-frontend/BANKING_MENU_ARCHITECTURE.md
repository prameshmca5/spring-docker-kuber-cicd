# Banking Menu Architecture

## Goal
Add a full customer banking menu structure for:

1. Account
2. Credit Card
3. Transfer
4. Loans
5. Payments

The frontend now has dedicated routes and menu definitions for every requested submenu. This document describes the backend architecture and tooling required to finish the end-to-end implementation.

## Frontend Structure

Frontend stack:

- React 19
- Vite
- React Router
- Axios
- lucide-react

New frontend building blocks:

- `src/config/bankingMenu.js`
  Single source of truth for menu hierarchy, route paths, API contracts, entities, and tool recommendations.
- `src/components/BankingSectionPage.jsx`
  Section-level landing page for each domain.
- `src/components/BankingWorkspacePage.jsx`
  Submenu workspace page for architecture, preview data, and delivery notes.

## Menu to Service Mapping

### Account

- Account Summary
  Primary service: `account-service`
  Supporting service: `transaction-service`
  Main APIs: `GET /api/v1/accounts/customer/{customerId}`, `GET /api/v1/accounts/{id}`
- Account Details
  Primary service: `account-service`
  Main APIs: `GET /api/v1/accounts/{id}`
- Transaction History
  Primary service: `transaction-service`
  Supporting service: `account-service`
  Main APIs: `GET /api/v1/transactions/account/{accountId}`
- View Standing Orders
  Recommended new API surface:
  `GET /api/v1/standing-orders`
  `POST /api/v1/standing-orders`
  `PATCH /api/v1/standing-orders/{id}/status`

### Credit Card

- Card Summary
- Card Details
- Transaction History

Recommended new microservice: `card-service`

Recommended core APIs:

- `GET /api/v1/cards/customer/{customerId}`
- `GET /api/v1/cards/{cardId}`
- `GET /api/v1/cards/{cardId}/summary`
- `GET /api/v1/cards/{cardId}/transactions`
- `PATCH /api/v1/cards/{cardId}/controls`

Recommended entities:

- `credit_cards`
- `card_limits`
- `card_controls`
- `card_transactions`
- `statement_cycles`

### Transfer

- Between Own Accounts
  Primary service: `transaction-service`
  API: `POST /api/v1/transfers/internal`
- International Transfer
  Primary service: `payment-service`
  Recommended support: compliance / sanctions screening service
- Scheduled Transfers
  Recommended API:
  `GET /api/v1/transfers/scheduled`
  `POST /api/v1/transfers/scheduled`
  `PATCH /api/v1/transfers/scheduled/{id}`
- Local Transfer
  Primary service: `transaction-service`
  API: `POST /api/v1/transfers/local`
- One Time Local Transfer
  Primary service: `transaction-service`
  API: `POST /api/v1/transfers/local/one-time`

Recommended transfer entities:

- `transfers`
- `scheduled_transfers`
- `beneficiaries`
- `fx_quotes`
- `compliance_checks`

### Loans

- Loan Summary
- Loan Details
- Loan History
- Loan Repayment
- Loan Repayment History

Recommended new microservice: `loan-service`

Recommended APIs:

- `GET /api/v1/loans/customer/{customerId}`
- `GET /api/v1/loans/{loanId}`
- `GET /api/v1/loans/{loanId}/history`
- `GET /api/v1/loans/{loanId}/schedule`
- `POST /api/v1/loans`
- `POST /api/v1/loans/{loanId}/repayments`
- `GET /api/v1/loans/{loanId}/repayments`

Recommended loan entities:

- `loan_accounts`
- `loan_applications`
- `repayment_schedules`
- `loan_repayments`
- `collaterals`
- `loan_lifecycle_events`

### Payments

- Pay Bills
  Primary service: `payment-service`
  Recommended API: `POST /api/v1/payments/bills`
- Add Biller
  Recommended new service: `biller-service`
- Credit Card Payment
  Existing service: `payment-service`
  Existing APIs:
  `POST /api/v1/payments`
  `GET /api/v1/payments/account/{accountId}`
- Scheduled Payment
  Recommended new service: `schedule-service`

Recommended payment entities:

- `payments`
- `billers`
- `customer_billers`
- `scheduled_payments`
- `payment_execution_results`

## Existing Services to Reuse

Already available in this repository:

- `account-service`
- `transaction-service`
- `payment-service`
- `notification-service`
- `api-gateway`
- `auth-service`
- `common-service`

Services recommended to add:

- `card-service`
- `loan-service`
- `biller-service`
- `schedule-service`
- `sanctions-screening-service` or compliance module

## API Gateway Changes Needed

Update `api-gateway` routes for any new services:

- `/api/v1/cards/**`
- `/api/v1/loans/**`
- `/api/v1/billers/**`
- `/api/v1/transfers/**`
- `/api/v1/standing-orders/**`
- `/api/v1/payments/scheduled/**`

## Eventing

Publish Kafka events after successful business actions:

- `transfer.created`
- `transfer.scheduled`
- `standing-order.updated`
- `card.payment.created`
- `loan.application.created`
- `loan.repayment.created`
- `biller.created`

Use `notification-service` for customer alerts and `audit` flows for traceability.

## Development Tools

Recommended tools to build this menu set fully:

- IDE: IntelliJ IDEA for Spring Boot, VS Code or IntelliJ for React
- API design: Swagger / OpenAPI
- API testing: Postman
- Frontend: React Router, Axios, ESLint
- Backend: Spring Boot 3, Spring Cloud Gateway, Spring Data JPA, Feign
- Databases: MySQL or Postgres
- Messaging: Kafka
- Observability: Micrometer, Prometheus, Grafana, Jaeger
- Local runtime: Docker Desktop, Minikube, kubectl
- CI/CD: Jenkins, ArgoCD

## Suggested Delivery Order

1. Finish Account menu with real standing order APIs.
2. Finish Transfer menu using `transaction-service`.
3. Extend Payments with billers and scheduled payments.
4. Add `card-service` for credit card domain.
5. Add `loan-service` for full loan lifecycle and repayment flows.
