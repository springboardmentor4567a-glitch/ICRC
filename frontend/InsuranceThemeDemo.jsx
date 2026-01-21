import React, { useEffect } from 'react';
import './insurance-theme.css';

export default function InsuranceThemeDemo() {
  useEffect(() => {
    // Apply the insurance theme when component mounts
    if (window.themeManager) {
      window.themeManager.applyTheme('insurance');
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--insurance-bg-primary)' }}>
      {/* Header Section */}
      <div className="insurance-header">
        <h1>SecureGuard Insurance</h1>
        <p className="subtitle">
          Protecting what matters most with trusted coverage and exceptional service
        </p>

        {/* Trust Indicators */}
        <div className="insurance-trust-indicators">
          <div className="indicator">
            <span>Licensed & Regulated</span>
          </div>
          <div className="indicator">
            <span>24/7 Support</span>
          </div>
          <div className="indicator">
            <span>Secure & Private</span>
          </div>
          <div className="indicator">
            <span>Expert Advisors</span>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
        <div className="insurance-stats">
          <div className="insurance-stat">
            <div className="number">500K+</div>
            <div className="label">Happy Customers</div>
          </div>
          <div className="insurance-stat">
            <div className="number">$2.5B</div>
            <div className="label">Coverage Provided</div>
          </div>
          <div className="insurance-stat">
            <div className="number">25+</div>
            <div className="label">Years Experience</div>
          </div>
          <div className="insurance-stat">
            <div className="number">4.9★</div>
            <div className="label">Customer Rating</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem 4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>

          {/* Quote Form */}
          <div className="insurance-card insurance-animate-fadeInUp">
            <h2 style={{ color: 'var(--insurance-primary)', marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '600' }}>
              Get Your Free Quote
            </h2>

            <div className="insurance-security-indicator" style={{ marginBottom: '1.5rem' }}>
              Your information is secure and encrypted
            </div>

            <form className="insurance-form" style={{ padding: 0, background: 'transparent', border: 'none', boxShadow: 'none' }}>
              <div className="insurance-form-group">
                <label>Full Name</label>
                <input type="text" placeholder="Enter your full name" />
              </div>

              <div className="insurance-form-group">
                <label>Email Address</label>
                <input type="email" placeholder="your@email.com" />
              </div>

              <div className="insurance-form-group">
                <label>Coverage Type</label>
                <select>
                  <option>Auto Insurance</option>
                  <option>Home Insurance</option>
                  <option>Life Insurance</option>
                  <option>Health Insurance</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button className="insurance-btn-primary" style={{ flex: 1 }}>
                  Get Quote
                </button>
                <button className="insurance-btn-secondary" style={{ flex: 1 }}>
                  Call Us
                </button>
              </div>
            </form>
          </div>

          {/* Trust Elements */}
          <div className="insurance-card insurance-animate-fadeInUp">
            <h2 style={{ color: 'var(--insurance-primary)', marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '600' }}>
              Why Choose SecureGuard?
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="insurance-trust-badge">
                A+ Rated by AM Best
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', background: 'var(--insurance-success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem' }}>
                  ✓
                </div>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--insurance-primary)', fontSize: '1.1rem', fontWeight: '600' }}>
                    Fast Claims Processing
                  </h3>
                  <p style={{ margin: '0.25rem 0 0', color: 'var(--insurance-text-secondary)', fontSize: '0.9rem' }}>
                    Average 24-hour claim resolution
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', background: 'var(--insurance-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem' }}>
                  🛡️
                </div>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--insurance-primary)', fontSize: '1.1rem', fontWeight: '600' }}>
                    Comprehensive Coverage
                  </h3>
                  <p style={{ margin: '0.25rem 0 0', color: 'var(--insurance-text-secondary)', fontSize: '0.9rem' }}>
                    Protection for you and your family
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', background: 'var(--insurance-accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem' }}>
                  💰
                </div>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--insurance-primary)', fontSize: '1.1rem', fontWeight: '600' }}>
                    Competitive Rates
                  </h3>
                  <p style={{ margin: '0.25rem 0 0', color: 'var(--insurance-text-secondary)', fontSize: '0.9rem' }}>
                    Save up to 30% on premiums
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="insurance-card" style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ color: 'var(--insurance-primary)', marginBottom: '1rem', fontSize: '2rem', fontWeight: '700' }}>
            Ready to Get Protected?
          </h2>
          <p style={{ color: 'var(--insurance-text-secondary)', marginBottom: '2rem', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
            Join thousands of satisfied customers who trust SecureGuard with their insurance needs.
            Get started today with our free quote service.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="insurance-btn-primary insurance-animate-pulse">
              Start Your Quote
            </button>
            <button className="insurance-btn-secondary">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="insurance-footer">
        <div className="logo">SecureGuard Insurance</div>
        <p>
          Trusted insurance coverage for over 25 years. Your security and peace of mind are our top priorities.
          Licensed and regulated by state insurance departments.
        </p>
      </div>
    </div>
  );
}
