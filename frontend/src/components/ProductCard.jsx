import React from 'react';
import { FaStar } from 'react-icons/fa';

function ProductCard({ product, onAddToCart, renderStars }) {
  return (
    <div className="product-card">
      <div className="product-image">
        <img src={product.image_url} alt={product.name} />
        {product.stock < 10 && product.stock > 0 && (
          <span className="stock-badge">Only {product.stock} left</span>
        )}
        {product.stock === 0 && (
          <span className="out-of-stock-badge">Out of Stock</span>
        )}
      </div>
      
      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <h3 className="product-title">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        
        <div className="product-rating">
          <div className="stars">
            {renderStars(product.rating)}
          </div>
          <span className="rating-value">{product.rating}</span>
        </div>
        
        <div className="product-footer">
          <div className="product-price">
            <span className="price">${product.price}</span>
          </div>
          
          <button
            className="add-to-cart-btn"
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;