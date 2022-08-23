import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mobileNavMenu: false,
}

export const modalsSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    openMobileNavMenu: (modals) => {
      modals.mobileNavMenu = true
    },
    closeMobileNavMenu: (modals) => {
      modals.mobileNavMenu = false
    },
  }
})
export const {
  closeMobileNavMenu,
  openMobileNavMenu,
} = modalsSlice.actions;

export default modalsSlice.reducer;
