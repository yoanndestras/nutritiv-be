import React, { useState } from 'react'
import nutritivApi from '../../Api/nutritivApi'

export const ProfilePassword = () => {
  
  const [passwordInput, setPasswordInput] = useState({
    oldPass: "",
    newPass: "",
    confirmNewPass: ""
  })
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  const passwordInputsValidation = () => {
    if(
      !passwordInput.oldPass ||
      !passwordInput.newPass ||
      !passwordInput.confirmNewPass
    ) {
      setError("Please fill in all the fields.")
      return false;
    }
    if(passwordInput.newPass !== passwordInput.confirmNewPass) {
      setError("The password do not match the confirmation field.")
      return false;
    }
    return true;
  }
  
  const handlePasswordInputChange = (e) => {
    setPasswordInput({
      ...passwordInput,
      [e.target.name]: e.target.value
    })
  }
  
  const handleSubmitUpdatePassword = async (e) => {
    e.preventDefault()
    setSuccess("")
    setError("")
    
    const isValid = passwordInputsValidation();
    
    if(isValid) {
      setLoading(true)
      setError("")
      try {
        await nutritivApi.put(
          `/users/reset_password`,
          passwordInput
        )
        setSuccess("Password successfully changed.")
        setPasswordInput({
          oldPass: "",
          newPass: "",
          confirmNewPass: ""
        })
      } catch (err) {
        setError(err.response?.data?.err)
        setSuccess("")
        console.log('# /users/reset_password :', err)
      }
      setLoading(false)
    }
  }
  return (
    <div>
      <form onSubmit={handleSubmitUpdatePassword}>
        <span>
          <h3>
            Password
          </h3>
          <br />
          <input
            onChange={handlePasswordInputChange}
            name='oldPass'
            placeholder='Current password...'
            type="password"
            value={passwordInput.oldPass}
          />
          <br />
          <input
            onChange={handlePasswordInputChange}
            name='newPass'
            placeholder='New password...'
            type="password"
            value={passwordInput.newPass}
          />
          <br />
          <input
            onChange={handlePasswordInputChange}
            name='confirmNewPass'
            placeholder='Confirm new password...'
            type="password"
            value={passwordInput.confirmNewPass}
          />
          <br />
          <input
            type="submit" 
            value="Change password"
          />
          <br />
          { 
            error && (
              <span style={{color: "red"}}>
                {error}
              </span>
            )
          }
          {
            loading && (
              <span>
                Loading...
              </span>
            )
          }
          {
            success && (
              <span style={{color: "green"}}>
                {success}
              </span>
            )
          }
        </span>
      </form>
    </div>
  )
}
