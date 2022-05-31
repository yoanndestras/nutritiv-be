import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import nutritivApi from '../../Api/nutritivApi'
import { updateUser } from '../../Redux/reducers/user';

export const ProfileEmail = ({ userInfo }) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("")
  
  const handleChange = (e) => {
    setEmail(e.target.value)
  }
  
  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    try {
      const { data } = await nutritivApi.put(
        `/users/updateEmail`,
        {
          email
        }
      )
      setEmail("")
      dispatch(
        updateUser({ email })
      )
      console.log('# /users/updateEmail :', data)
    } catch(err) {
      console.error('/users/updateEmail:', err)
    }
  }
  
  return (
    <div>
      <span>
        <h3>
          Email
        </h3>
        {userInfo.email}
        <br />
        <input
          onChange={handleChange}
          placeholder="Enter new email..." 
          type="text"
        />
        <br />
        <button onClick={handleUpdateEmail}>
          Change email
        </button>
      </span>
    </div>
  )
}
