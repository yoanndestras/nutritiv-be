/* eslint-disable no-unused-vars */
import React, { 
  useState, 
  // useEffect 
} from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import nutritivApi from '../Api/nutritivApi';
import { updateUser, updateUserCartQuantity } from '../Redux/reducers/user';

export default function LoginPage() {
  console.log("##### LoginPage render #####");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loginInput, setLoginInput] = useState({
    username: "",
    password: "",
    usernameError: false,
    passwordError: false,
  })
  const [invalidLogin, setInvalidLogin] = useState(false)
  const loginData = {
    username: loginInput.username,
    password: loginInput.password,
  }
  
  const handleChange = (e) => {
    setLoginInput({
      ...loginInput,
      [e.target.name]: e.target.value,
    })
  }
  
  const validation = () => {
    let usernameError = !loginInput.username
    let passwordError = !loginInput.password
    
    setLoginInput({
      ...loginInput,
      usernameError,
      passwordError,
    })
    setInvalidLogin(false)
    
    // returns true only if both are true
    return !usernameError && !passwordError
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // We store and use the return value 
    // because the state won't update yet
    const isValid = validation();
    
    console.log('# loginData :', loginData)

    if(isValid) {
      try {
        await nutritivApi.post(
          `/auth/login`,
          loginData
        )
        const { data } = await nutritivApi.get(
          `/users/self`
        )
        const cartSelf = await nutritivApi.get(
          `carts/self`
        )
        console.log('# cart :', cartSelf.data.cart.totalQuantity)
        dispatch(updateUser({
          loggedIn: data.loggedIn,
          username: data.username,
          email: data.email,
          isAdmin: data.isAdmin,
          isVerified: data.isVerified,
          addresses: data.addressDetails,
          avatar: data.avatar
        }))
        dispatch(updateUserCartQuantity({
          cartQuantity: cartSelf.data.cart.totalQuantity
        }))
        navigate('/', { replace: true })
      } catch(err) {
        setInvalidLogin(true)
      }
    }
  }
  
  return (
    <div>
      <h2>Login page</h2>
      <form onSubmit={ handleSubmit }>
        <label>
          <p>Username</p>
          <input 
            name="username" 
            onChange={ handleChange } 
            placeholder="Username..."
            type="text" 
          />
          {
            loginInput.usernameError && (
              <p style={{color: "red"}}>
                Please enter a username
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
          />
          {
            loginInput.passwordError && (
              <p style={{color: "red"}}>
                Please enter a password
              </p>
            )
          }
        </label>
        <div>
          <button type="submit">Submit</button>
        </div>
        {
          invalidLogin && (
            <p style={{color: "red"}}>
              Incorrect password or username
            </p>
          )
        }
      </form>
    </div>
  )
}