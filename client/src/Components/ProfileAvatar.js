import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import nutritivApi from '../Api/nutritivApi';
import { updateUserAvatar } from '../Redux/reducers/user';

export const ProfileAvatar = ({ userInfo }) => {
  const dispatch = useDispatch();
  // const avatarSelector = useSelector(state => state.user.avatar)
  // const [avatar, setAvatar] = useState("")
  const [file, setFile] = useState(null)
  
  // useEffect(() => {
  //   setAvatar(avatarSelector)
  // }, [avatarSelector]);

  const handleUpload = (e) => {
    setFile(e.target.files[0])
  }
  
  const onClick = async () => {
    var formData = new FormData();
    formData.append("imageFile", file);
    
    try {
      const { data } = await nutritivApi.post(
        `/users/addAvatar`,
        formData,
      )
      dispatch(updateUserAvatar({
        avatar: data.avatar
      }))
    } catch (err) {
      console.log('# err :', err)
    }
  };
  
  return (
    <>
      <h3>
        Avatar
      </h3>
      <form onSubmit={() => false}>
        <input 
          id="file" 
          name="imageFile"
          type="file"
          onChange={handleUpload}
        />
        <br />
        <button
          disabled={!file}
          id="upload" 
          type="button" 
          onClick={onClick}
        >
          Save avatar
        </button>
      </form>
      {
        userInfo.avatar && <img 
          alt="avatar"
          src={userInfo.avatar}
        />
      }
    </>
  );
};