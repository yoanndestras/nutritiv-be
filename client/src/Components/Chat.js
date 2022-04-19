import React, { useEffect, useRef, useState } from 'react'
import { io } from "socket.io-client";
import nutritivApi from '../Api/nutritivApi';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage, getLastMessageOfRoom } from '../Redux/reducers/messages';

const token = localStorage.getItem('refresh_token');
const socket = io(
  process.env.REACT_APP_API_ADDRESS_HOST,
  {
    query: { token },
  },
);

export const Chat = () => {
  const dispatch = useDispatch();
  const userId = useSelector(state => state.user._id)
  
  const [allUsers, setAllUsers] = useState(null)
  
  const [socketError, setSocketError] = useState(false)
  
  // CHATS INFO
  const [chatsInfos, setChatsInfo] = useState([])
  const [activeChatId, setActiveChatId] = useState(null)
  
  // CHATS CONTENT
  const [chat, setChat] = useState(null)
  const [messageToAdd, setMessageToAdd] = useState(null)
  const [messageToBeSent, setMessageToBeSent] = useState("")
  const [tempMessageId, setTempMessageId] = useState(0)
  
  const lastMessageOfRoom = useSelector(state => (
    getLastMessageOfRoom(state, activeChatId)
  ))
  
  const chatboxBottomRef = useRef();
  const chatRef = useRef(chat);
  
  useEffect(() => {
    chatRef.current = chat
  });
  
  // ############### //
  // ### SOCKETS ### //

  // CONNECTIONS TO CHANNELS
  useEffect(() => {
    socket.on('connect', () => {
      console.log("Connected to socket-io")
    })
    // MESSAGE
    socket.on("chatting", ({ id, text, sender, roomId }) => {
      console.log('# socket io res :', id, text, sender, roomId)
      setMessageToAdd({ id, text, sender, roomId })
    });
    // CREATE ROOM
    socket.on("createRoom", ({ roomCreated }) => {
      console.log('# roomCreated :', roomCreated)
    })
    // AUTH ERROR
    socket.on("connect_error", err => {
      console.log(err);
      console.log('connect_error')
      setSocketError({error: "connect_error"})
    });
    // OTHER ERROR
    socket.on("error", err => {
      console.log('error')
      console.log(err);
      setSocketError({error: "error"})
    });
    return () => {
      socket.on('disconnect', () => {
        console.log("disconnected from socket-io")
      })
    }
  }, []);
  
  // ADD INCOMING MESSAGES TO REDUX
  useEffect(() => {
    let isSubscribed = true;
    if(messageToAdd && isSubscribed) {
      dispatch(addMessage(messageToAdd))
    }
    return () => { isSubscribed = false }
  }, [dispatch, messageToAdd]);
  
  // ADD CORRESPONDING MESSAGES TO CHAT
  useEffect(() => {
    // !chat.messages.some(msg => (
    //   messagesOfRoom.includes(msgOfRoom => msgOfRoom === msg.id))
    // ) && (
      chatRef.current && lastMessageOfRoom && (
        setChat({
          ...chatRef.current,
          "messages": [
            ...chatRef.current.messages,
            lastMessageOfRoom
          ]
        })
      )
      console.log('# lastMessageOfRoom :', lastMessageOfRoom)
    // )
  }, [lastMessageOfRoom]);
  
  // ############### //
  
  // GET CHATS INFO
  useEffect(() => {
    let fetchApi = async () => {
      try {
        function useNull() {
          return null;
        }
        const method = "get"
        const requestsUrl = ['/chats/', '/users/']
        const requests = requestsUrl.map(url => {
          return { url, method }
        })
        
        await Promise.all([
          nutritivApi.request(requests[0]).catch(useNull),
          nutritivApi.request(requests[1]).catch(useNull),
        ]).then(function([chats, users]) {
          setAllUsers(users.data)
          setChatsInfo(chats.data)
          setActiveChatId(chats.data[0]._id)
          chatboxBottomRef.current?.scrollIntoView()
        }).catch(function([chats, users]) {
          console.log('# get /users/ err :', users)
          console.log('# get /chats/ err :', chats)
        })
        
      } catch(err) {
        console.error(
          'GET CHATS INFO err:', err
        )
      }
    }
    fetchApi();
  }, []);
  
  console.log('# allUsersNames :', allUsers)

  // ACTIVE CHAT
  useEffect(() => {
    let roomId = activeChatId // ?
    roomId && socket.emit("createRoom", ({ token }))

    let fetchApi = async () => {
      try {
        const { data } = await nutritivApi.get(
          `/chats/single/${activeChatId}/?messagesQty=${10}`
        )
        setChat(data)
        console.log('# /chats/single/ res :', data)
      } catch(err) {
        console.error('/chats/single/:', err)
      }
    }
    if(activeChatId){
      fetchApi();
    }
  }, [activeChatId]);
  
  // AUTO SCROLL
  useEffect(() => {
    chatboxBottomRef.current?.scrollIntoView()
  }, [chat]);
  
  // ACTIVE CHAT
  const handleActiveChat = (e) => {
    setActiveChatId(e.target.id)
  }

  // SEND MESSAGE
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    setTempMessageId(tempMessageId + 1)
    setChat({
      ...chat,
      "messages": [
        ...chat.messages,
        {
          "id": tempMessageId,
          "text": messageToBeSent,
          "sender": userId,
          "loading": true
        }
      ]
    })
    setMessageToBeSent("")
        
    try {
      const { data } = await nutritivApi.post(
        `/chats/message/${activeChatId}`,
        {
          text: messageToBeSent
        }
      )
      const { text, id } = data;
      let roomId = activeChatId;
      socket.emit('chatting', {text, id, token, roomId})
      setChat({
        ...chat,
        "messages": [
          ...chat.messages,
          {...data, loading: false}
        ]
      })
      console.log('# /chats/message/ :', data)
    } catch(err) {
      console.error('/chats/message/:', err)
    }
  }
  const handleMessageToBeSent = (e) => {
    setMessageToBeSent(e.target.value)
  }

  console.log('# chat :', chat)
  
  return (
    <div>
      {
        chatsInfos.map(chatInfo => (
          <React.Fragment key={chatInfo._id}>
            <br />
            <button
              id={chatInfo._id} 
              onClick={handleActiveChat}
              style={chatInfo._id === activeChatId ? {color: "grey"} : undefined}
            >
              {chatInfo._id}
            </button>
            {
              chatInfo._id === activeChatId && (
                <span role="img" aria-label='active' >
                  ◀
                </span>
              )
            }
          </React.Fragment>
        ))
      }
      <br />
      <br />
      
      {/* CHATBOX */}
      <div style={{
        background: "lightblue",
        display: "flex",
        flexDirection: "column", 
        height: '300px', 
        overflow: 'auto'
      }}>
        {chat && (
          <>
            {chat.messages.length > 0 ? (
                <>
                  {chat.messages.map(message => (
                    message.sender === userId ? (
                      <p
                        id={message.id}
                        key={message.id} 
                        style={{
                          alignSelf: "end",
                          textAlign: "right", 
                          width: "100%"
                        }}
                      >
                        <span style={{fontWeight: "bold"}}>
                          You:
                        </span>
                        <br />
                        {message.loading ? (
                          <span role="status" aria-label='sending'>
                            🕘
                          </span>
                        ) : (
                          <span role="status" aria-label='sent'>
                            ✔️
                          </span>
                        )}
                        {message.text}
                      </p>
                    ) : (
                      <p 
                        id={message.id} 
                        key={message.id}
                        style={{width: "100%"}}
                      >
                        {
                          allUsers.filter(user => user._id === message.sender).map(user => (
                            <span style={{fontWeight: "bold"}}>
                              {user.username}
                            </span>
                          ))
                        }
                        <br />
                        {message.text}
                      </p>
                    )
                  ))}
                </>
            ) : (
              <p>
                No messages in {chat._id}.
              </p>
            )}
            <div ref={chatboxBottomRef} />
          </>
        )}
        {/* SUBMIT */}
      </div>
      <form 
        onSubmit={handleSendMessage} 
        style={{display: 'flex'}}
      >
        <input 
          onChange={handleMessageToBeSent} 
          style={{flexGrow: 1}}
          type="text" 
          value={messageToBeSent} 
        />
        <input type="submit" value="send" />
      </form>
    </div>
  )
}