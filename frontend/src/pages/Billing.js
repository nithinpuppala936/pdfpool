import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { CreditCard, Banknote, CheckCircle, X } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const plans = [
    { id: 'free', name: 'Free', priceMonthly: 0, features: ['10 PDF operations/month', 'Basic features'] },
    { id: 'monthly', name: 'Monthly', priceMonthly: 9, features: ['Unlimited PDF operations', 'Advanced features', 'Priority support'] },
    { id: 'pro', name: 'Pro', priceMonthly: 19, features: ['Everything in Monthly', 'Exclusive features', '24/7 support'] },
];

const Billing = () => {
    const [selectedPlan, setSelectedPlan] = useState('free');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [loading, setLoading] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState({
        cardNumber: '',
        cardExpiry: '',
        cardCvv: '',
        upiId: ''
    });

    const startCheckout = () => {
        if (selectedPlan === 'free') {
            toast.success("You have selected the free plan.");
            return;
        }
        setShowPaymentModal(true);
    };

    const handlePaymentSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulated validation
        if (paymentMethod === 'card' && (!paymentDetails.cardNumber || !paymentDetails.cardExpiry || !paymentDetails.cardCvv)) {
            toast.error("Please fill all card details.");
            setLoading(false);
            return;
        }
        if (paymentMethod === 'upi' && !paymentDetails.upiId) {
            toast.error("Please enter your UPI ID.");
            setLoading(false);
            return;
        }

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setShowPaymentModal(false);
            toast.success("Payment successful!");
        }, 2000);
    };

    return (
        <div className="space-y-8">
            <PageHeader
                title="Billing & Plans"
                subtitle="Choose a plan that fits your needs to unlock more features"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className={`card p-6 rounded-xl transition-all duration-300 ${
                            selectedPlan === plan.id ? 'glassmorphism-card border-purple-400' : 'bg-gray-800/50 border-transparent'
                        }`}
                    >
                        <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                        <p className="text-gray-400 text-sm">
                            {plan.priceMonthly === 0 ? 'Free' : <span className="text-3xl font-bold text-purple-400">₹{plan.priceMonthly}</span>}
                            {plan.priceMonthly > 0 && <span className="text-sm text-gray-500">/mo</span>}
                        </p>
                        <ul className="mt-4 text-sm text-gray-400 space-y-2">
                            {plan.features?.map((f, idx) => (
                                <li key={idx} className="flex items-center space-x-2">
                                    <CheckCircle size={16} className="text-green-500" />
                                    <span>{f}</span>
                                </li>
                            ))}
                        </ul>
                        <button
                            className={`w-full py-3 mt-6 rounded-lg font-semibold transition-colors duration-200 ${
                                selectedPlan === plan.id
                                    ? 'bg-purple-600 text-white cursor-default'
                                    : 'bg-gray-700 hover:bg-purple-500 text-gray-200'
                            }`}
                            onClick={() => setSelectedPlan(plan.id)}
                        >
                            {selectedPlan === plan.id ? 'Selected Plan' : 'Select Plan'}
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex justify-center mt-8">
                <button onClick={startCheckout} className="btn-primary">
                    Proceed to Checkout
                </button>
            </div>

            {showPaymentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
                    <div className="glassmorphism-card p-8 rounded-xl shadow-lg w-full max-w-md relative">
                        <button onClick={() => setShowPaymentModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-400">
                            <X size={24} />
                        </button>
                        <h2 className="text-2xl font-bold text-white mb-6">Complete Your Payment</h2>

                        <div className="flex space-x-2 border-b border-gray-700 mb-6">
                            <button
                                onClick={() => setPaymentMethod('card')}
                                className={`flex items-center space-x-2 py-2 px-4 border-b-2 transition-colors duration-200 ${
                                    paymentMethod === 'card' ? 'border-purple-400 text-purple-300' : 'border-transparent text-gray-400 hover:text-purple-400'
                                }`}
                            >
                                <CreditCard size={18} />
                                <span>Card</span>
                            </button>
                            <button
                                onClick={() => setPaymentMethod('upi')}
                                className={`flex items-center space-x-2 py-2 px-4 border-b-2 transition-colors duration-200 ${
                                    paymentMethod === 'upi' ? 'border-purple-400 text-purple-300' : 'border-transparent text-gray-400 hover:text-purple-400'
                                }`}
                            >
                                <Banknote size={18} />
                                <span>UPI</span>
                            </button>
                        </div>

                        <form onSubmit={handlePaymentSubmit} className="space-y-4">
                            {paymentMethod === 'card' ? (
                                <>
                                    <div>
                                        <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-400 mb-1">Card Number</label>
                                        <input
                                            type="text"
                                            id="cardNumber"
                                            className="w-full p-3 rounded-md bg-gray-700/50 text-white border border-gray-600 focus:outline-none focus:border-purple-400"
                                            placeholder="XXXX XXXX XXXX XXXX"
                                            value={paymentDetails.cardNumber}
                                            onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-400 mb-1">Expiry Date</label>
                                            <input
                                                type="text"
                                                id="cardExpiry"
                                                className="w-full p-3 rounded-md bg-gray-700/50 text-white border border-gray-600 focus:outline-none focus:border-purple-400"
                                                placeholder="MM/YY"
                                                value={paymentDetails.cardExpiry}
                                                onChange={(e) => setPaymentDetails({ ...paymentDetails, cardExpiry: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="cardCvv" className="block text-sm font-medium text-gray-400 mb-1">CVV</label>
                                            <input
                                                type="text"
                                                id="cardCvv"
                                                className="w-full p-3 rounded-md bg-gray-700/50 text-white border border-gray-600 focus:outline-none focus:border-purple-400"
                                                placeholder="123"
                                                value={paymentDetails.cardCvv}
                                                onChange={(e) => setPaymentDetails({ ...paymentDetails, cardCvv: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <label htmlFor="upiId" className="block text-sm font-medium text-gray-400 mb-1">UPI ID</label>
                                    <input
                                        type="text"
                                        id="upiId"
                                        className="w-full p-3 rounded-md bg-gray-700/50 text-white border border-gray-600 focus:outline-none focus:border-purple-400"
                                        placeholder="yourname@bank"
                                        value={paymentDetails.upiId}
                                        onChange={(e) => setPaymentDetails({ ...paymentDetails, upiId: e.target.value })}
                                    />
                                </div>
                            )}

                            <button type="submit" className="btn-primary w-full mt-4" disabled={loading}>
                                {loading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                ) : (
                                    `Pay ₹${plans.find(p => p.id === selectedPlan)?.priceMonthly}`
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Billing;