import { combineReducers } from "redux";
import userSlice from '../reducers/user';
import messagesSlice from '../reducers/messages';

export default combineReducers({
    user: userSlice,
    messages: messagesSlice,
})
