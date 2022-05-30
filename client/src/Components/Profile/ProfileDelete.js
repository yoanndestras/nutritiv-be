import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import nutritivApi from '../../Api/nutritivApi';
import { logoutUser } from '../../Redux/reducers/user';

export const ProfileDelete = () => {
  const selfUserId = useSelector(state => state.user._id)
  const dispatch = useDispatch();
  
  const handleDelete = async (e) => {
    e.preventDefault();
    try {
      const { data } = await nutritivApi.delete(
        `/users/${selfUserId}`,
      )
      dispatch(
        logoutUser()
      )
      console.log('# delete /users/ :', data)
    } catch(err) {
      console.error('/users/:', err)
    }
  }
  
  return (
    <>
      <h3>
        Delete Account
      </h3>
      <button onClick={handleDelete} style={{color: "red"}}>
        Delete account
      </button>
    </>
  )
}