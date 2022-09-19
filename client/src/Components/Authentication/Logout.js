import styled from '@emotion/styled';
import React from 'react'
import { useDispatch } from 'react-redux';
import nutritivApi from '../../Api/nutritivApi'
import { storageKeys } from '../../Helpers/localStorage';
import { tokens } from '../../Helpers/styleTokens';
import { logoutUser } from '../../Redux/reducers/user';
import { Icon } from '../Icons/Icon';

const Container = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  &:hover {
    opacity: 0.8;
  };
`

export const Logout = ({ label, style }) => {
  const dispatch = useDispatch();
  
  const handleLogout = async () => {
    try {
      await nutritivApi.delete(
        `/auth/logout`,
      )
      dispatch(
        logoutUser()
      )
      localStorage.removeItem(storageKeys.accessToken)
      localStorage.removeItem(storageKeys.refreshToken)
    } catch(err) {
      console.error(':', err)
    }
  }
  
  return (
    <Container
      onClick={handleLogout}
      style={style}
    >
      <Icon
        name="exit"
        color={tokens.color.contrastLight}
        strokeWidth={2}
        height={23}
        width={23}
        style={{marginRight: "10px"}}
      />
      {label && (
        <label style={{cursor: "pointer"}}>
          Logout
        </label>
      )}
    </Container>
  )
}