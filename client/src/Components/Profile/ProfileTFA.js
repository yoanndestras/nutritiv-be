import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import nutritivApi from '../../Api/nutritivApi'
import { updateUser } from '../../Redux/reducers/user'

const initialInputTFA = {
  code: "",
  password: ""
}

export const ProfileTFA = ({ userInfo }) => {
  const dispatch = useDispatch();
  const [TFAStatus, setTFAStatus] = useState("disabled")
  const [qrCode, setQrCode] = useState(null)
  const [inputTFA, setInputTFA] = useState(initialInputTFA)
  
  // Check TFA status
  useEffect(() => {
    setTFAStatus(userInfo.hasTFA ? "enabled" : "disabled")
  }, [userInfo.hasTFA]);
  
  // Request qrCode
  const handleEnableTFA = async (e) => {
    e.preventDefault();
    try {
      const { data } = await nutritivApi.post(
        `/auth/TFASecret`,
      )
      setQrCode(data)
      console.log('# post /auth/TFASecret :', data)
    } catch(err) {
      console.error('/auth/TFASecret:', err)
    }
  }
  
  // Enable TFA
  const handleSubmitEnableTFA = async (e) => {
    e.preventDefault();
    const newTwoFaToken = localStorage.getItem('new_twofa_token')
    try {
      await nutritivApi.post(
        `/auth/enableTFA`,
        {
          code: inputTFA.code,
          password: inputTFA.password,
        },
        {
          headers: {
            new_twofa_token: newTwoFaToken
          }
        }
      )
      setInputTFA(initialInputTFA)
      setTFAStatus("enabled")
      dispatch(
        updateUser({hasTFA: true})
      )
    } catch(err) {
      console.error(':', err)
    }
  }
  
  // Disable TFA
  const handleDisableTFA = async (e) => {
    e.preventDefault();
    try {
      const { data } = await nutritivApi.post(
        `/auth/disableTFA`,
        {
          code: inputTFA.code,
          password: inputTFA.password,
        },
      )
      dispatch(
        updateUser({hasTFA: false})
      )
      setTFAStatus("disabled")
      setQrCode(null)
      setInputTFA(initialInputTFA)
      console.log('# post /auth/disableTFA :', data)
    } catch(err) {
      console.error('/auth/disableTFA:', err)
    }
  }
  
  const handleChange = (e) => {
    setInputTFA({
      ...inputTFA,
      [e.target.name]: e.target.value
    })
  }

  console.log('# QRcode :', qrCode)

  return (
    <div>
      <h3>
        2 Factor Authentication (TFA)
      </h3>
      { 
        TFAStatus === "enabled" ? (
          <>
            <p style={{color: "green"}}>
              TFA is enabled.
            </p>
            <form onSubmit={handleDisableTFA}>
              <input
                name="code" 
                onChange={handleChange}
                value={inputTFA.code}
                placeholder='TFA Code' 
                type="text"
              />
              <input 
                name="password" 
                onChange={handleChange}
                value={inputTFA.password}
                placeholder='Current password' 
                type="password" 
              />
              <input 
                value="Disable" 
                type="submit" 
              />
            </form>
          </>
        ) : (
          qrCode ? (
            <>
              <img 
                src={qrCode}
                alt="QR code"
              />
              <p>
                Scan the QRCode with TFA Google Authenticator and enter the code below:
              </p>
              <form onSubmit={handleSubmitEnableTFA}>
                <input
                  name="code" 
                  onChange={handleChange}
                  value={inputTFA.code}
                  placeholder='TFA Code' 
                  type="text"
                />
                <input 
                  name="password" 
                  onChange={handleChange}
                  value={inputTFA.password}
                  placeholder='Current password' 
                  type="password" 
                />
                <input 
                  value="Enable TFA !" 
                  type="submit" 
                />
              </form>
            </>
          ) : (
            <>
              <p style={{color: "orange"}}>
                TFA is disabled.
              </p>
              <button onClick={handleEnableTFA}>
                Enable
              </button>
            </>
          )
        )
      }
    </div>
  )
}