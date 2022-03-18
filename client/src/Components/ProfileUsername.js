import React from 'react'

export const ProfileUsername = ({ userInfo }) => {
  
  return (
    <div>
      <span>
        <h3>
          Username
        </h3>
        {userInfo.username}
        <br />
        <input
          disabled
          // onClick={handleChangeUsername} 
          placeholder="Enter new username..."
          type="text"
        />
        <br />
        <button
          disabled
        >
          Change username
        </button>
      </span>
    </div>
  )
}
