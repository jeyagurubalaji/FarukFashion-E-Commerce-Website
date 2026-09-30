import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../services/api';
import { toast } from 'react-toastify';

export default function Checkout() {
  const { cart, totalAmount, totalGst, grandTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY');
  const [address, setAddress] = useState({
    fullName: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : '',
    phone: user?.phone || '',
    addressLine1: user?.address || '',
    addressLine2: '',
    city: user?.city || '',
    state: user?.state || '',
    pincode: user?.pincode || '',
    landmark: ''
  });

  const total = grandTotal;

  const handleChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

  const loadRazorpay = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

    const handlePlaceOrder = async (e) => {
      e.preventDefault();
      if (cart.length === 0) return toast.error('Cart is empty');
      setLoading(true);

      try {
        const orderRes = await orderAPI.create({
          items: cart.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            color: i.color,
            size: i.size
          })),
          shippingAddress: address,
          paymentMethod
        });

        const data = orderRes.data;

        // COD → order already confirmed on backend
        if (paymentMethod === 'COD') {
          clearCart();
          toast.success(`Order placed! #${data.orderNumber}`);
          navigate('/orders');
          return;
        }

        // Online: must open real Razorpay (no mock skip)
        if (data.mock === true || data.mock === 'true') {
          toast.error('Payment gateway not configured. Contact support.');
          return;
        }

        if (!data.razorpayOrderId || !data.keyId) {
          toast.error('Could not start payment. Try again.');
          return;
        }

        const loaded = await loadRazorpay();
        if (!loaded) {
          toast.error('Failed to load payment gateway. Check internet and try again.');
          return;
        }

        const options = {
          key: data.keyId,
          amount: Number(data.amount),
          currency: data.currency || 'INR',
          name: 'Faruk Fashion',
          description: `Order ${data.orderNumber}`,
          order_id: data.razorpayOrderId,
          method: {
              upi: true,
              card: true,
              netbanking: true,
              wallet: true
            },
            // Optional: push UPI higher in the list
            config: {
              display: {
                blocks: {
                  upi: {
                    name: 'Pay using UPI',
                    instruments: [{ method: 'upi' }]
                  }
                },
                sequence: ['block.upi'],
                preferences: {
                  show_default_blocks: true   // still show card, netbanking, wallet
                }
              }
            },
          handler: async (response) => {
            try {
              await orderAPI.verifyPayment({
                orderId: data.orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              });
              clearCart();
              toast.success(`Payment successful! Order #${data.orderNumber}`);
              navigate('/orders');
            } catch {
              toast.error('Payment received but verification failed. Contact support with order number.');
            }
          },
          modal: {
            ondismiss: () => {
              toast.info('Payment cancelled. You can try again from cart.');
              setLoading(false);
            }
          },
          prefill: {
            name: address.fullName,
            email: user?.email,
            contact: address.phone
          },
          theme: { color: '#c9a227' }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (resp) => {
          toast.error(resp.error?.description || 'Payment failed');
          setLoading(false);
        });
        rzp.open();
      } catch (err) {
        toast.error(err.response?.data?.message || err.message || 'Failed to place order');
      } finally {
        setLoading(false);
      }
  };

  if (cart.length === 0) {
    return (
      <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>
        <p>Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem', maxWidth: 900 }}>
      <h1 className="section-title">Checkout</h1>
      <div className="gold-divider" />

      <form onSubmit={handlePlaceOrder} style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' }}>
        <div style={{ background: 'var(--bg-card)', padding: '1.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', marginBottom: '1.25rem' }}>Delivery Address</h3>
          <div className="form-group">
            <label>Full Name</label>
            <input className="form-control" name="fullName" value={address.fullName} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input className="form-control" name="phone" value={address.phone} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Address Line 1</label>
            <input className="form-control" name="addressLine1" value={address.addressLine1} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Address Line 2</label>
            <input className="form-control" name="addressLine2" value={address.addressLine2} onChange={handleChange} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label>City</label>
              <input className="form-control" name="city" value={address.city} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>State</label>
              <input className="form-control" name="state" value={address.state} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Pincode</label>
              <input className="form-control" name="pincode" value={address.pincode} onChange={handleChange} required />
            </div>
          </div>

          <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', margin: '1.5rem 0 1rem' }}>Payment Method</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="radio" checked={paymentMethod === 'RAZORPAY'} onChange={() => setPaymentMethod('RAZORPAY')} />
              Online (Razorpay – UPI / Card / NetBanking)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="radio" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
              Cash on Delivery
            </label>
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', height: 'fit-content' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', marginBottom: '1rem' }}>Summary</h3>
          {cart.map((i) => (
            <div key={i.productId + i.color} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
              <span>{i.name} ×{i.quantity}</span>
              <span>₹{(i.price * i.quantity).toLocaleString('en-IN')}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--border)', marginTop: '0.75rem', paddingTop: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span>Subtotal</span><span>₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span>GST</span><span>₹{Math.round(totalGst).toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '1.1rem', marginTop: '0.5rem' }}>
              <span>Total</span><span style={{ color: 'var(--gold)' }}>₹{Math.round(total).toLocaleString('en-IN')}</span>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.25rem' }} disabled={loading}>
            {loading ? 'Processing...' : paymentMethod === 'COD' ? 'Place Order (COD)' : 'Pay Securely'}
          </button>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', textAlign: 'center' }}>
            🔒 Secure payment · Order confirmation via WhatsApp, SMS & Email
          </p>
        </div>
      </form>

      <style>{`
        @media (max-width: 768px) {
          form { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}