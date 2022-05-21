import React from 'react'
import nutritivApi from '../../Api/nutritivApi'
import { storageKeys } from '../../Helpers/localStorage';

export const Logout = () => {
  
  const handleLogout = async () => {
    try {
      await nutritivApi.delete(
        `/auth/logout`,
      )
      localStorage.removeItem(storageKeys.accessToken)
      localStorage.removeItem(storageKeys.refreshToken)
    } catch(err) {
      console.error(':', err)
    }
  }

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  )
}