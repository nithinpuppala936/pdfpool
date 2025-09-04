import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BillingCheckout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState('');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const version = searchParams.get('version') || '1';
    const provider = searchParams.get('provider') || 'mock';
    const method = searchParams.get('method') || 'auto';
    if (!sessionId) {
      setStatus('error');
      setError('Missing session');
      return;
    }
    (async () => {
      try {
        if (provider === 'razorpay') {
          // In a real integration, you'd open Razorpay Checkout in the previous step.
          // Here, we simulate success by calling our mock finalize to upgrade the plan.
          await axios.post(`/api/payments/v${version}/webhook/mock`, { sessionId, status: 'paid' });
        } else {
          await axios.post(`/api/payments/v${version}/webhook/mock`, { sessionId, status: 'paid' });
        }
        setStatus('success');
        setTimeout(() => navigate('/billing'), 1200);
      } catch (e) {
        setStatus('error');
        setError(e.response?.data?.error || 'Failed to finalize payment');
      }
    })();
  }, [searchParams, navigate]);

  return (
    <div className="card">
      {status === 'processing' && (
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
          <p className="text-gray-700">Finalizing your payment...</p>
        </div>
      )}
      {status === 'success' && (
        <p className="text-green-700">Payment successful. Updating your plan...</p>
      )}
      {status === 'error' && (
        <p className="text-red-600">{error}</p>
      )}
    </div>
  );
};

export default BillingCheckout;


