import styled from '@emotion/styled';
import React from 'react'
import { tokens } from '../../Helpers/styleTokens';

export const CounterIcon = (props) => {
  const { 
    count, backgroundColor, textColor 
  } = props;
  
  const Count = styled.span`
    color: ${textColor};
    font-size: ${tokens.font.fontSize.xs};
    left: -1px;
    position: absolute;
    top: 4px;
    text-align: center;
    width: 100%;
  `
  
  return (
    <>
      <svg
        fill={backgroundColor}
        viewBox="0 0 100 100" 
        height="90%"
        width="90%"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="50" cy="50" r="50" />
      </svg>
      <Count>
        {count}
      </Count>
    </>
  )
}