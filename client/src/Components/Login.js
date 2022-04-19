/* eslint-disable no-unused-vars */
import axios from 'axios';
import React, { 
  useCallback,
  useEffect,
  useState, 
  // useEffect 
} from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import nutritivApi from '../Api/nutritivApi';
import { updateUser, updateUserCartQuantity } from '../Redux/reducers/user';

export default function LoginPage() {
  console.log("##### LoginPage render #####");
  const dispatch = useDispatch();
  const location = useLocation();
  
  const [login, setLogin] = useState({
    username: "",
    password: "",
    twoFaCode: "",
    loading: false,
    success: "",
    error: "",
  })
  const loginData = {
    username: login.username,
    password: login.password,
  }
  const [hasTwoFa, setHasTwoFa] = useState(false)
  
  useEffect(() => {
    console.log('# location :', location)
  }, [location]);

  const handleChange = (e) => {
    setLogin({...login,
      [e.target.name]: e.target.value,
    })
  }
  
  const validation = () => {
    let usernameError = !login.username
    let passwordError = !login.password
    
    setLogin({...login,
      usernameError,
      passwordError,
      error: ""
    })
    
    // returns true only if both are false
    return !usernameError && !passwordError
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault();
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
        const { data } = await nutritivApi.post(
          `/auth/login`,
          loginData
        )
        setLogin({...login,
          loading: false,
          error: "",
        })
        // ASK FOR 2FA or REDIRECT
        data.twoFA ? (
          setHasTwoFa(data.twoFA)
        ) : (
          getUserInfo()
        )
      } catch (err) {
        console.log('# loginData err :', err)
        setLogin({...login,
          error: "Incorrect credentials"
        })
      }
    }
  }
  
  // GET USER INFO
  const getUserInfo = useCallback(() => {
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
  }, [dispatch])
  
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
        `/auth/totpValidate`,
        {
          token: login.twoFaCode
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
          error: err.response.data.err
        })
      ) : (
        setLogin({
          ...login,
          error: "There was an error on our end, please try again in 1 minute."
        })
      )
    }
  }
  
  return (
    <div>
      <h2>Login page</h2>
      {
        location.state?.msg && <p style={{color: "orange"}}>{location.state.msg}</p>
      }
      {hasTwoFa ? (
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
        </>
      ) : (
        <form onSubmit={ handleSubmit }>
          <label>
            <p>Username</p>
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
            <p>Password</p>
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
            <input value="Submit" type="submit" />
          </div>
          <br />
        </form>
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