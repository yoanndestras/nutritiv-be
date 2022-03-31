import React, { useEffect, useState } from 'react'
import nutritivApi from '../Api/nutritivApi'
import { Chat } from './Chat'

export const ChatConnection = () => {
  const [connected, setConnected] = useState(false)
  
  useEffect(() => {
    let fetchApi = async () => {
      try {
        await nutritivApi.get(
          `/chats/?messagesQty=${1}`
        )
        setConnected(true)
        console.log('setConnected(true)')
      } catch(err) {
        console.error(
          '/chats/?messagesQty=1', err
        )
      }
    }
    !connected && fetchApi();
  });

  console.log('# connected :', connected)
  
  const handleConnectToChat = async () => {
    try {
      const { data } = await nutritivApi.post(
        `/chats/create`,
      )
      setConnected(true)
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
      {connected ? (
        <Chat />
      ) : (
        <button onClick={handleConnectToChat}>
          Connect
        </button>
      )}
    </div>
  )
}