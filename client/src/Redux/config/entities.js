import { combineReducers } from "redux";
import userSlice from '../reducers/user';
import messagesSlice from '../reducers/messages';
import modalsSlice from '../reducers/modals';

export default combineReducers({
    user: userSlice,
    messages: messagesSlice,
    modals: modalsSlice
})
