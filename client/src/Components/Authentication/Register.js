import React, { useState } from 'react';
import nutritivApi from '../../Api/nutritivApi';
import { OAuth } from './OAuth';

export default function RegisterPage() {
  
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    loading: false,
    error: "",
    success: "",
  });
  
  const handleChange = (e) => {
    setRegisterData({
      ...registerData, 
      [e.target.name]: e.target.value 
    })
  }
  
  const validation = () => {
    setRegisterData({
      ...registerData,
      error: "",
      success: ""
    })
    
    if(
      !registerData.username || 
      !registerData.email || 
      !registerData.password
    ) {
      setRegisterData({
        ...registerData,
        error: "Please fill in all the fields."
      })
      return false
    }
    return true
  }
  
  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isValid = validation();
    
    if(isValid) {
      setRegisterData({...registerData, loading: true})
      try {
        await nutritivApi.post(
          '/auth/register',
          registerData
        )
        setRegisterData({
          ...registerData,
          success: "Your account has been successfully created."
        })
      } catch({ response }) {
        setRegisterData({
          ...registerData,
          loading: false,
          error: response.data.err
        })
      }
    }
  }
    
  return (
    <div>
      <h2>Register page</h2>
      <b>Register with your email:</b>
      <form onSubmit={ handleSubmit }>
        <label>
          <p>Username</p>
          <input 
            name="username" 
            onChange={ handleChange } 
            placeholder="Username..."
            type="text" 
          />
        </label>
        <label>
          <p>Email</p>
          <input 
            name="email" 
            onChange={ handleChange }
            placeholder="Email..." 
            type="text" 
          />
        </label>
        <label>
          <p>Password</p>
          <input 
            name="password" 
            onChange={ handleChange }
            placeholder="Password..." 
            type="password"
          />
        </label>
        {
          registerData.loading && (
            <p>
              Creating account...
            </p>
          )
        }
        {
          registerData.error && (
            <p style={{color: "red"}}>
              {registerData.error}
            </p>
          )
        }
        {
          registerData.success && (
            <p style={{color: "green"}}>
              {registerData.success}
            </p>
          )
        }
        <div>
          <button type="submit">Submit</button>
        </div>
      </form>
      <br />
      <b>or register with a third party account:</b>
      <br />
      <br />
      <OAuth provider="google"/>
      <br />
      <OAuth provider="facebook"/>
      <br />
      <OAuth provider="github"/>
    </div>
  )
}