/* eslint-disable no-unused-vars */
import axios from 'axios';
import React, { 
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import nutritivApi from '../../Api/nutritivApi';
import { updateUser, updateUserCartQuantity } from '../../Redux/reducers/user';
import { OAuth } from './OAuth';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

export default function LoginPage() {

  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { executeRecaptcha } = useGoogleReCaptcha();
  
  const [login, setLogin] = useState({
    username: "",
    password: "",
    emailForgotPassword: "",
    twoFaCode: "",
    loading: false,
    success: "",
    error: "",
  })
  const loginData = useRef(null);
  const [hasTFA, setHasTFA] = useState(false)
  
  // onEveryRender
  useEffect(() => {
    loginData.current = {
      username: login.username,
      password: login.password,
    }  
  });
  
  // Auto-set login credentials
  useEffect(() => {
    if(location.state?.username) {
      setLogin(prevState => ({
        ...prevState, 
        username: location.state.username
      }))
    }
  }, [location]);
  
  // Form validation
  const validation = () => {
    let usernameError = !login.username
    let passwordError = !login.password
    
    setLogin({...login,
      usernameError,
      passwordError,
      error: ""
    })
    
    return !usernameError && !passwordError
  }

  // GET USER INFO
  const getUserInfo = () => {
    function useNull() {
      return null;
    }
    let fetchApi = async () => {
      const method = "get"
      const requestsUrl = ['/users/self', '/carts/self']
      const requests = requestsUrl.map(url => {
        return { url, method }
      })
      
      await Promise.all([
        nutritivApi.request(requests[0]).catch(useNull),
        nutritivApi.request(requests[1]).catch(useNull),
      ]).then(function([userSelf, cartSelf]) {
        if(cartSelf.data.cart){
          dispatch(
            updateUserCartQuantity(cartSelf.data.cart.totalQuantity)
          )
        }
        dispatch(
          updateUser(userSelf.data)
        )
      }).catch(function([userSelf, cartSelf]) {
        console.log('# userSelf err :', userSelf)
        console.log('# cartSelf err :', cartSelf)
      })
    }
    fetchApi();
  }
  
  const handleChange = (e) => {
    setLogin({...login,
      [e.target.name]: e.target.value,
    })
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // reCAPTCHA
    if(!executeRecaptcha) {
      setLogin({
        ...login,
        error: "reCaptcha couldn't be loaded, please try again or contact the support."
      })
      return;
    }
    const reCaptchaToken = await executeRecaptcha();
    
    // We store and use the return value 
    // because the state won't update yet
    const isValid = validation();
    
    if(isValid) {
      // LOGIN
      try {
        setLogin({...login,
          loading: true,
          error: "",
        })
        
        const req = {
          ...loginData.current,
          captcha: reCaptchaToken
        }
        const { data } = await nutritivApi.post(
          `/auth/login`,
          req
        )
        setLogin({...login,
          loading: false,
          error: "",
        })

        // ASK FOR 2FA or REDIRECT
        data.hasTFA ? (
          setHasTFA(data.hasTFA)
        ) : (
          getUserInfo()
        )

      } catch (err) {
        console.log('# loginData err :', err)
        setLogin({...login,
          loading: false,
          error: err.response?.data?.info?.message
        })
      }
    }
  }
  
  // SUBMIT 2FA CODE
  const handleSubmitTwoFa = async (e) => {
    e.preventDefault();
    const twoFaToken = localStorage.getItem('twofa_token')
    
    try {
      setLogin({...login,
        loading: true,
        error: "",
      })
      await nutritivApi.post(
        `/auth/TFAValidation`,
        {
          code: login.twoFaCode
        },
        {
          headers: {
            twofa_token: twoFaToken
          }
        }
      )
      setLogin({...login,
        loading: false,
        success: "Login successful!",
        error: "",
      })
      getUserInfo();
    } catch(err) {
      err.response?.data?.err ? (
        setLogin({
          ...login,
          loading: false,
          error: err.response.data.err
        })
      ) : (
        setLogin({
          ...login,
          loading: false,
          error: "There was an error on our end, please try again in 1 minute."
        })
      )
    }
  }
  
  return (
    <div>
      <h1>Login page</h1>
      {
        location.state?.msg && (
          <p 
            style={{
              color: location.state?.status === "success" ? "green" : "orange"
            }}
          >
            {location.state.msg}
          </p>
        )
      }
      {hasTFA ? (
        <>
          <p>Enter your 2FA code</p>
          <form onSubmit={ handleSubmitTwoFa }>
            <input 
              name="twoFaCode"
              onChange={ handleChange }
              type="text" 
            />
            <input value="Submit" type="submit" />
          </form>
          <button onClick={() => navigate('/forgot-2FA')}>
            Forgot 2FA
          </button>
        </>
      ) : (
        <>
          <form onSubmit={ handleSubmit }>
            <label>
              <input 
                name="username" 
                onChange={ handleChange } 
                placeholder="Username..."
                type="text" 
                value={login.username}
              />
              {
                login.usernameError && (
                  <p style={{color: "red"}}>
                    Please enter your username
                  </p>
                )
              }
            </label>
            <label>
              <input 
                name="password" 
                onChange={ handleChange }
                placeholder="Password..." 
                type="password"
                value={login.password}
              />
              {
                login.passwordError && (
                  <p style={{color: "red"}}>
                    Please enter your password
                  </p>
                )
              }
            </label>
            <div>
              <input
                value="Login"
                type="submit" 
              />
              <div id="recaptcha"/>
            </div>
            <br />
          </form>
          {
            <button onClick={() => navigate('/forgot-password')}>
              Forgot password
            </button>
          }
          <br/><br />
          or
          <br/><br />
          <OAuth provider="google"/>
          <br />
          <OAuth provider="facebook"/>
          <br />
          <OAuth provider="github"/>
        </>
      )}
      {
        login.loading && (
          <p>
            Loading...
          </p>
        )
      }
      {
        login.error && (
          <p style={{color: "red"}}>
            {login.error}
          </p>
        )
      }
      {
        login.success && (
          <p style={{color: "green"}}>
            {login.success}
          </p>
        )
      }
    </div>
  )
}