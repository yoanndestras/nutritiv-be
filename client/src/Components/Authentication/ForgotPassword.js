import React, { useState } from 'react'
import nutritivApi from '../../Api/nutritivApi';

export const ForgotPassword = () => {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      const { data } = await nutritivApi.post(
        `/auth/forget_pwd`,
        { email }
      )
      console.log('# get /auth/forget_pwd :', data)
    } catch(err) {
      setError(err.response?.data?.err)
      console.error('/auth/forget_pwd:', err)
    }
  }
  
  const handleChange = (e) => {
    setEmail(e.target.value)  
  }
  
  return (
    <>
      <form onSubmit={handleForgotPassword}>
        <p>Enter your email:</p>
        <input
          name="emailForgotPassword" 
          onChange={handleChange}
          placeholder='Email...' 
          type="text" 
          value={email}
        />
        <input value="Set new password" type="submit"/>
      </form>
      {error && <p style={{color: "red"}}>{error}</p>}
    </>
  )
}