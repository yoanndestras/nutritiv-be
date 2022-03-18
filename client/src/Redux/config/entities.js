import { combineReducers } from "redux";
import userSlice from '../reducers/user';

export default combineReducers({
    // products: productsSlice,
    user: userSlice,
})
