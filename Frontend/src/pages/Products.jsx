import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';

export default function Products() {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q');
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPage(0);
  }, [category, q]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        let res;
        if (q) {
          res = await productAPI.search(q, { page, size: 12 });
        } else if (category) {
          res = await productAPI.byCategory(category, { page, size: 12 });
        } else {
          res = await productAPI.getAll({ page, size: 12 });
        }
        setProducts(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
      } catch (e) {
        console.error(e);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [category, q, page]);

  const title = q
    ? `Search: "${q}"`
    : category
      ? category.replace(/_/g, ' ')
      : 'All Products';

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem' }}>
      <h1 className="section-title">{title}</h1>
      <div className="gold-divider" />

      {loading ? (
        <div className="loader" />
      ) : products.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '3rem' }}>
          No products found. Check back soon!
        </p>
      ) : (
        <>
          <div className="product-grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2.5rem' }}>
              <button
                className="btn btn-outline"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span style={{ color: 'var(--text-secondary)', alignSelf: 'center' }}>
                Page {page + 1} of {totalPages}
              </span>
              <button
                className="btn btn-outline"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
