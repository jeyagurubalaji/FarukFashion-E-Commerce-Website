import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import { FiShoppingBag } from 'react-icons/fi';
import { mediaUrl } from '../utils/mediaUrl';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const price = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) {
      toast.error('Out of stock');
      return;
    }
    addToCart(product);
    toast.success('Added to cart');
    navigate('/cart');
  };

  return (
    <Link to={`/products/${product.id}`} className="product-card card">
      <div className="product-image-wrap">
        {product.mainImage ? (
          <img src={mediaUrl(product.mainImage)} alt={product.name} loading="lazy" />
        ) : (
          <div className="product-placeholder">
            <span>FF</span>
          </div>
        )}
        {hasDiscount && (
          <span className="discount-badge">
            -{product.discountPercent || Math.round((1 - product.discountPrice / product.price) * 100)}%
          </span>
        )}
        {!product.inStock && <span className="oos-badge">Out of Stock</span>}
        {product.featured && <span className="featured-badge">Featured</span>}
      </div>
      <div className="product-info">
        <span className="product-category">{product.category?.replace(/_/g, ' ')}</span>
        <h3 className="product-name">{product.name}</h3>
        <div className="product-price">
          <span className="current">₹{Number(price).toLocaleString('en-IN')}</span>
          {hasDiscount && (
            <span className="original">₹{Number(product.price).toLocaleString('en-IN')}</span>
          )}
        </div>
        <button
          className="btn btn-primary add-btn"
          onClick={handleAdd}
          disabled={!product.inStock}
        >
          <FiShoppingBag /> Add to Cart
        </button>
      </div>
    </Link>
  );
}