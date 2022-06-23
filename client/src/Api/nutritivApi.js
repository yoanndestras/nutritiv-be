import axios from 'axios';
import { storageKeys } from '../Helpers/localStorage';
import { 
  updateUser
} from '../Redux/reducers/user';

// # INJECT STORE TO PREVENT IMPORT ISSUES #
let store
export const injectStore = _store => {
  store = _store
}

// URLs
const s3Address = process.env.REACT_APP_S3_ADDRESS
const s3Products = process.env.REACT_APP_S3_PRODUCTS
export const s3URL = `${s3Address}${s3Products}`

const apiVersion = process.env.REACT_APP_API_VERSION
const apiAddress = process.env.REACT_APP_API_ADDRESS_FULL
export const baseURL = `${apiAddress}${apiVersion}`

// # API INSTANCE #
const nutritivApi = axios.create({
  baseURL,
})

// # INTERCEPTORS #
// on request
nutritivApi.interceptors.request.use(req => {
  const refreshToken = localStorage.getItem(storageKeys.refreshToken);
  const accessToken = localStorage.getItem(storageKeys.accessToken);
  req.headers.access_token = accessToken;
  req.headers.refresh_token = refreshToken;
  console.log("# Interceptor req :", req)
  return req;
}, function (err) {
  return Promise.reject(err)
})

// on response
nutritivApi.interceptors.response.use(res => {
  // set tokens in localStorage
  if(res.headers.access_token || res.headers.refresh_token) {
    localStorage.setItem(
      'access_token',
      res.headers.access_token
    )
    localStorage.setItem(
      'refresh_token',
      res.headers.refresh_token
    )
  }
  if(res.headers.twofa_token) {
    localStorage.setItem(
      'twofa_token',
      res.headers.twofa_token
    )
  }
  if(res.headers.new_twofa_token) {
    localStorage.setItem(
      'new_twofa_token',
      res.headers.new_twofa_token
    )
  }
  if(res.data.loggedIn === false) {
    store.dispatch(
      updateUser(res.data)
    )
  }
  console.log("# Interceptor res :", res);
  return res;
}, function (err) {
  if(err?.response?.status === 429) {
    console.error(
      "# Too many API requests :", 
      err.response.status
    )
  } else if (err?.response?.status === 500) {
    console.error(
      "# Internal server error: ",
      err.response.status
    )
  }
  return Promise.reject(err)
})

export default nutritivApi;