// src/ProjectInfo.js
import React from 'react';

const ProjectInfo = () => {
  return (
    <div className="project-info-container">
      <h2>Insurance Comparison, Recommendation & Claim Assistant</h2>

      <section className="key-features">
        <h3>Key Features</h3>
        <ul>
          <li>Policy comparison & premium calculators</li>
          <li>Personalized policy recommendations</li>
          <li>Guided claim filing with document uploads</li>
          <li>Real-time claim status tracking</li>
          <li>Fraud detection (rules-based)</li>
        </ul>
      </section>

      <section className="architecture-diagram">
        <h3>Architecture Diagram (Conceptual)</h3>
        <div className="diagram-box">
          <p><strong>Frontend:</strong> React.js (User Interface)</p>
          <p><strong>Backend:</strong> Flask (API, Business Logic)</p>
          <p><strong>Database:</strong> PostgreSQL (Data Storage)</p>
          <p><strong>Other Services:</strong></p>
          <ul>
            <li>S3 (for file uploads like ClaimDocuments)</li>
            <li>Celery (for asynchronous tasks like notifications)</li>
            <li>Rules Engine (for Fraud Detection)</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default ProjectInfo;