import { createSlice } from "@reduxjs/toolkit";

// REDUX THUNK //
// export const getAllUsers = createAsyncThunk(
//   'test/getTest',
//   async () => {
//     return await nutritivApi.get('/users')
//   }
// )

export const messagesSlice = createSlice({
  name: 'messages',
  initialState: [],
  reducers: {
    addMessage: (messages, action) => {
      messages.push(action.payload)
    },
  },
  // REDUX THUNK //
  // extraReducers: {
  //   [getAllUsers.pending]: (state, action) => {
  //     state.loading = true
  //   },
  //   [getAllUsers.fulfilled]: (state, { data }) => {
  //     state.loading = false
  //     state.test = data
  //   },
  //   [getAllUsers.rejected]: (state, action) => {
  //     state.loading = false
  //     state.error = action
  //   },
  // }
})
export const {
  addMessage,
} = messagesSlice.actions;

// Selector
export const getLastMessageOfRoom = (state, activeChat) => {
  let filteredMessages = state.messages.filter(message => (
    message.roomId === activeChat
  ))
  let result = filteredMessages[filteredMessages.length - 1]
  return result
}

export default messagesSlice.reducer;
