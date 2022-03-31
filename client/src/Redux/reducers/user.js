import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  id: null,
  loggedIn: false,
  username: "",
  email: "",
  isAdmin: false,
  isVerified: false,
  cartQuantity: 0,
  addresses: [],
  avatar: "",
  chat: false,
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateAuthStatus: (user, action) => {
      const { loggedIn } = action.payload;
      user.loggedIn = loggedIn;
    },
    updateUser: (user, action) => {
      user.id = action.payload.id;
      user.loggedIn = action.payload.loggedIn;
      user.username = action.payload.username;
      user.email = action.payload.email;
      user.isAdmin = action.payload.isAdmin;
      user.isVerified = action.payload.isVerified;
      user.addresses = action.payload.addresses;
      user.avatar = action.payload.avatar;
      user.chat = action.payload.chat;
    },
    updateUserCartQuantity: (user, action) => {
      const { cartQuantity } = action.payload;
      user.cartQuantity = cartQuantity;
    },
    updateUserAddresses: (user, action) => {
      const { addresses } = action.payload;
      user.addresses = addresses;
    },
    updateUserAvatar: (user, action) => {
      const { avatar } = action.payload;
      user.avatar = avatar;
    },
    deleteUserAddress: (user, action) => {
      const { addressId } = action.payload;
      return user.addresses.filter(
        address => address._id !== addressId
      )
    },
    logoutUser: () => initialState
  }
})
export const {
  updateUser,
  updateUserCartQuantity,
  updateAuthStatus,
  updateUserAddresses,
  deleteUserAddress,
  updateUserAvatar,
  logoutUser,
} = userSlice.actions;

// Selector

export default userSlice.reducer;
