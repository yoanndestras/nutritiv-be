import styled from '@emotion/styled';
import React from 'react'
import { tokens } from '../../Helpers/styleTokens';
import { motion } from 'framer-motion';

const Count = styled.span`
  color: ${props => props.textColor};
  font-size: ${tokens.font.fontSize.xs};
  left: -1px;
  position: absolute;
  top: 4px;
  text-align: center;
  width: 100%;
`

const viewBox = [
  {
    cart:         [{default: "0 0 24 24"},  {filled: "1 0 19 19"}],
    shop:         [{default: "1 0 24 24"},  {filled: "1 0 19 19"}],
    chat:         [{default: "0 -1 26 26"}, {filled: "0 -1 22 22"}],
    menu:         [{default: "0 0 22 22"}],
    close:        [{default: "0 0 24 24"}],
    search:       [{default: "0 -2 28 28"}, {filled: "1 1 18 18"}],
    home:         [{default: "0 0 25 25"},  {filled: "0 0 21 21"}],
    user:         [{default: "0 -1 27 27"}, {filled: "0 -1 22 22"}],
    users:        [{default: "-1 -1 27 27"}, {filled: "-1 -1 23 23"}],
    tag:          [{default: "0 -2 27 27"}, {filled: "0 -2 23 23"}],
    login:        [{default: "0 -1 26 26"}],
    exit:         [{default: "0 0 23 23"}],
    counter:      [{default: "0 0 100 100"}, {filled: "0 0 100 100"}],
    "arrow-down": [{default: "0 0 100 100"}],
    wave:         [{default: "0 0 100 100"}, {filled: "0 0 100 100"}],
    beaker:       [{default: "0 0 24 24"}, {filled: "0 0 24 24"}],
  },
]

export const Icon = (props) => {
  const { 
    name, // required
    color, // required
    filled,
    textColor,
    strokeWidth,
    width, 
    height,
    hovered,
    resizeDefault,
    resizeFilled,
    count,
    style
  } = props;
  
  const pathVariant = {
    notHovered: {
      pathLength: 0,
    },
    hovered: {
      pathLength: 1,
      transition: {
        ease: "easeInOut",
      }
    }
  }

  return (
    <>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-6 w-6" 
        fill={filled ? color : "none"}
        viewBox={
          (resizeDefault && !filled) ? resizeDefault : (
            (resizeFilled && filled) ? resizeFilled : (
              filled ? (
                viewBox[0][`${name}`][1].filled
              ) : (
                viewBox[0][`${name}`][0].default
              )
            )
          )
        }
        stroke={color || tokens.color.contrastLight} 
        strokeWidth={strokeWidth ? strokeWidth : 0}
        height={height || "100%"}
        width={width || "100%"}
        style={style}
      >
        {name === "shop" && (
          filled ? (
            <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
          ) : (
            <path strokeLinecap="round"  strokeLinejoin="round"  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          )
        )}
        {name === "cart" && (
          filled ? (
            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          )
        )}
        {name === "chat" && (
          filled ? (
            <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          )
        )}
        {name === "menu" && (
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />    
        )}
        {name === "close" && (
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        )}
        {name === "search" && (
          filled ? (
            <>
              <path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.415l2.261-2.261A4 4 0 1011 5z" clipRule="evenodd" />
            </>
          ) : (
            <g transform="scale(-1,1) translate(-24, 0)">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round"/>
            </g>
          ) 
        )}
        {name === "home" && (
          filled ? (
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          )
        )}
        {name === "user" && (
          filled ? (
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          )
        )}
        {name === "users" && (
          filled ? (
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />  
          )
        )}
        {name === "tag" && (
          filled ? (
            <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          )
        )}
        {name === "login" && (
          <g transform="scale(-1,1) translate(-23, 0)">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </g>
        )}
        {name === "exit" && (
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        )}
        {name === "counter" && (
          <circle cx="50" cy="50" r="50" />
        )}
        {name === "arrow-down" && (
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        )}
        {name === "wave" && (
          <>
            <motion.path
              variants={pathVariant}
              animate={hovered ? "hovered" : "notHovered"}
              d="M16.5137234,24.1536064c5.3276005,0,10.6513004-1.8349991,16.0449009-5.5030003
              c9.075695-6.1742992,20.5312004-6.1722994,29.8934975,0.0079002c0.4623985,0.3031998,1.0820999,0.1742992,1.3842964-0.291399
              c0.3027039-0.465601,0.1734085-1.0907001-0.2885933-1.3959007c-10.0488052-6.6311007-22.3515053-6.6281004-32.1084023,0.0079002
              c-10.035099,6.8260002-19.8099995,6.8269997-29.8813-0.0010014c-0.4585-0.3111-1.0796-0.1869984-1.3881999,0.2747002
              c-0.3081,0.4616013-0.186,1.0876999,0.272,1.3987999C5.854023,22.3196068,11.185523,24.1536064,16.5137234,24.1536064z"
            />
            <motion.path
              variants={pathVariant}
              animate={hovered ? "hovered" : "notHovered"}
              d="M63.5478249,30.8939056c-10.0498047-6.6310997-22.3525047-6.6280994-32.1084023,0.0079002
              c-10.0361004,6.8279991-19.8110008,6.8269997-29.8813-0.0009995c-0.4585-0.3111-1.0796-0.1879997-1.3877,0.2747002
              c-0.3086,0.4617004-0.1865,1.0877991,0.2715,1.3987999c5.4116001,3.6679993,10.7426996,5.5029984,16.0708008,5.5029984
              c5.3275986-0.0009995,10.6513996-1.8349991,16.0459003-5.5038986c9.0746956-6.1753006,20.5302963-6.1714001,29.8934975,0.0078011
              c0.4623985,0.3031998,1.0825996,0.1742973,1.3848-0.2914009C64.139122,31.8242073,64.0098267,31.1991062,63.5478249,30.8939056z"
            />
            <motion.path
              variants={pathVariant}
              animate={hovered ? "hovered" : "notHovered"}
              d="M63.5478249,44.8166046c-10.0498047-6.629097-22.3520012-6.6260986-32.1084023,0.0079002
              c-10.0340996,6.8280029-19.8080997,6.8300018-29.8813-0.0009995c-0.4585-0.3110008-1.0796-0.1870003-1.3877,0.2747002
              c-0.3086,0.4617004-0.1865,1.0877991,0.2715,1.3988991c5.4120998,3.6689034,10.7440996,5.5039024,16.0718002,5.502903
              c5.3276005,0,10.6513004-1.8350029,16.0444012-5.5039024c9.0761948-6.1733971,20.5307961-6.1713982,29.8939972,0.0078011
              c0.4623985,0.3031998,1.0825996,0.1743011,1.3848-0.2912979C64.139122,45.7469063,64.0098267,45.1218071,63.5478249,44.8166046z"
            />
          </>
        )}
        {name === "beaker" && (
          filled ? (
            <path fillRule="evenodd" d="M10.5 3.798v5.02a3 3 0 01-.879 2.121l-2.377 2.377a9.845 9.845 0 015.091 1.013 8.315 8.315 0 005.713.636l.285-.071-3.954-3.955a3 3 0 01-.879-2.121v-5.02a23.614 23.614 0 00-3 0zm4.5.138a.75.75 0 00.093-1.495A24.837 24.837 0 0012 2.25a25.048 25.048 0 00-3.093.191A.75.75 0 009 3.936v4.882a1.5 1.5 0 01-.44 1.06l-6.293 6.294c-1.62 1.621-.903 4.475 1.471 4.88 2.686.46 5.447.698 8.262.698 2.816 0 5.576-.239 8.262-.697 2.373-.406 3.092-3.26 1.47-4.881L15.44 9.879A1.5 1.5 0 0115 8.818V3.936z" clipRule="evenodd" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />          
          )
        )}
      </svg>
      {name === "counter" && (
        <Count textColor={textColor}>
          {count}
        </Count>
      )}
    </>
  )
}