import styled from '@emotion/styled';
import React from 'react'
import { useSelector } from 'react-redux';
import { tokens } from '../../Helpers/styleTokens';

const Img = styled.img`
  border-radius: ${tokens.borderRadius.max};
`

export const UserAvatar = (props) => {
  const avatar = useSelector(state => state.user.avatar);
  return (
    <Img
      alt="avatar"
      src={avatar}
      {...props}
    />
  )
}