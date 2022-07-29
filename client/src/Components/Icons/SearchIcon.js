import React from 'react'

export const SearchIcon = (props) => {
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
      <g transform="scale(-1,1) translate(-24, 0)">
        <path
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  )
}