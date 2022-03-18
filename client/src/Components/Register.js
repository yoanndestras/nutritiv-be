import React, { useState } from 'react';
import nutritivApi from '../Api/nutritivApi';

export default function RegisterPage() {
  
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    error: false,
  });
  
  const handleChange = (e) => {
    setRegisterData({
      ...registerData, 
      [e.target.name]: e.target.value 
    })
  }
  
  // const validation = () => {
  //   setRegisterData({
  //     ...registerData,
  //     error: true,
  //   })
  // }
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // const isValid = validation();
    
    // if(isValid) {
    try {
      await nutritivApi.post(
        '/auth/register',
        registerData
      )
    } catch(err) {
      console.log('# err :', err)
    }
  }
    // }
  console.log('# registerData :', registerData)
    
  return (
    <div>
      <h2>Register page</h2>
      <form onSubmit={ handleSubmit }>
        <label>
          <p>Username</p>
          <input 
            name="username" 
            onChange={ handleChange } 
            type="text" 
          />
        </label>
        <label>
          <p>Email</p>
          <input 
            name="email" 
            onChange={ handleChange } 
            type="text" 
          />
        </label>
        <label>
          <p>Password</p>
          <input 
            name="password" 
            onChange={ handleChange } 
            type="password"
          />
        </label>
        <div>
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  )
}