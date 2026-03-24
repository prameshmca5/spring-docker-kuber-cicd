import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import AccountService from '../services/AccountService';
import PaymentService from '../services/PaymentService';
import TransactionService from '../services/TransactionService';
import { getSectionConfig, getWorkspaceConfig } from '../config/bankingMenu';

const LOAN_STORAGE_KEY = 'bank_loan_requests';

function loadLoanPreview() {
  try {
    const raw = localStorage.getItem(LOAN_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatCurrency(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

const BankingWorkspacePage = ({ sectionId, itemId }) => {
  const section = getSectionConfig(sectionId);
  const workspace = getWorkspaceConfig(sectionId, itemId);
  const { user } = useContext(AuthContext);
  const [preview, setPreview] = useState({
    loading: false,
    error: '',
    summary: [],
    rows: [],
  });

  useEffect(() => {
    let active = true;

    async function loadPreview() {
      if (!workspace?.dataSource) {
        if (!active) {
          return;
        }

        setPreview({
          loading: false,
          error: '',
          summary: [],
          rows: workspace?.records || [],
        });
        return;
      }

      setPreview((current) => ({
        ...current,
        loading: true,
        error: '',
      }));

      try {
        const customerId = user?.userId || 1;

        if (workspace.dataSource === 'accounts') {
          const response = await AccountService.getAccountsByCustomerId(customerId);
          const accounts = response.data || [];
          const totalBalance = accounts.reduce((sum, account) => sum + Number(account.balance || 0), 0);

          if (!active) {
            return;
          }

          setPreview({
            loading: false,
            error: '',
            summary: [
              { label: 'Accounts', value: String(accounts.length) },
              { label: 'Total Balance', value: formatCurrency(totalBalance) },
              { label: 'Largest Balance', value: formatCurrency(Math.max(...accounts.map((account) => Number(account.balance || 0)), 0)) },
            ],
            rows: accounts.map((account) => ({
              title: account.accountType || 'Account',
              detail: `Account ID ${account.id}`,
              meta: `Balance ${formatCurrency(account.balance)}`,
              status: 'ACTIVE',
            })),
          });
          return;
        }

        if (workspace.dataSource === 'transactions') {
          const accountsResponse = await AccountService.getAccountsByCustomerId(customerId);
          const accountIds = (accountsResponse.data || []).map((account) => account.id);
          const transactionResponses = await Promise.all(
            accountIds.map((accountId) => TransactionService.getTransactionsByAccountId(accountId))
          );
          const transactions = transactionResponses
            .flatMap((response) => response.data || [])
            .sort((left, right) => new Date(right.timestamp) - new Date(left.timestamp));

          if (!active) {
            return;
          }

          setPreview({
            loading: false,
            error: '',
            summary: [
              { label: 'Transactions', value: String(transactions.length) },
              {
                label: 'Debit Volume',
                value: formatCurrency(
                  transactions
                    .filter((transaction) => Number(transaction.amount) < 0)
                    .reduce((sum, transaction) => sum + Math.abs(Number(transaction.amount || 0)), 0)
                ),
              },
              {
                label: 'Credit Volume',
                value: formatCurrency(
                  transactions
                    .filter((transaction) => Number(transaction.amount) > 0)
                    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0)
                ),
              },
            ],
            rows: transactions.slice(0, 8).map((transaction) => ({
              title: transaction.type || 'Transaction',
              detail: `Account ${transaction.accountId}`,
              meta: `${formatCurrency(transaction.amount)} | ${new Date(transaction.timestamp).toLocaleString()}`,
              status: Number(transaction.amount) >= 0 ? 'CREDIT' : 'DEBIT',
            })),
          });
          return;
        }

        if (workspace.dataSource === 'payments') {
          const response = await PaymentService.getPaymentsByAccountId(customerId);
          const payments = response.data || [];

          if (!active) {
            return;
          }

          setPreview({
            loading: false,
            error: '',
            summary: [
              { label: 'Payments', value: String(payments.length) },
              {
                label: 'Processed Amount',
                value: formatCurrency(payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0)),
              },
              {
                label: 'Completed',
                value: String(payments.filter((payment) => payment.status === 'COMPLETED').length),
              },
            ],
            rows: payments.slice(0, 8).map((payment) => ({
              title: `Payment ${payment.id}`,
              detail: `Account ${payment.accountId}`,
              meta: formatCurrency(payment.amount),
              status: payment.status || 'CREATED',
            })),
          });
          return;
        }

        if (workspace.dataSource === 'loans-local') {
          const loans = loadLoanPreview();

          if (!active) {
            return;
          }

          setPreview({
            loading: false,
            error: '',
            summary: [
              { label: 'Requests', value: String(loans.length) },
              { label: 'Approved', value: String(loans.filter((loan) => loan.status === 'APPROVED').length) },
              { label: 'Pending', value: String(loans.filter((loan) => loan.status === 'PENDING').length) },
            ],
            rows: loans.slice(0, 8).map((loan) => ({
              title: loan.customerName || 'Loan Request',
              detail: loan.purpose || 'Facility request',
              meta: `${formatCurrency(loan.amount)} | ${loan.tenureMonths || 0} months`,
              status: loan.status || 'PENDING',
            })),
          });
        }
      } catch {
        if (!active) {
          return;
        }

        setPreview({
          loading: false,
          error: 'Live preview is unavailable. The architecture and route are ready, but the backing service is not responding yet.',
          summary: [],
          rows: workspace.records || [],
        });
      }
    }

    loadPreview();

    return () => {
      active = false;
    };
  }, [user, workspace]);

  const detailCards = useMemo(
    () => [
      { label: 'Primary Service', value: workspace?.primaryService || '-' },
      { label: 'API Contracts', value: String(workspace?.apis.length || 0) },
      { label: 'Data Entities', value: String(workspace?.entities.length || 0) },
      { label: 'Delivery Status', value: workspace?.status || '-' },
    ],
    [workspace]
  );

  if (!section || !workspace) {
    return null;
  }

  return (
    <section className="page-grid">
      <div className="hero-card">
        <div>
          <p className="hero-kicker">{section.label} / Workspace</p>
          <h2>{workspace.label}</h2>
          <p>{workspace.description}</p>
        </div>

        <div className="hero-insight">
          <span>{workspace.status}</span>
          <strong>{workspace.primaryService}</strong>
        </div>
      </div>

      <div className="stats-row">
        {detailCards.map((item) => (
          <div key={item.label} className="stat-card">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>

      <div className="workspace-grid">
        <div className="content-card">
          <header className="section-head">
            <h2>Capabilities</h2>
            <p>Functional scope expected for this submenu.</p>
          </header>
          <div className="bullet-list mt-3">
            {workspace.capabilities.map((capability) => (
              <div key={capability} className="bullet-row">
                <span className="bullet-dot" />
                <span>{capability}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="content-card">
          <header className="section-head">
            <h2>Suggested Widgets</h2>
            <p>Recommended UI elements for this journey.</p>
          </header>
          <div className="bullet-list mt-3">
            {workspace.widgets.map((widget) => (
              <div key={widget} className="bullet-row">
                <span className="bullet-dot bullet-dot-soft" />
                <span>{widget}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="workspace-grid">
        <div className="content-card">
          <header className="section-head">
            <h2>API Contracts</h2>
            <p>Suggested or existing endpoints that should back this screen.</p>
          </header>
          <div className="api-list mt-3">
            {workspace.apis.map((api) => (
              <code key={api} className="api-chip">
                {api}
              </code>
            ))}
          </div>
        </div>

        <div className="content-card">
          <header className="section-head">
            <h2>Data Entities</h2>
            <p>Core data model required to support this submenu.</p>
          </header>
          <div className="api-list mt-3">
            {workspace.entities.map((entity) => (
              <code key={entity} className="api-chip api-chip-soft">
                {entity}
              </code>
            ))}
          </div>
        </div>
      </div>

      <div className="content-card">
        <header className="section-head">
          <h2>Preview Data</h2>
          <p>Live preview is shown when an existing backend API already exists. Otherwise, this workspace shows blueprint records.</p>
        </header>

        {preview.loading && (
          <div className="empty-state">
            <p>Loading preview data...</p>
          </div>
        )}

        {!preview.loading && preview.error && (
          <div className="empty-state">
            <p>{preview.error}</p>
          </div>
        )}

        {!preview.loading && preview.summary.length > 0 && (
          <div className="stats-row mt-3">
            {preview.summary.map((item) => (
              <div key={item.label} className="stat-card">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        )}

        {!preview.loading && preview.rows.length > 0 && (
          <div className="record-grid mt-3">
            {preview.rows.map((row) => (
              <article key={`${row.title}-${row.meta}`} className="record-card">
                <span className="record-label">{row.status}</span>
                <strong>{row.title}</strong>
                <p>{row.detail}</p>
                <small>{row.meta}</small>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="content-card">
        <header className="section-head">
          <h2>Development Tools</h2>
          <p>Recommended stack to build and harden this menu end-to-end.</p>
        </header>
        <div className="pill-row mt-3">
          {workspace.tools.map((tool) => (
            <span key={tool} className="tech-pill tech-pill-soft">
              {tool}
            </span>
          ))}
        </div>

        <div className="workspace-links mt-4">
          <Link to={section.to} className="hero-action">
            Back to {section.label}
          </Link>
          <Link to="/dashboard" className="hero-action hero-action-secondary">
            Return to Overview
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BankingWorkspacePage;
