import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route, useLocation, Navigate, Outlet, useSearchParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { updateUser, updateUserCartQuantity } from './Redux/reducers/user';
import nutritivApi from './Api/nutritivApi';
import { Elements } from '@stripe/react-stripe-js';
import Register from './Components/Authentication/Register.js';
import Login from './Components/Authentication/Login.js';
import Profile from './Components/Profile/Profile';
import { Products } from './Components/Products/Products';
import { CheckoutSuccess } from './Components/Payment/CheckoutSuccess';
import { CheckoutCancel } from './Components/Payment/CheckoutCancel';
import { ProductPage } from './Components/Products/ProductPage';
import { Cart } from './Components/Payment/Cart';
import { Homepage } from './Components/Homepage/Homepage';
import { PageNotFound } from './Components/PageNotFound/PageNotFound';
import { ChatConnection } from './Components/Chat/ChatConnection';
import { AnimatePresence } from 'framer-motion';
import Navbar from './Components/Navbar/Navbar';
import { ForgotPassword } from './Components/Authentication/ForgotPassword';
import { ForgotTFA } from './Components/Authentication/ForgotTFA';
import { ResetPassword } from './Components/Authentication/ResetPassword';

// init stripe
const stripePromise = loadStripe(
  process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY
);

function App() {
  const [gettingUserInfo, setGettingUserInfo] = useState(false);
  const dispatch = useDispatch();
  const loggedIn = useSelector(state => state.user.loggedIn)
  const location = useLocation();
  const navigate = useNavigate();
  
  const [searchParams] = useSearchParams();
  const oAuthStatus = searchParams.get('status');
  const oAuthMessage = searchParams.get('message');
  const oAuthUsername = searchParams.get('username')
  const oAuthAccessToken = searchParams.get('accessToken');
  
  // App titles
  useEffect(() => {
    const titleWithoutSpecials = location.pathname.replace(/[^a-zA-Z ]/g, "");
    if(titleWithoutSpecials){
      const fixedTitle = titleWithoutSpecials[0].toUpperCase() + titleWithoutSpecials.substring(1);
      document.title = `Nutritiv | ${fixedTitle}`
    } else {
      document.title = "Nutritiv | Homepage"
    }
  }, [location.pathname]);
  
  // ON LOAD
  // Fetch user-self info
  useEffect(() => {

    let isSubscribed = true;
    
    if(isSubscribed) {
      const method = "get"
      const requestsUrl = ['/users/self', '/carts/self']
      const requests = requestsUrl.map(url => {
        return { url, method }
      })
      const fetchUserInfo = async () => {
        function useNull() {
          return null;
        }
        try {
          await Promise.all([
            nutritivApi.request(requests[0]).catch(useNull),
            nutritivApi.request(requests[1]).catch(useNull),
          ]).then(function([userSelf, cartSelf]) {
            dispatch(
              updateUser(userSelf.data)
            )
            dispatch(
              updateUserCartQuantity(cartSelf.data.cart?.totalQuantity)
            )
          }).catch(function([userSelf, cartSelf]) {
            console.log('# /users/self err :', userSelf)
            console.log('# /carts/self err :', cartSelf)
          })
        } catch(err) {
          console.log("Could not fetch user info on App initialization")
        }
      }
      fetchUserInfo();
    }
    return () => { isSubscribed = false }
  }, [dispatch, gettingUserInfo]);
  
  // oAuth
  useEffect(() => {
    if(
      oAuthStatus === "successLogin" ||
      oAuthStatus === "successRegistration"
    ) {
      console.log("Condition success oAuth");
      let fetchApi = async () => {
        try {
          await nutritivApi.get(
            `/auth/login/validateOauth?accessToken=${oAuthAccessToken}`
          )
          setGettingUserInfo(prevState => !prevState)
        } catch(err) {
          console.error(
            '/auth/login/validateOauth:', err
          )
        }
      }
      fetchApi();
      navigate('/')
    } else if(oAuthStatus === "failed") {
      navigate(
        '/login', 
        { state: 
          { 
            msg: oAuthMessage, 
            username: oAuthUsername 
          } 
        }
      )
    }
  }, [
    navigate, 
    oAuthAccessToken, 
    oAuthMessage, 
    oAuthStatus, 
    oAuthUsername
  ]);
  
  // RESTRICTED ROUTES
  const Restricted = ({ routeType }) => {
    const cartSelection = location.state?.cartSelection;
    const isLogged = () => {
      console.log('# loggedIn :', loggedIn)
      return loggedIn;
    }
    if(loggedIn !== null) {
      if(routeType === "guest") {
        if(isLogged()){
          if(location.state?.from) {
            return <Navigate
              replace
              to={location.state.from}
              state={{cartSelection: cartSelection}}
            />
          } else {
            return <Navigate replace to="/" />
          }
        } else {
          return <Outlet />;
        }
      } else if(routeType === "user") {
        return isLogged() ? (
          <Outlet />
        ) : <Navigate replace to="/" />;
      }
    } else {
      return <h2>Loading user data...</h2>
    }
  }
  
  return (
    <Elements
      stripe={stripePromise}
      // options={stripeOptions}
    >
      <Navbar />
      <AnimatePresence exitBeforeEnter>
        <Routes location={location} key={location.pathname}>
          {/* PUBLIC */}
          {/* <Route path="/" element={<GeneralLayout/>}> */}
            {/* <Route index element={<Welcome/>} /> */}
            <Route path="/" element={<Navigate replace to="/welcome"/>} />
            <Route path="/welcome" element={<Homepage/>} />
            <Route path="/products" element={<Products/>} />
            <Route path="/product">
              <Route path=":productTitle" element={<ProductPage/>} />
            </Route>
            <Route path="/chat" element={<ChatConnection/>} /> 
            <Route path="/cancel" element={<CheckoutCancel/>} /> 
            <Route path="/success" element={<CheckoutSuccess/>} />
            <Route path="/page-not-found" element={<PageNotFound/>} />
            {/* PRIVATE */}
            {/* RESTRICTED - USER */}
            <Route element={<Restricted routeType="user" />}>
              <Route path="/profile" element={<Profile/>} />
              <Route path="/cart" element={<Cart/>} />
            </Route>
            {/* RESTRICTED - GUEST */}
            <Route element={<Restricted routeType="guest" />}>
              <Route path="/login" element={<Login/>} />
              <Route path="/register" element={<Register/>} />
              <Route path="/forgot-password" element={<ForgotPassword/>} />
              <Route path="/reset-password" element={<ResetPassword/>} />
              <Route path="/forgot-2FA" element={<ForgotTFA/>} />
            </Route>
          {/* </Route> */}
        </Routes>
      </AnimatePresence>
    </Elements>
  );
}

export default App;
