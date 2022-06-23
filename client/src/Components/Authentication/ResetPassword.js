import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import nutritivApi from '../../Api/nutritivApi'

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3)
  const [startTimer, setStartTimer] = useState(false)
  const [searchParams] = useSearchParams();
  const [formSuccess, setFormSuccess] = useState("")
  const [linkError, setLinkError] = useState("")
  const [formError, setFormError] = useState("")
  const [pwd, setPwd] = useState({
    newPassword: "",
    confirmNewPassword: "",
  })
  
  const pwdToken = searchParams.get('token')
  const pwdStatus = searchParams.get('status')
  
  useEffect(() => {
    if(startTimer) {
      const interval = setInterval(() => {
        setCountdown(countdown => countdown - 1)
      }, 1000)
      const timer = setTimeout(() => {
        navigate('/login')
      }, 3000)
      return () => {
        clearInterval(interval)
        clearTimeout(timer)
      };
    }
  }, [navigate, startTimer]);
  
  useEffect(() => {
    if(pwdStatus === "pwdFailed"){
      setLinkError("The URL has expired, try again.")
    }
  }, [pwdStatus]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const { data } = await nutritivApi.post(
        `/auth/new_password/?token=${pwdToken}`,
        {
          newPass: pwd.newPassword,
          confirmNewPass: pwd.confirmNewPassword
        }
      )
      if(data.success === true){
        setStartTimer(true)
        setFormError("")
        setFormSuccess("Password successfully updated!")
      }
    } catch(err) {
      setFormSuccess("");
      setFormError(err.response?.data?.err)
    }
  }
  
  const handleChange = (e) => {
    setPwd({
      ...pwd,
      [e.target.name]: e.target.value
    })  
  }
  
  return (
    <>
      <h2>
        New password
      </h2>
      {
        linkError ? (
          <p style={{color: "red"}}>
            {linkError}
          </p>
        ) : (
          <form onSubmit={handleResetPassword}>
            <input 
              name="newPassword"
              onChange={handleChange} 
              placeholder='Enter new password'
              type="password"
            />
            <input 
              name="confirmNewPassword"
              onChange={handleChange}
              placeholder="Confirm new password"
              type="password"
            />
            <input 
              type="submit"
              value="Save new password"
            />  
          </form>
        )
      }
      {
        formSuccess && (
          <>
            <p style={{color: "green"}}>
              {formSuccess}
            </p>
            <p>
              Redirecting in {countdown}...
            </p>
          </>
        )
      }
      {
        formError && (
          <p style={{color: "red"}}>
            {formError}
          </p>
        )
      }
    </>
  )
}