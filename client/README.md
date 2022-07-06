# NUTRITIV-FE

[![](https://img.shields.io/badge/-ReactJs-61DAFB?logo=react&logoColor=black&style=flat)](https://reactjs.org/) 

[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/Monstarrrr/nutritiv-fe.svg?logo=lgtm&logoWidth=18&color=lemon)](https://lgtm.com/projects/g/Monstarrrr/nutritiv-fe/?mode=list) 
[![W3C Validation](https://img.shields.io/w3c-validation/html?targetUrl=https%3A%2F%2Fnutritiv-staging.herokuapp.com%2Flogin&color=lemon)](https://validator.w3.org/nu/?doc=https%3A%2F%2Fnutritiv-staging.herokuapp.com%2F)  
[![GitHub commit activity](https://img.shields.io/github/commit-activity/w/monstarrrr/nutritiv-fe)](#) 
[![GitHub last commit](https://img.shields.io/github/last-commit/monstarrrr/nutritiv-fe?color=blue&label=last%20updated)](#) 
[![Lines of code](https://img.shields.io/tokei/lines/github/Monstarrrr/nutritiv-fe)](#) 

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
See section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Website Structure

### Nav
- Homepage
- Results
- Product

### Buyer & Seller
- Login
- Sign Up
- Forgot
- Profile
- Settings

### Buyer
- Cart
- Order
<!-- - Payment -->

### Seller
- Upload
- Dashboard

### Admin
- Moderation
- Dashboard

## Work steps

1. Routing
   - Route
   - Navigate 
   - useNavigate
   - Link (param "state" to carry data )
   - useLocation (useLocation.state to retrieve data)
   - Outlet
   - useParams

2. Axios
   - Add default.baseURL
   - Get JWT token w/ res & store it locally w/ localStorage.setItem
   - Login/Signup
   - set localStorage tokens interceptor

## Workspace tools

### Dependencies

- react-router-dom (v6)
