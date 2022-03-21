import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  loggedIn: false,
  username: "",
  email: "",
  isAdmin: false,
  isVerified: false,
  cartQuantity: 0,
  addresses: [],
  avatar: "",
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
      const { 
        loggedIn,
        username,
        email,
        isAdmin,
        isVerified,
        addresses,
        avatar,
      } = action.payload;
      user.loggedIn = loggedIn;
      user.username = username;
      user.email = email;
      user.isAdmin = isAdmin;
      user.isVerified = isVerified;
      user.addresses = addresses;
      user.avatar = avatar;
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
