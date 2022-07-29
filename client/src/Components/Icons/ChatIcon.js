import React from 'react'

export const ChatIcon = (props) => {
  const { color, strokeWidth, width, height } = props;

  return (
    <svg 
      className="h-6 w-6" 
      fill="none"
      stroke={color} 
      strokeWidth={strokeWidth}
      viewBox="0 0 24 24" 
      height={height || "100%"}
      width={width || "100%"}
      xmlns="http://www.w3.org/2000/svg" 
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" 
      />
    </svg>
  )
}