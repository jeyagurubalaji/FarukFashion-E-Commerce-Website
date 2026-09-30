import { useEffect, useState } from 'react';
import { orderAPI } from '../services/api';
import { toast } from 'react-toastify';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.myOrders({ size: 20 })
      .then((res) => setOrders(res.data.content || []))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  const requestReturn = async (orderId) => {
    const reason = prompt('Reason for return:');
    if (!reason) return;
    try {
      await orderAPI.requestReturn({ orderId, reason });
      toast.success('Return request submitted');
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'RETURN_REQUESTED' } : o))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Return request failed');
    }
  };

  if (loading) return <div className="loader" />;

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem', maxWidth: 800 }}>
      <h1 className="section-title">My Orders</h1>
      <div className="gold-divider" />

      {orders.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>
          No orders yet. Start shopping!
        </p>
      ) : (
        orders.map((order) => (
          <div
            key={order.id}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: '1.5rem', marginBottom: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
              <div>
                <strong style={{ color: 'var(--gold)' }}>{order.orderNumber}</strong>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '0.75rem' }}>
                  {order.createdAt?.slice(0, 10)}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span className="badge">{order.status}</span>
                <span className="badge-outline badge">{order.paymentStatus}</span>
              </div>
            </div>
            {order.items?.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                <span>{item.productName} ×{item.quantity}</span>
                <span>₹{Number(item.totalPrice).toLocaleString('en-IN')}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--border)', marginTop: '0.75rem', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ color: 'var(--gold)' }}>₹{Number(order.totalAmount).toLocaleString('en-IN')}</strong>
              {order.status === 'DELIVERED' && (
                <button className="btn btn-outline" style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem' }} onClick={() => requestReturn(order.id)}>
                  Request Return
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
