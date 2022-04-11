# NUTRITIV-FE

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