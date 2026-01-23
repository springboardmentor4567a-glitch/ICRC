import React, { useState, useEffect } from 'react';
import { useAuth } from './authContext';
import { RecommendationsAPI } from './auth';
import { useNavigate } from 'react-router-dom';
import './recommendations.css';

export default function Recommendations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const recs = await RecommendationsAPI.getRecommendations(token);
        setRecommendations(recs);
      } catch (err) {
        setError('Failed to load recommendations');
        console.error('Error fetching recommendations:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchRecommendations();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="page-wrap">
        <div className="loading-container">
          <p>Loading recommendations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrap">
        <div className="error-container">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrap">
      <header className="page-header">
        <h2>Personalized Recommendations</h2>
        <div>
          <button onClick={() => window.history.back()}>Back</button>
          <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
        </div>
      </header>

      <div className="recommendations-container">
        {recommendations.length === 0 ? (
          <div className="no-recommendations">
            <p>No recommendations available. Please update your preferences first.</p>
            <button onClick={() => navigate("/risk-profile")}>Set Preferences</button>
          </div>
        ) : (
          <div className="recommendations-list">
            {recommendations.map((rec, index) => (
              <div key={index} className="recommendation-card">
                <h3>{rec.name}</h3>
                <p><strong>Provider:</strong> {rec.provider}</p>
                <p><strong>Category:</strong> {rec.category}</p>
                <p className="coverage"><strong>Coverage:</strong> ₹{(rec.coverage || 0).toLocaleString()}</p>
                <p className="price"><strong>Price Base:</strong> ₹{(rec.priceBase || 0).toLocaleString()}</p>
                <p><strong>Rating:</strong> <span className="rating">{rec.rating}/5</span></p>
                <p><strong>Score:</strong> <span className="score">{rec.score}</span></p>
                <p><strong>Features:</strong> {rec.features?.join(', ') || 'N/A'}</p>
                <button onClick={() => navigate(`/calculator/${rec.id}`)}>
                  Calculate Premium
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
