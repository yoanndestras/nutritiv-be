import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ProfileTFA } from './ProfileTFA';
import { ProfileAddress } from './ProfileAddress';
import { ProfileAvatar } from './ProfileAvatar';
import { ProfileEmail } from './ProfileEmail';
import { ProfilePassword } from './ProfilePassword';
import { ProfileUsername } from './ProfileUsername';
import { ProfileDelete } from './ProfileDelete';
import { Logout } from '../Authentication/Logout';

export default function Profile() {
  const user = useSelector(state => state.user)
  const [userInfo, setUserInfo] = useState({})

  useEffect(() => {
    setUserInfo(user)
  }, [user]);
  
  return (
    <div>
      <h1>Profile</h1>
      
      <hr />
      <ProfileAvatar 
        userInfo={userInfo} 
      />
      <br />
      
      <hr />
      <ProfileUsername 
        userInfo={userInfo} 
      />
      <br />
      
      <hr />
      <ProfileEmail 
        userInfo={userInfo} 
      />
      <br />
      
      <hr />
      <ProfilePassword />
      <br />
      
      <hr />
      <ProfileTFA userInfo={userInfo} />
      <br />

      <hr />
      <ProfileAddress userInfo={userInfo} />
      <br />
      
      <hr />
      <Logout label />
      <br />
      
      <hr />
      <ProfileDelete userInfo={userInfo} />
      <br />

      <hr />
      Is admin: {userInfo.isAdmin?.toString()}
      <br />
      Is verified: {userInfo.isVerified?.toString()}
      <br />
    </div>
  )
}
