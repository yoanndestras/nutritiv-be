import React, { useState } from 'react'
import { useDispatch } from 'react-redux';
import nutritivApi from '../../Api/nutritivApi'
import { updateUser } from '../../Redux/reducers/user';

export const ProfileUsername = ({ userInfo }) => {
  const dispatch = useDispatch();
  const [username, setUsername] = useState("")
  
  const handleChange = (e) => {
    setUsername(e.target.value)
  }
  
  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    try {
      const { data } = await nutritivApi.put(
        `/users/updateUsername`,
        {
          username
        }
      )
      setUsername("")
      dispatch(
        updateUser({ username })
      )
      console.log('# put /users/updateUsername :', data)
    } catch(err) {
      console.error('/users/updateUsername:', err)
    }
  }
  
  return (
    <div>
      <span>
        <h3>
          Username
        </h3>
        {userInfo.username}
        <br />
        <input
          onChange={handleChange}
          placeholder="Enter new username..."
          type="text"
        />
        <br />
        <button onClick={handleUpdateUsername}>
          Change username
        </button>
      </span>
    </div>
  )
}
