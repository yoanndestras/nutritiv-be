import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import nutritivApi from '../../Api/nutritivApi'
import { updateUser } from '../../Redux/reducers/user'
import { QrCodeTFA } from '../Authentication/QrCodeTFA';

const initialInputTFA = {
  code: "",
  password: ""
}

export const ProfileTFA = () => {
  const dispatch = useDispatch();
  const userInfo = useSelector(state => state.user)
  const [TFAStatus, setTFAStatus] = useState("disabled")
  const [qrCodeUrl, setQrCodeUrl] = useState(null)
  const [qrCodeSecret, setQrCodeSecret] = useState(null)
  const [inputTFA, setInputTFA] = useState(initialInputTFA)
  
  const [error, setError] = useState("")
  
  // Check TFA status
  useEffect(() => {
    setTFAStatus(userInfo.hasTFA ? "enabled" : "disabled")
  }, [userInfo.hasTFA]);
  
  // Request qrCodeUrl & qrCodeKey
  const handleEnableTFA = async (e) => {
    e.preventDefault();
    try {
      const { data } = await nutritivApi.post(
        `/auth/TFASecret`,
      )
      setQrCodeUrl(data.qrCodeUrl)
      setQrCodeSecret(data.qrCodeSecret)
      console.log('# post /auth/TFASecret :', data)
    } catch(err) {
      setError(err.response?.data?.err)
      console.error('/auth/TFASecret:', err)
    }
  }
  
  // Disable TFA
  const handleDisableTFA = async (e) => {
    e.preventDefault();
    try {
      const { data } = await nutritivApi.put(
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
      setQrCodeUrl(null)
      setInputTFA(initialInputTFA)
      console.log('# post /auth/disableTFA :', data)
    } catch(err) {
      setError(err.response?.data?.err)
      console.error('/auth/disableTFA:', err)
    }
  }
  
  const handleChange = (e) => {
    setInputTFA({
      ...inputTFA,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div>
      <h3>
        2 Factor Authentication (Google Authenticator)
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
          qrCodeUrl && qrCodeSecret ? (
            <QrCodeTFA 
              qrCodeUrl={qrCodeUrl}
              qrCodeSecret={qrCodeSecret}
              setTFAStatus={setTFAStatus}
            />
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
      {
        error && <p style={{ color: "red" }}>{error}</p>
      }
    </div>
  )
}