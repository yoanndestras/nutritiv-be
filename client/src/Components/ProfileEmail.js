import React from 'react'

export const ProfileEmail = () => {
  
  return (
    <div>
      <span>
        <h3>
          Email
        </h3>
        {/* {userInfo.email} */}
        <br />
        <input
          disabled
          // onClick={handleChangeEmail}
          placeholder="Enter new email..." 
          type="text"
        />
        <br />
        <button
          disabled
        >
          Change email
        </button>
      </span>
    </div>
  )
}
