import QRCodeStyling from 'qr-code-styling';
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import nutritivApi from '../../Api/nutritivApi';
import { updateUser } from '../../Redux/reducers/user';

const qrCode = new QRCodeStyling({
  width: 240,
  height: 240,
  type: "png",
  image: "https://nutritiv.s3.eu-west-3.amazonaws.com/productsImgs/H9qPM60.png",
  qrOptions: {
    errorCorrectionLevel: "H"
  },
  imageOptions: {
    imageSize: 0.65,
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

export const QrCodeTFA = ({ qrCodeUrl, qrCodeSecret, setTFAStatus }) => {
  const qrCodeRef = useRef(null);
  const navigate = useNavigate();
  const isLoggedIn = useSelector(state => state.user.loggedIn)
  const [inputTFA, setInputTFA] = useState(initialInputTFA)
  const [error, setError] = useState("")
  
  const dispatch = useDispatch();

  useEffect(() => {
    qrCode.append(qrCodeRef.current);
    qrCode.update({
      data: qrCodeUrl
    });
  }, [qrCodeUrl]);
  
  // Enable TFA
  const handleSubmitEnableTFA = async (e) => {
    let isMounted = true
    e.preventDefault();
    const newTwoFaToken = localStorage.getItem('new_twofa_token')
    try {
      const { data } = await nutritivApi.put(
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
      if(isMounted && data.success) {
        setInputTFA(initialInputTFA)
        dispatch(
          updateUser({hasTFA: true})
        )
        alert(
          `IMPORTANT: \n
          Make sure you SAVE the following recovery words in that order, you will not be able to see them after closing this window\n
          You will be asked to type them if you loose access to your device.\n
          ${data.TFARecovery.join(" ")}`
        )
        setTFAStatus && setTFAStatus("enabled")
        if(!isLoggedIn) {
          navigate('/login')
        }
      }
    } catch(err) {
      setError(err.response?.data?.err)
      console.error(':', err)
    }
    return () => { isMounted = false }
  }
  
  const handleChange = (e) => {
    setInputTFA({
      ...inputTFA,
      [e.target.name]: e.target.value
    })
  }

  return (
    <>
      <div ref={qrCodeRef} />
      <p>{qrCodeSecret}</p>
      <p>
        Scan the QRCode or use the secret key above in Google Authenticator, then enter your code below:
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
      {
        error && <p style={{color: "red"}}>{error}</p>
      }
    </>
  )
}