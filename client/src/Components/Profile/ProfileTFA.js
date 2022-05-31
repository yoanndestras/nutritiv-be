import React, { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import nutritivApi from '../../Api/nutritivApi'
import { updateUser } from '../../Redux/reducers/user'
import QRCodeStyling from "qr-code-styling";

const qrCode = new QRCodeStyling({
  width: 240,
  height: 240,
  type: "png",
  image: "https://nutritiv.s3.eu-west-3.amazonaws.com/productsImgs/H9qPM60.png",
  qrOptions: {
    errorCorrectionLevel: "M"
  },
  imageOptions: {
    imageSize: 1,
    crossOrigin: "anonymous",
    margin: 6
  },
  dotsOptions: {
    color: "#024b11",
    type: "rounded"
  },
  backgroundOptions: {
    color: "#fff"
  },
  cornersSquareOptions: {
    color: "#329a19",
    type: "square"
  }
});

const initialInputTFA = {
  code: "",
  password: ""
}

export const ProfileTFA = ({ userInfo }) => {
  const dispatch = useDispatch();
  const [TFAStatus, setTFAStatus] = useState("disabled")
  const [qrCodeUrl, setQrCodeUrl] = useState(null)
  const [inputTFA, setInputTFA] = useState(initialInputTFA)
  
  const ref = useRef(null);
  
  useEffect(() => {
    qrCode.append(ref.current);
    qrCode.update({
      data: qrCodeUrl
    });
  }, [qrCodeUrl]);
  
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
      setQrCodeUrl(data)
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
      setQrCodeUrl(null)
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
  
  console.log('# QRcode :', qrCodeUrl)

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
          qrCodeUrl ? (
            <>
              {/* <img 
                src={qrCode}
                alt="QR code"
              /> */}
              <div ref={ref} />
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