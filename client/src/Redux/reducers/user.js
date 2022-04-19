import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  _id: null,
  loggedIn: null,
  username: "",
  email: "",
  isAdmin: false,
  isVerified: false,
  cartQuantity: null,
  addresses: [],
  avatar: "",
  hasChat: false,
  activeChat: null,
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateUser: (user, action) => {
      let values = Object.keys(action.payload)
      values.forEach(value => {
        user[value] = action.payload[value]
      })
    },
    updateUserCartQuantity: (user, action) => {
      user.cartQuantity = action.payload;
    },
    deleteUserAddress: (user, action) => {
      const { addressId } = action.payload;
      return user.addresses.filter(
        address => address._id !== addressId
      )
    },
    logoutUser: (user, action) => {
      return {
        ...initialState,
        loggedIn: false
      }
    }
  }
})
export const {
  updateUser,
  updateUserCartQuantity,
  deleteUserAddress,
  logoutUser,
} = userSlice.actions;

// Selector

export default userSlice.reducer;
