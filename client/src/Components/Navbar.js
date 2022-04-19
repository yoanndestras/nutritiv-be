import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Logout } from './Logout';

export default function Navbar() {
  const user = useSelector(state => state.user)
  
  const navigate = useNavigate();
  
  return (
    <nav id={"navbar"}>
      <Link className={'test'} to="/">HOMEPAGE</Link>
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
