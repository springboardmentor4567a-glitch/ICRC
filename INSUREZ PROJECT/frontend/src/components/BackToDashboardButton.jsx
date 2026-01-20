import { useNavigate } from 'react-router-dom';

export default function BackToDashboardButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/dashboard')}
      className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 cursor-pointer mb-4 transition-colors"
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      Back to Dashboard
    </button>
  );
}