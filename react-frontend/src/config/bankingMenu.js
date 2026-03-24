import {
  Activity,
  ArrowLeftRight,
  BarChart3,
  Bell,
  Building2,
  CalendarClock,
  CreditCard,
  FileText,
  Globe2,
  HandCoins,
  History,
  Landmark,
  LayoutDashboard,
  NotebookText,
  ReceiptText,
  Repeat2,
  ScrollText,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
} from 'lucide-react';

const CUSTOMER_SECTIONS = [
  {
    id: 'account',
    slug: 'account',
    label: 'Account',
    caption: 'Summary, servicing, and standing orders',
    description:
      'Customer account servicing workspace for portfolio summary, detailed views, transaction activity, and recurring debit instructions.',
    icon: Landmark,
    services: ['account-service', 'transaction-service', 'notification-service'],
    tools: ['React 19', 'React Router', 'Axios', 'Spring Boot 3', 'MySQL/Postgres', 'Kafka'],
    items: [
      {
        id: 'summary',
        slug: 'summary',
        label: 'Account Summary',
        icon: LayoutDashboard,
        status: 'Live API preview',
        description: 'Portfolio-level balances, active accounts, product mix, and quick account health indicators.',
        primaryService: 'account-service',
        apis: ['GET /api/v1/accounts/customer/{customerId}', 'GET /api/v1/accounts/{id}'],
        entities: ['Account', 'BalanceSnapshot', 'AccountStatus'],
        capabilities: ['Show total balance by customer', 'Highlight low-balance accounts', 'Expose product mix and active account count'],
        widgets: ['Balance cards', 'Account mix chart', 'Recent alerts'],
        dataSource: 'accounts',
        records: [
          { title: 'Operating Balance', detail: 'Available vs ledger balances across all linked accounts', meta: 'Customer portfolio', status: 'READY' },
          { title: 'Dormant Risk Watch', detail: 'Detect accounts with low activity and route alerts', meta: 'Operational alerting', status: 'PLANNED' },
        ],
      },
      {
        id: 'details',
        slug: 'details',
        label: 'Account Details',
        icon: FileText,
        status: 'Live API preview',
        description: 'Deep account drill-down for limits, account ownership, balances, and service configuration.',
        primaryService: 'account-service',
        apis: ['GET /api/v1/accounts/{id}', 'GET /api/v1/accounts/customer/{customerId}'],
        entities: ['Account', 'AccountHolder', 'AccountLimit'],
        capabilities: ['Inspect account profile and product attributes', 'Display balances and limits', 'Prepare customer servicing actions'],
        widgets: ['Account profile panel', 'Limit summary', 'Linked services'],
        dataSource: 'accounts',
        records: [
          { title: 'Account Holder Profile', detail: 'Primary holder, segment, KYC, and relationship status', meta: 'Service view', status: 'READY' },
          { title: 'Product Controls', detail: 'Overdraft, transfer thresholds, and notification preferences', meta: 'Configuration', status: 'PLANNED' },
        ],
      },
      {
        id: 'transaction-history',
        slug: 'transaction-history',
        label: 'Transaction History',
        icon: History,
        status: 'Live API preview',
        description: 'Unified activity timeline across customer accounts, including direction, value date, and transaction type.',
        primaryService: 'transaction-service',
        apis: ['GET /api/v1/transactions/account/{accountId}', 'GET /api/v1/accounts/customer/{customerId}'],
        entities: ['BankTransaction', 'TransactionType', 'Account'],
        capabilities: ['Aggregate transactions across all owned accounts', 'Sort and filter by latest activity', 'Support dispute and statement workflows'],
        widgets: ['Timeline table', 'Debit vs credit summary', 'Search and filters'],
        dataSource: 'transactions',
        records: [
          { title: 'Statement Export', detail: 'Download monthly or custom transaction statements', meta: 'Service request', status: 'PLANNED' },
          { title: 'Dispute Intake', detail: 'Raise transaction investigations from the history screen', meta: 'Case management', status: 'PLANNED' },
        ],
      },
      {
        id: 'standing-orders',
        slug: 'standing-orders',
        label: 'View Standing Orders',
        icon: Repeat2,
        status: 'Blueprint',
        description: 'Recurring debit instructions with schedule, beneficiary, execution status, and amendment controls.',
        primaryService: 'account-service',
        apis: ['GET /api/v1/standing-orders', 'POST /api/v1/standing-orders', 'PATCH /api/v1/standing-orders/{id}/status'],
        entities: ['StandingOrder', 'Beneficiary', 'ExecutionCalendar'],
        capabilities: ['List recurring account debits', 'Pause or resume instructions', 'Track next execution and failed runs'],
        widgets: ['Schedule calendar', 'Beneficiary list', 'Execution status feed'],
        records: [
          { title: 'SO-10045', detail: 'Monthly rent debit to Acme Properties', meta: '1st of every month | MYR 1,850', status: 'ACTIVE' },
          { title: 'SO-10087', detail: 'Savings sweep to emergency account', meta: 'Every Friday | MYR 300', status: 'PENDING' },
        ],
      },
    ],
  },
  {
    id: 'credit-card',
    slug: 'credit-card',
    label: 'Credit Card',
    caption: 'Card portfolio, billing, and spending',
    description:
      'Credit card domain for card summary, card profile, spending history, statement visibility, and servicing actions.',
    icon: CreditCard,
    services: ['card-service', 'transaction-service', 'payment-service', 'notification-service'],
    tools: ['React 19', 'React Router', 'Axios', 'Spring Boot 3', 'JPA', 'Kafka'],
    items: [
      {
        id: 'summary',
        slug: 'summary',
        label: 'Card Summary',
        icon: LayoutDashboard,
        status: 'Needs backend service',
        description: 'Portfolio summary for available limit, outstanding balance, next due amount, and delinquency indicators.',
        primaryService: 'card-service',
        apis: ['GET /api/v1/cards/customer/{customerId}', 'GET /api/v1/cards/{cardId}/summary'],
        entities: ['CreditCard', 'CardLimit', 'BillingCycle'],
        capabilities: ['Display total outstanding', 'Highlight cards nearing limit', 'Show next due payment and statement date'],
        widgets: ['Card tiles', 'Limit utilization', 'Payment due alert'],
        records: [
          { title: 'Visa Platinum', detail: 'Utilization 42% | Available limit MYR 17,400', meta: 'Next due 2026-04-05', status: 'DESIGN' },
          { title: 'Travel Rewards Card', detail: 'Outstanding MYR 2,980 | Cashback earned MYR 140', meta: 'Statement cycle open', status: 'DESIGN' },
        ],
      },
      {
        id: 'details',
        slug: 'details',
        label: 'Card Details',
        icon: FileText,
        status: 'Needs backend service',
        description: 'Detailed card profile including status, limits, billing profile, linked account, and control settings.',
        primaryService: 'card-service',
        apis: ['GET /api/v1/cards/{cardId}', 'PATCH /api/v1/cards/{cardId}/controls'],
        entities: ['CreditCard', 'CardControl', 'StatementPreference'],
        capabilities: ['View card profile and ownership', 'Manage card controls and status', 'Show billing and settlement settings'],
        widgets: ['Card profile', 'Settlement account mapping', 'Control toggles'],
        records: [
          { title: 'Linked Settlement Account', detail: 'Auto-debit from Premium Savings 101-88901', meta: 'Auto-pay enabled', status: 'READY' },
          { title: 'Card Controls', detail: 'International usage, online purchases, and ATM cash advance', meta: 'Risk controls', status: 'PLANNED' },
        ],
      },
      {
        id: 'transaction-history',
        slug: 'transaction-history',
        label: 'Transaction History',
        icon: ScrollText,
        status: 'Needs backend service',
        description: 'Card-specific transactions, authorizations, merchant categories, reversals, and statement line items.',
        primaryService: 'card-service',
        apis: ['GET /api/v1/cards/{cardId}/transactions', 'GET /api/v1/cards/{cardId}/statements/{cycleId}'],
        entities: ['CardTransaction', 'Merchant', 'StatementLine'],
        capabilities: ['List card spend by merchant and category', 'Expose pending and posted transactions', 'Support statement and dispute review'],
        widgets: ['Merchant list', 'Spend by category', 'Pending authorizations'],
        records: [
          { title: 'Hotel Aurora', detail: 'Posted travel expense for April statement', meta: 'Travel | MYR 1,480', status: 'POSTED' },
          { title: 'MetroFuel', detail: 'Pending fuel authorization waiting for settlement', meta: 'Transport | MYR 160', status: 'PENDING' },
        ],
      },
    ],
  },
  {
    id: 'transfer',
    slug: 'transfer',
    label: 'Transfer',
    caption: 'Own-account, local, international, and scheduled',
    description:
      'Funds movement domain for same-customer transfers, local transfers, scheduled instructions, and international remittance workflows.',
    icon: ArrowLeftRight,
    services: ['transaction-service', 'payment-service', 'notification-service', 'sanctions-screening-service'],
    tools: ['React 19', 'React Router', 'Axios', 'Spring Boot 3', 'Kafka', 'Redis'],
    items: [
      {
        id: 'between-own-accounts',
        slug: 'between-own-accounts',
        label: 'Between Own Accounts',
        icon: Repeat2,
        status: 'Hybrid',
        description: 'Immediate funds movement between customer-owned accounts with balance checks and instant confirmation.',
        primaryService: 'transaction-service',
        apis: ['POST /api/v1/transfers/internal', 'GET /api/v1/accounts/customer/{customerId}'],
        entities: ['InternalTransfer', 'Account', 'TransferLimit'],
        capabilities: ['Select source and destination from owned accounts', 'Validate balance before submission', 'Generate transfer receipt and notification'],
        widgets: ['Account selector', 'Transfer review', 'Receipt panel'],
        records: [
          { title: 'Own Transfer Template', detail: 'Payroll account to travel savings sweep', meta: 'Immediate transfer', status: 'READY' },
          { title: 'Balance Protection', detail: 'Prevent negative available balance during submission', meta: 'Validation rule', status: 'READY' },
        ],
      },
      {
        id: 'international',
        slug: 'international',
        label: 'International Transfer',
        icon: Globe2,
        status: 'Needs backend service',
        description: 'Cross-border payment flow with FX quote, beneficiary compliance, and sanctions screening.',
        primaryService: 'payment-service',
        apis: ['POST /api/v1/transfers/international', 'GET /api/v1/fx/quote', 'POST /api/v1/compliance/screening'],
        entities: ['InternationalTransfer', 'FxQuote', 'Beneficiary', 'ComplianceCheck'],
        capabilities: ['Capture beneficiary bank and SWIFT details', 'Lock FX rate before submit', 'Run AML and sanctions screening'],
        widgets: ['FX quote card', 'Compliance status', 'Beneficiary details'],
        records: [
          { title: 'FX Quote Window', detail: 'Quoted rate valid for 30 seconds before refresh', meta: 'Compliance + treasury', status: 'PLANNED' },
          { title: 'Beneficiary Validation', detail: 'IBAN, SWIFT, and country-specific rules', meta: 'Cross-border payments', status: 'PLANNED' },
        ],
      },
      {
        id: 'scheduled',
        slug: 'scheduled',
        label: 'Scheduled Transfers',
        icon: CalendarClock,
        status: 'Blueprint',
        description: 'Future-dated and recurring transfer instructions with amendment, cancellation, and execution audit.',
        primaryService: 'transaction-service',
        apis: ['GET /api/v1/transfers/scheduled', 'POST /api/v1/transfers/scheduled', 'PATCH /api/v1/transfers/scheduled/{id}'],
        entities: ['ScheduledTransfer', 'ExecutionWindow', 'TransferSchedule'],
        capabilities: ['Create future-dated or recurring instructions', 'Amend next run before cut-off', 'Track execution and failures'],
        widgets: ['Calendar view', 'Schedule queue', 'Execution history'],
        records: [
          { title: 'Salary Sweep', detail: 'Monthly scheduled transfer to investment account', meta: '28th of month | MYR 2,500', status: 'ACTIVE' },
          { title: 'Utility Reserve', detail: 'Weekly reserve to bills wallet', meta: 'Every Monday | MYR 150', status: 'DRAFT' },
        ],
      },
      {
        id: 'local',
        slug: 'local',
        label: 'Local Transfer',
        icon: Building2,
        status: 'Hybrid',
        description: 'Domestic interbank transfer with beneficiary validation, local rails selection, and transfer confirmation.',
        primaryService: 'transaction-service',
        apis: ['POST /api/v1/transfers/local', 'GET /api/v1/beneficiaries', 'POST /api/v1/beneficiaries/validate'],
        entities: ['LocalTransfer', 'Beneficiary', 'BankDirectory'],
        capabilities: ['Use saved or ad-hoc beneficiary', 'Validate domestic bank and account', 'Confirm fees and execution type'],
        widgets: ['Beneficiary picker', 'Bank validation', 'Confirmation summary'],
        records: [
          { title: 'DuitNow / IBG Routing', detail: 'Choose between instant and standard local rails', meta: 'Local scheme selection', status: 'READY' },
          { title: 'Fee Disclosure', detail: 'Show zero-fee or fee-bearing local transfer types', meta: 'Customer disclosure', status: 'READY' },
        ],
      },
      {
        id: 'one-time-local',
        slug: 'one-time-local',
        label: 'One Time Local Transfer',
        icon: Wallet,
        status: 'Hybrid',
        description: 'Fast domestic transfer for ad-hoc beneficiaries without saving standing beneficiary details.',
        primaryService: 'transaction-service',
        apis: ['POST /api/v1/transfers/local/one-time', 'POST /api/v1/beneficiaries/validate'],
        entities: ['OneTimeTransfer', 'BeneficiaryValidation', 'TransferReceipt'],
        capabilities: ['Submit ad-hoc transfer without saving template', 'Perform beneficiary and limit checks', 'Return immediate receipt'],
        widgets: ['One-time form', 'Risk prompt', 'Receipt card'],
        records: [
          { title: 'Ad-Hoc Beneficiary', detail: 'No beneficiary template saved after completion', meta: 'Fast transfer flow', status: 'READY' },
          { title: 'Receipt and notification', detail: 'Push receipt to notification service after success', meta: 'Customer alerting', status: 'READY' },
        ],
      },
    ],
  },
  {
    id: 'loans',
    slug: 'loans',
    label: 'Loans',
    caption: 'Portfolio, repayment, and lifecycle tracking',
    description:
      'Loan workspace for customer facilities, drawdown profile, repayment schedule, and historical servicing actions.',
    icon: HandCoins,
    services: ['loan-service', 'payment-service', 'notification-service', 'document-service'],
    tools: ['React 19', 'React Router', 'Axios', 'Spring Boot 3', 'Postgres', 'Kafka'],
    items: [
      {
        id: 'summary',
        slug: 'summary',
        label: 'Loan Summary',
        icon: LayoutDashboard,
        status: 'Live local prototype',
        description: 'Overview of loan applications or active facilities, balance position, and portfolio health.',
        primaryService: 'loan-service',
        apis: ['GET /api/v1/loans/customer/{customerId}', 'POST /api/v1/loans'],
        entities: ['LoanAccount', 'LoanApplication', 'InstallmentPlan'],
        capabilities: ['Track active facilities and applications', 'Show next installment due', 'Expose approval or servicing status'],
        widgets: ['Loan cards', 'Repayment due summary', 'Approval queue'],
        dataSource: 'loans-local',
        records: [
          { title: 'Home Loan Portfolio', detail: 'Outstanding balance, installment due, and rate profile', meta: 'Servicing summary', status: 'DESIGN' },
          { title: 'Approval Queue', detail: 'Pending underwriting and operations review', meta: 'Fulfillment workflow', status: 'READY' },
        ],
      },
      {
        id: 'details',
        slug: 'details',
        label: 'Loan Details',
        icon: FileText,
        status: 'Needs backend service',
        description: 'Facility-level details covering tenure, interest profile, collateral, and disbursement information.',
        primaryService: 'loan-service',
        apis: ['GET /api/v1/loans/{loanId}', 'GET /api/v1/loans/{loanId}/schedule'],
        entities: ['LoanAccount', 'Collateral', 'RatePlan', 'RepaymentSchedule'],
        capabilities: ['View loan contract details', 'Display collateral and pricing terms', 'Inspect amortization schedule'],
        widgets: ['Facility profile', 'Pricing summary', 'Collateral details'],
        records: [
          { title: 'Facility Terms', detail: 'Fixed vs floating rate, margin, spread, and maturity date', meta: 'Contract profile', status: 'PLANNED' },
          { title: 'Collateral Package', detail: 'Property, guarantor, or secured asset mapping', meta: 'Risk profile', status: 'PLANNED' },
        ],
      },
      {
        id: 'history',
        slug: 'history',
        label: 'Loan History',
        icon: History,
        status: 'Needs backend service',
        description: 'Lifecycle timeline for application, approval, disbursement, repayment exceptions, and servicing actions.',
        primaryService: 'loan-service',
        apis: ['GET /api/v1/loans/{loanId}/history'],
        entities: ['LoanLifecycleEvent', 'ApprovalDecision', 'Disbursement'],
        capabilities: ['Track lifecycle milestones', 'Show approval and disbursement actions', 'Expose exception handling history'],
        widgets: ['Event timeline', 'Approval milestones', 'Exception tracker'],
        records: [
          { title: 'Approval Milestone', detail: 'Credit committee approved the facility after document review', meta: 'Lifecycle event', status: 'PLANNED' },
          { title: 'Disbursement Event', detail: 'Funds released to settlement account after signing', meta: 'Fulfillment step', status: 'PLANNED' },
        ],
      },
      {
        id: 'repayment',
        slug: 'repayment',
        label: 'Loan Repayment',
        icon: ReceiptText,
        status: 'Needs backend service',
        description: 'Repayment initiation for normal installment, principal prepayment, and overdue settlement.',
        primaryService: 'payment-service',
        apis: ['POST /api/v1/loans/{loanId}/repayments', 'GET /api/v1/loans/{loanId}/schedule'],
        entities: ['LoanRepayment', 'Installment', 'RepaymentAllocation'],
        capabilities: ['Collect installment or prepayment', 'Allocate payment to principal and interest', 'Return repayment receipt'],
        widgets: ['Repayment form', 'Installment breakdown', 'Receipt panel'],
        records: [
          { title: 'Normal Installment', detail: 'Monthly scheduled repayment against active facility', meta: 'Standard servicing', status: 'PLANNED' },
          { title: 'Partial Prepayment', detail: 'Reduce outstanding principal before maturity', meta: 'Servicing option', status: 'PLANNED' },
        ],
      },
      {
        id: 'repayment-history',
        slug: 'repayment-history',
        label: 'Loan Repayment History',
        icon: ScrollText,
        status: 'Needs backend service',
        description: 'History of paid, missed, and reversed installments with allocation and channel information.',
        primaryService: 'payment-service',
        apis: ['GET /api/v1/loans/{loanId}/repayments'],
        entities: ['LoanRepayment', 'RepaymentAllocation', 'PaymentChannel'],
        capabilities: ['Display completed and failed repayments', 'Show allocation to principal, interest, fees', 'Support statement export'],
        widgets: ['Repayment ledger', 'Allocation details', 'Export actions'],
        records: [
          { title: 'Installment Ledger', detail: 'List of successful and failed loan collections', meta: 'Historical servicing', status: 'PLANNED' },
          { title: 'Allocation Breakdown', detail: 'Principal, interest, and fee split for each repayment', meta: 'Accounting view', status: 'PLANNED' },
        ],
      },
    ],
  },
  {
    id: 'payments',
    slug: 'payments',
    label: 'Payments',
    caption: 'Billers, bill payment, and scheduled payments',
    description:
      'Payment operations for billers, bill settlement, credit card payment, and recurring scheduled payments.',
    icon: ReceiptText,
    services: ['payment-service', 'notification-service', 'biller-service', 'schedule-service'],
    tools: ['React 19', 'React Router', 'Axios', 'Spring Boot 3', 'Kafka', 'Swagger/OpenAPI'],
    items: [
      {
        id: 'pay-bills',
        slug: 'pay-bills',
        label: 'Pay Bills',
        icon: Wallet,
        status: 'Hybrid',
        description: 'Bill payment flow for utilities, telco, insurance, and other registered billers.',
        primaryService: 'payment-service',
        apis: ['POST /api/v1/payments/bills', 'GET /api/v1/billers', 'GET /api/v1/accounts/customer/{customerId}'],
        entities: ['BillPayment', 'Biller', 'FundingAccount'],
        capabilities: ['Select biller and funding account', 'Submit one-off bill payment', 'Generate payment receipt and notification'],
        widgets: ['Biller selector', 'Funding account picker', 'Payment receipt'],
        dataSource: 'payments',
        records: [
          { title: 'Utility bill settlement', detail: 'Pay a registered electric or water provider from a linked account', meta: 'One-off bill payment', status: 'READY' },
          { title: 'Biller validation', detail: 'Validate account/reference before accepting payment', meta: 'Fulfillment control', status: 'PLANNED' },
        ],
      },
      {
        id: 'add-biller',
        slug: 'add-biller',
        label: 'Add Biller',
        icon: Building2,
        status: 'Blueprint',
        description: 'Register and manage saved billers with reference templates and customer nicknames.',
        primaryService: 'biller-service',
        apis: ['GET /api/v1/billers', 'POST /api/v1/billers', 'PATCH /api/v1/billers/{id}'],
        entities: ['Biller', 'BillerReference', 'CustomerFavorite'],
        capabilities: ['Create saved billers', 'Store multiple reference numbers', 'Maintain customer nicknames and categories'],
        widgets: ['Biller directory', 'Favorite billers', 'Reference templates'],
        records: [
          { title: 'Saved Utility Biller', detail: 'TNB home account with stored contract reference', meta: 'Favorite biller', status: 'PLANNED' },
          { title: 'Insurance Biller', detail: 'Recurring policy premium reference and nickname', meta: 'Biller maintenance', status: 'PLANNED' },
        ],
      },
      {
        id: 'credit-card-payment',
        slug: 'credit-card-payment',
        label: 'Credit Card Payment',
        icon: CreditCard,
        status: 'Live screen',
        description: 'Existing payment flow for settling credit card balances using a linked funding account.',
        primaryService: 'payment-service',
        apis: ['POST /api/v1/payments', 'GET /api/v1/payments/account/{accountId}'],
        entities: ['Payment', 'FundingAccount', 'PaymentReceipt'],
        capabilities: ['Take card payment details', 'Submit secure payment', 'Display payment confirmation and history'],
        widgets: ['Payment form', 'Card preview', 'Payment status states'],
        dataSource: 'payments',
        records: [
          { title: 'Immediate card payment', detail: 'Submit card settlement and view response state', meta: 'Current implementation', status: 'READY' },
          { title: 'Payment audit trail', detail: 'Fetch payments by account and show recent settlement history', meta: 'Current implementation', status: 'READY' },
        ],
      },
      {
        id: 'scheduled-payment',
        slug: 'scheduled-payment',
        label: 'Scheduled Payment',
        icon: CalendarClock,
        status: 'Blueprint',
        description: 'Recurring or future-dated payments for billers and cards with execution monitoring.',
        primaryService: 'schedule-service',
        apis: ['GET /api/v1/payments/scheduled', 'POST /api/v1/payments/scheduled', 'PATCH /api/v1/payments/scheduled/{id}'],
        entities: ['ScheduledPayment', 'PaymentSchedule', 'ExecutionResult'],
        capabilities: ['Create recurring payments', 'Pause, resume, or cancel before execution', 'Monitor completed and failed runs'],
        widgets: ['Schedule list', 'Execution monitor', 'Next due calendar'],
        records: [
          { title: 'Monthly card auto-pay', detail: 'Set minimum or full statement balance collection', meta: 'Auto-pay setup', status: 'PLANNED' },
          { title: 'Utility schedule', detail: 'Future-dated monthly bill settlement instruction', meta: 'Recurring payment', status: 'PLANNED' },
        ],
      },
    ],
  },
];

export const CUSTOMER_MENU_SECTIONS = CUSTOMER_SECTIONS.map((section) => ({
  ...section,
  to: `/dashboard/${section.slug}`,
  items: section.items.map((item) => ({
    ...item,
    to: `/dashboard/${section.slug}/${item.slug}`,
    tools: item.tools || section.tools,
  })),
}));

export const OPERATIONS_MENU_ITEMS = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true, caption: 'Workspace overview and KPIs' },
  { to: '/dashboard/employees', label: 'Employees', icon: Users, caption: 'Customer service and employee operations' },
  { to: '/dashboard/notifications', label: 'Notifications', icon: Bell, caption: 'Customer alerts and workflow notifications' },
  { to: '/dashboard/reports', label: 'Reports', icon: BarChart3, caption: 'Regulatory and management reporting' },
  { to: '/dashboard/audit', label: 'Audit', icon: NotebookText, caption: 'Audit trail and platform controls' },
  { to: '/dashboard/kafka-sample', label: 'Events', icon: Activity, caption: 'Event bus diagnostics and Kafka samples' },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings, caption: 'Profile and platform settings' },
];

export function getSectionConfig(sectionId) {
  return CUSTOMER_MENU_SECTIONS.find((section) => section.id === sectionId);
}

export function getWorkspaceConfig(sectionId, itemId) {
  const section = getSectionConfig(sectionId);
  return section?.items.find((item) => item.id === itemId);
}

export function getDashboardMeta(pathname) {
  if (pathname === '/dashboard') {
    return {
      title: 'Professional Banking Workspace',
      subtitle: 'Manage customer products, transactions, payments, and platform operations',
    };
  }

  for (const section of CUSTOMER_MENU_SECTIONS) {
    if (pathname === section.to) {
      return {
        title: `${section.label} Workspace`,
        subtitle: section.description,
      };
    }

    for (const item of section.items) {
      if (pathname === item.to) {
        return {
          title: item.label,
          subtitle: item.description,
        };
      }
    }
  }

  const operation = OPERATIONS_MENU_ITEMS.find((item) => item.to === pathname);
  if (operation) {
    return {
      title: operation.label,
      subtitle: operation.caption,
    };
  }

  return {
    title: 'Professional Banking Workspace',
    subtitle: 'Manage customer products, transactions, payments, and platform operations',
  };
}
