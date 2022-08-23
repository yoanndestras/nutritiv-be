import React from 'react';
import { useMotionValue, useTransform } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Logout } from '../Authentication/Logout';
import { motion } from 'framer-motion';

export default function Navbar() {
  const user = useSelector(state => state.user)
  const navigate = useNavigate();
  
  const y = useMotionValue(0);
  const width = useTransform(y, [-10, 300], ["0vw", "98vw"])
  const scale = useTransform(y, [0, 100], [1, 1.5])
  
  return (
    <nav>
      {/* <motion.div 
        style={{ width, height: "2px", backgroundColor: "red" }}
      />      
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 280 }}
        style={{ y, scale, textAlign: "center" }}
      >
        TEST
      </motion.div> */}
      <Link 
        className='test' 
        to="/"
      >
        HOMEPAGE
      </Link>
      <span>----</span>
      <Link to="/products">
        PRODUCTS
      </Link>
      <span>----</span>
      <Link to="/chat">
        CHAT
      </Link>
      <span>----</span>
      {
        user.loggedIn ? (
          <>
            <Link to="/profile">
              { user.username }
            </Link>
            <span>----</span>
            <img
              alt="avatar"
              style={{
                maxWidth: "30px",
              }}
              src={user.avatar}
            />
            <span>----</span>
            <button onClick={() => navigate('/cart')}>
              Cart 
              {
                user?.cartQuantity > 0 && (
                  <span>({user.cartQuantity})</span>
                )
              }
            </button>
            <span>----</span>
            <Logout />
          </>
        ) : (
          <>
            <Link to="/register">REGISTER</Link>
            <span>----</span>
            <Link to="/login">LOGIN</Link>
          </>
        )
      }
    </nav>
  )
}
