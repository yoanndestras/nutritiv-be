import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion';

export const ProductCard = ({ product, index }) => {
  const navigate = useNavigate();
  
  const lowestItemPrice = product.productItems[0].price.value
  
  return (
    <motion.div
      layout
      key={product._id}
      onClick={() => navigate(`/product/${product.title}`)}
      style={{
        background: "lightgray",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ 
        duration: 0.32,
        delay: index * 0.05
      }}
    >
      {/* GENERAL INFO */}
      <h2>
        {product.title} ({product.shape})
      </h2>
      <span style={{fontSize: "22px", fontWeight: "bold"}}>
        {lowestItemPrice} €
      </span>
      <br />
      <span>
        {product.desc}
      </span>
      <br />
      {/* IMAGES */}
      {
        product.imgs.map((img, i) => (
          <img
            style={{
              paddingLeft: "22px",
              maxWidth: "100px",
            }}
            key={i}
            src={`${process.env.REACT_APP_S3_ADDRESS}${process.env.REACT_APP_S3_PRODUCTS}${img}`}
            alt={`${product.title} ${i+1}`}
          />
        ))
      }
      <br />
      {
        product.tags && product.tags.map((tag, i) => (
          <span key={i}>
            &nbsp;{tag} /
          </span>
        ))
      }
    </motion.div>
  )
}
