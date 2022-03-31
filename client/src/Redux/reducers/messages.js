import { createSlice } from "@reduxjs/toolkit";

export const messagesSlice = createSlice({
  name: 'messages',
  initialState: [],
  reducers: {
    addMessage: (messages, action) => {
      messages.push(action.payload)
    },
  }
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
