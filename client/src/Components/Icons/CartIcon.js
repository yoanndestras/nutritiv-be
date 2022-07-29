import React from 'react'

export const CartIcon = (props) => {
  const { color, strokeWidth, width, height } = props;
  
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      className="h-6 w-6" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke={color} 
      strokeWidth={strokeWidth}
      height={height || "100%"}
      width={width || "100%"}
    >
      <path
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" 
      />
    </svg>
  )
}