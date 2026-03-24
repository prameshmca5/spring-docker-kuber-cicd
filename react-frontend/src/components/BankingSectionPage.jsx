import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getSectionConfig } from '../config/bankingMenu';

const BankingSectionPage = ({ sectionId }) => {
  const section = getSectionConfig(sectionId);

  if (!section) {
    return null;
  }

  const apiCount = section.items.reduce((count, item) => count + item.apis.length, 0);

  return (
    <section className="page-grid">
      <div className="hero-card">
        <div>
          <p className="hero-kicker">{section.label} Domain</p>
          <h2>{section.label} Menu Architecture</h2>
          <p>{section.description}</p>
        </div>

        <div className="hero-insight">
          <span>{section.items.length} submenu journeys</span>
          <strong>{section.services.join(' | ')}</strong>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <span>Submenus</span>
          <strong>{section.items.length}</strong>
        </div>
        <div className="stat-card">
          <span>Domain Services</span>
          <strong>{section.services.length}</strong>
        </div>
        <div className="stat-card">
          <span>API Contracts</span>
          <strong>{apiCount}</strong>
        </div>
      </div>

      <div className="content-card">
        <header className="section-head">
          <h2>{section.label} Customer Journeys</h2>
          <p>Each submenu below now has its own route, workspace definition, and delivery blueprint.</p>
        </header>

        <div className="catalog-grid">
          {section.items.map((item) => {
            const ItemIcon = item.icon;
            return (
              <Link key={item.id} to={item.to} className="catalog-card">
                <div className="catalog-card-head">
                  <span className="catalog-icon">
                    <ItemIcon size={18} />
                  </span>
                  <span className="status-badge">{item.status}</span>
                </div>
                <h3>{item.label}</h3>
                <p>{item.description}</p>
                <span className="catalog-link">
                  Open workspace <ArrowRight size={16} />
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="workspace-grid">
        <div className="content-card">
          <header className="section-head">
            <h2>Core Services</h2>
            <p>Recommended service boundaries for this domain inside the current microservice landscape.</p>
          </header>
          <div className="pill-row mt-3">
            {section.services.map((service) => (
              <span key={service} className="tech-pill">
                {service}
              </span>
            ))}
          </div>
        </div>

        <div className="content-card">
          <header className="section-head">
            <h2>Delivery Toolchain</h2>
            <p>Suggested tools and frameworks to build the frontend, APIs, data model, and deployment flow.</p>
          </header>
          <div className="pill-row mt-3">
            {section.tools.map((tool) => (
              <span key={tool} className="tech-pill tech-pill-soft">
                {tool}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="content-card">
        <header className="section-head">
          <h2>Implementation Notes</h2>
          <p>Use this section page as the delivery checklist before wiring deeper backend behavior.</p>
        </header>

        <div className="record-grid mt-3">
          <article className="record-card">
            <span className="record-label">Frontend</span>
            <strong>Route every submenu to its own screen</strong>
            <p>Use shared menu configuration, React Router nesting, and section-aware navigation.</p>
          </article>
          <article className="record-card">
            <span className="record-label">Backend</span>
            <strong>Implement domain APIs per submenu</strong>
            <p>Reuse existing services where available and add dedicated services for cards, loans, billers, and schedules.</p>
          </article>
          <article className="record-card">
            <span className="record-label">Integration</span>
            <strong>Publish business events after successful actions</strong>
            <p>Send transfer, payment, and repayment events to Kafka for alerts, audit, and reporting pipelines.</p>
          </article>
        </div>
      </div>
    </section>
  );
};

export default BankingSectionPage;
