import React, { useEffect } from 'react'
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
  
  useEffect(() => {
    let fetchApi = async () => {
      try {
        await nutritivApi.get(
          `/chats/`
        )
        dispatch(
          updateUser({ hasChat: true })
        )
      } catch(err) {
        console.log(
          '/chats/?messagesQty=1', err
        )
      }
    }
    !hasChat && fetchApi();
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
        console.log('/chats/create:', err)
      }
    } else {
      navigate(
        '/login',
        { state: 
          { msg: "Please login and start a conversation right away!" }
        }
      );
    }
  }
  
  return (
    <div>
      <h2>
        Chats
      </h2>
      {hasChat ? (
        <Chat />
      ) : (
        <button onClick={handleConnectToChat}>
          Connect
        </button>
      )}
    </div>
  )
}