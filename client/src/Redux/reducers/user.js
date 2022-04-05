import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  _id: null,
  loggedIn: false,
  username: "",
  email: "",
  isAdmin: false,
  isVerified: false,
  cartQuantity: 0,
  addresses: [],
  avatar: "",
  activeChat: false,
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
    logoutUser: () => initialState
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
