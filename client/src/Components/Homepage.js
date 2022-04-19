import React from 'react'
import { useSelector } from 'react-redux';

export const Welcome = () => {
  
  const loggedIn = useSelector(state => state.user.loggedIn)
  
  return (
    <div>
      <br />
      <h1>Homepage</h1>
      {
        !loggedIn && (
          <div>
            You are not connected
          </div>
        )
      }
    </div>
  )
}