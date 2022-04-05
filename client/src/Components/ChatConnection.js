import React, { useEffect, useState } from 'react'
import nutritivApi from '../Api/nutritivApi'
import { Chat } from './Chat'

export const ChatConnection = () => {
  const [chatCreated, setChatCreated] = useState(false)
  
  useEffect(() => {
    let fetchApi = async () => {
      try {
        await nutritivApi.get(
          `/chats/?messagesQty=${1}`
        )
        setChatCreated(true)
        console.log('# Chatroom created :', chatCreated)
        console.log('setConnected(true)')
      } catch(err) {
        console.error(
          '/chats/?messagesQty=1', err
        )
      }
    }
    !chatCreated && fetchApi();
  });
  
  const handleConnectToChat = async () => {
    try {
      const { data } = await nutritivApi.post(
        `/chats/create`,
      )
      setChatCreated(true)
      console.log('# post /chats/create :', data)
    } catch(err) {
      console.error('/chats/create:', err)
    }
  }
  
  return (
    <div>
      <h2>
        Chats
      </h2>
      {chatCreated ? (
        <Chat />
      ) : (
        <button onClick={handleConnectToChat}>
          Connect
        </button>
      )}
    </div>
  )
}