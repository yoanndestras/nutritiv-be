import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import nutritivApi from '../../Api/nutritivApi'
import { updateUser } from '../../Redux/reducers/user'
import { Chat } from './Chat'

export const ChatConnection = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loggedIn = useSelector(state => state.user.loggedIn)
  const hasChat = useSelector(state => state.user.hasChat)
  const [error, setError] = useState("")
  
  useEffect(() => {
    let fetchApi = async () => {
      try {
        const { data } = await nutritivApi.get(
          `/chats/`
        )
        if(data.success) {
          dispatch(
            updateUser({ hasChat: true })
          )
        } else {
          dispatch(
            updateUser({ hasChat: false })
          )
        }
      } catch(err) {
        console.log(
          '/chats/?messagesQty=1', err
        )
      }
    }
    loggedIn && !hasChat && fetchApi();
  });
  
  const handleConnectToChat = async () => {
    if(loggedIn) {
      try {
        const { data } = await nutritivApi.post(
          `/chats/create`,
        )
        dispatch(
          updateUser({ hasChat: true })
        )
        console.log('# post /chats/create :', data)
      } catch(err) {
        setError(err.response?.data?.err)
        console.log('/chats/create:', err)
      }
    } else {
      navigate(
        '/login',
        { state: 
          { 
            msg: "Please login and start a conversation right away!", 
            from: `/chat`
          }
        }
      );
    }
  }
  
  return (
    <div>
      <h2>
        Chat(s)
      </h2>
      {hasChat ? (
        <Chat />
      ) : (
        <button onClick={handleConnectToChat}>
          Connect
        </button>
      )}
      {/* Error */}
      {
        error && <p style={{color: "red"}}>{error}</p>
      }
    </div>
  )
}