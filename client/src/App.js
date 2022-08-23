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
import { Shop } from './Components/Products/Shop';
import { CheckoutSuccess } from './Components/Payment/CheckoutSuccess';
import { CheckoutCancel } from './Components/Payment/CheckoutCancel';
import { ProductPage } from './Components/Products/ProductPage';
import { Cart } from './Components/Payment/Cart';
import { Homepage } from './Components/Homepage/Homepage';
import { PageNotFound } from './Components/PageNotFound/PageNotFound';
import { ChatConnection } from './Components/Chat/ChatConnection';
import { AnimatePresence } from 'framer-motion';
import { ForgotPassword } from './Components/Authentication/ForgotPassword';
import { ForgotTFA } from './Components/Authentication/ForgotTFA';
import { ResetPassword } from './Components/Authentication/ResetPassword';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { ReleaseNotes } from './Components/Releases/ReleaseNotes';
import { Global, css } from '@emotion/react';
import './App.scss';
import { tokens } from './Helpers/styleTokens';
import { PageContainer } from './Components/PageContainer';
import { AboutUs } from './Components/AboutUs/AboutUs';
import { NavbarMenu } from './Components/Header/NavbarMenu';
import { PagesWrapper } from './Components/PagesWrapper';
import { GradientBackground } from './Components/GradientBackground';

// init stripe
const stripePromise = loadStripe(
  process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY
);

function App() {
  const [gettingUserInfo, setGettingUserInfo] = useState(false);
  const dispatch = useDispatch();
  const loggedIn = useSelector(state => state.user.loggedIn);
  const mobileNavMenu = useSelector(state => state.modals.mobileNavMenu);
  const location = useLocation();
  const navigate = useNavigate();
  
  const [searchParams] = useSearchParams();
  const oAuthStatus = searchParams.get('status');
  const oAuthMessage = searchParams.get('message');
  const oAuthUsername = searchParams.get('username');
  const oAuthAccessToken = searchParams.get('oAuthToken');
  const registrationToken = searchParams.get('verificationToken');
  
  useEffect(() => {
    // App titles
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

  useEffect(() => {
    // oAUTH
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
    // VERIFY REGISTRATION
    } else if(registrationToken) {
      let isMounted = true;
      let fetchApi = async () => {
        console.log('# registrationToken :', registrationToken)
        try {
          await nutritivApi.put(
            `/auth/verify_email/?token=${registrationToken}`
          )
          console.log('# isMounted :', isMounted)
          if(isMounted){
            navigate(
              '/login',
              { state:
                {
                  msg: "Account verified, you can login.",
                  status: "success",
                }
              }
            )
          }
        } catch(err) {
          console.error(
            'auth/verify_email:', err
          )
        }
      }
      fetchApi();
    }
  }, [
      navigate, 
      oAuthAccessToken, 
      oAuthMessage, 
      oAuthStatus, 
      oAuthUsername, 
      registrationToken
    ]);
  
  // RESTRICTED ROUTES
  const Restricted = ({ routeType }) => {
    const cartSelection = location.state?.cartSelection;
    const isLogged = () => {
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
      <GoogleReCaptchaProvider
        reCaptchaKey='6Lekw4sgAAAAAIY_DQO_d8uE7fOBQr-g9lqEOqGP'
      >
        {/* Global styles */}
        <Global 
          styles={
            css`
              * {
                max-width: ${tokens.maxWidth.xl};
              }
              body {
                background: black;
                color: ${tokens.color.contrastLight};
                font-family: 'Roboto', sans-serif;
                position: relative;
              }
              html, body, 
              #iceberg-container, #iceberg-video,
              #root, #gradient-background {
                max-width: none;
              }
              #root {
                min-height: 100%;
                height: auto;
                perspective: 3000px;
                perspective-origin: ${mobileNavMenu ? "-100% 50%" : "center"};
                > div {
                  max-width: none;
                }
              }
            `
          }
        />
        <GradientBackground
          firstColor={tokens.color.secondary}
          secondColor={tokens.color.primary}
          minimizedHomepageColor={tokens.color.primary}
          minimizedDefaultColor={tokens.color.secondary}
        />
        <NavbarMenu open={mobileNavMenu} />
        <AnimatePresence exitBeforeEnter>
          <Routes
            location={location} 
            key={location.pathname}
          >
            <Route path="" element={
              <PagesWrapper minimized={mobileNavMenu}/>
            }>
              {/* PUBLIC */}
              <Route
                path="*"
                element={<Navigate to="/page-not-found" replace/>}
              />
              <Route
                index
                path="/welcome"
                element={<Homepage/>}
              />
              <Route path="/team" element={
                <PageContainer><AboutUs/></PageContainer>
              }/>
              <Route path="/shop" element={
                <PageContainer><Shop/></PageContainer>
              }/>
              <Route path="/product">
                <Route path=":productTitle" element={
                  <PageContainer><ProductPage/></PageContainer>
                }/>
              </Route>
              <Route path="/chat" element={
                <PageContainer><ChatConnection/></PageContainer>
              }/> 
              <Route path="/releases" element={
                <PageContainer><ReleaseNotes/></PageContainer>
              }/>
              <Route path="/cancel" element={
                <PageContainer><CheckoutCancel/></PageContainer>
              }/>
              <Route path="/success" element={
                <PageContainer><CheckoutSuccess/></PageContainer>
              }/>
              <Route path="/page-not-found" element={
                <PageContainer><PageNotFound/></PageContainer>
              }/>
              <Route
                path="/"
                element={<Navigate to="/welcome" replace/>}
              />
              {/* PRIVATE */}
              {/* RESTRICTED - USER */}
              <Route element={<Restricted routeType="user" />}>
                <Route path="/profile" element={
                  <PageContainer><Profile/></PageContainer>
                }/>
                <Route path="/cart" element={
                  <PageContainer><Cart/></PageContainer>
                }/>
              </Route>
              {/* RESTRICTED - GUEST */}
              <Route element={<Restricted routeType="guest" />}>
                <Route path="/login" element={
                  <PageContainer><Login/></PageContainer>
                }/>
                <Route path="/register" element={
                  <PageContainer><Register/></PageContainer>
                }/>
                <Route path="/forgot-password" element={
                  <PageContainer><ForgotPassword/></PageContainer>
                }/>
                <Route path="/reset-password" element={
                  <PageContainer><ResetPassword/></PageContainer>
                }/>
                <Route path="/forgot-2FA" element={
                  <PageContainer><ForgotTFA/></PageContainer>
                }/>
              </Route>
            </Route>
          </Routes>
        </AnimatePresence>
      </GoogleReCaptchaProvider>
    </Elements>
  );
}

export default App;
