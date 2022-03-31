import React, { useEffect } from 'react';
import { 
  // useSelector, 
  useDispatch,
  useSelector,
} from "react-redux";
import { 
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import {
  updateUser, updateUserCartQuantity,
} from './Redux/reducers/user';
import nutritivApi from './Api/nutritivApi';
import GeneralLayout from './Layouts/GeneralLayout.js';
import Register from './Components/Register.js';
import Login from './Components/Login.js';
import Profile from './Components/Profile';
import { Products } from './Components/Products';
import { CheckoutSuccess } from './Components/CheckoutSuccess';
import { CheckoutCancel } from './Components/CheckoutCancel';
import { ProductPage } from './Components/ProductPage';
import { Cart } from './Components/Cart';
import { Welcome } from './Components/Homepage';
import { PageNotFound } from './Components/PageNotFound';
import { ChatConnection } from './Components/ChatConnection';

// init stripe
const stripePromise = loadStripe(
  process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY
);

function App() {
  const dispatch = useDispatch();
  const loggedIn = useSelector(state => state.user.loggedIn)
  
  // ON LOAD
  // Get user-self info & update store
  useEffect(() => {
    let isSubscribed = true;
    const checkUserAuth = async () => {
      try {
        const { data } = await nutritivApi.get(
          '/users/self'
        );
        if(isSubscribed) {
          console.log('# /users/self res :', data)
          dispatch(updateUser({
            id: data._id,
            loggedIn: data.loggedIn,
            username: data.username,
            email: data.email,
            isAdmin: data.isAdmin,
            isVerified: data.isVerified,
            addresses: data.addressDetails,
            avatar: data.avatar,
            chat: data.chat,
          }))
        }
      } catch(err) {
        console.error('# /users/self :', err)
      }
    };
    checkUserAuth();
    return () => { isSubscribed = false }
  }, [dispatch]);
  
  // Get user-self cart
  useEffect(() => {
    const checkSelfCartQuantity = async () => {
      try {
        const { data } = await nutritivApi.get(
          `/carts/self`,
        );
        data.cart ? (
          dispatch(updateUserCartQuantity({
            cartQuantity: data.cart.totalQuantity,
          }))
        ) : (
          dispatch(updateUserCartQuantity({
            cartQuantity: 0,
          }))
        )
        console.log('# checkSelfCartQuantity data :', data)
      } catch(err) {
        console.error('# err', err)
      }
    }
    checkSelfCartQuantity();
  }, [dispatch])
  
  // RESTRICTED ROUTES
  const GuestRoutes = () => {
    const isLogged = () => {
      const user = { loggedIn }
      return user.loggedIn;
    }
    return isLogged() ? (
      <Navigate replace to="/" /> 
    ) : <Outlet />;
  }
  const UserRoutes = () => {
    const isLogged = () => {
      const user = { loggedIn }
      return user.loggedIn;
    }
    return isLogged() ? (
      <Outlet /> 
    ) : <Navigate replace to="/" />;
  }
  
  return (
    <BrowserRouter>
      <Elements
        stripe={stripePromise}
        // options={stripeOptions}
      >
        <Routes>
          {/* PUBLIC */}
          {/* <Route path="*" element={<Navigate replace to="/page-not-found"/>} /> */}
          <Route path="/" element={<GeneralLayout/>}>
            <Route index element={<Welcome/>} />
            <Route path="/products" element={<Products/>} />
            <Route path="/product">
              <Route path=":productTitle" element={<ProductPage/>} />
            </Route>
            <Route path="/chat" element={<ChatConnection/>} /> 
            <Route path="/cancel" element={<CheckoutCancel/>} /> 
            <Route path="/success" element={<CheckoutSuccess/>} />
            <Route path="/page-not-found" element={<PageNotFound/>} />
            {/* PRIVATE */}
            <Route path="/profile" element={<Profile/>} />
            {/* RESTRICTED - LOGGED */}
            <Route element={<UserRoutes />}>
              <Route path="/cart" element={<Cart/>} />
            </Route>
            {/* RESTRICTED - NOT LOGGED */}
            <Route element={<GuestRoutes />}>
              <Route path="login" element={<Login/>} />
              <Route path="register" element={<Register/>} />
            </Route>
          </Route>
        </Routes>
      </Elements>
    </BrowserRouter>
  );
}

export default App;
