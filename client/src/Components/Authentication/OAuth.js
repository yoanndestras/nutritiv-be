import React from 'react'
import { baseURL } from '../../Api/nutritivApi';

export const OAuth = ({ provider }) => {
  
  const handleLogin = (e) => {
    e.preventDefault();
    window.open(`
      ${baseURL}/auth/${provider}`, 
      "_self"
    )
  }
  
  return (
    <div className={`oAuth-${provider}`}>
      <form onSubmit={handleLogin}>
        <input type="submit" value={`Sign in with ${provider}`} />
      </form>
    </div>
  )
}