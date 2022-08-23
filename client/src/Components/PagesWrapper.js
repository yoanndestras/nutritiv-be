/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Outlet, useLocation } from 'react-router-dom'
import { Footer } from '../Footer/Footer'
import { tokens } from '../Helpers/styleTokens'
import { closeMobileNavMenu } from '../Redux/reducers/modals'
import Navbar from './Header/Navbar'

const Pages = styled(({ homepage, minimized, ...props }) => <motion.div {...props} />)`
  background-size: 100% 100%;
  background-origin: border-box;
  box-shadow: ${props => 
    props.homepage ? (
      `0px 0px 33px -12px ${tokens.color.secondary}`
    ) : (
      `0px 0px 33px -18px ${tokens.color.primary}`
    )
  };
  color: ${tokens.color.contrastLight};
  min-height: 100vh;
  overflow: hidden;
  position: relative;
  transform-style: preserve-3d;
  scale: 1;
  width: 100%;
  &:before {
    display: ${props => (
      props.minimized ? "initial" : "none"
    )};
    bottom: 0;
    left: 0;
    right: 0;
    top: 0;
    content: "";
    height: 100%;
    position: absolute;
    width: 100%;
    z-index: 10;
  }
`

export const PagesWrapper = ({ minimized }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [duration, setDuration] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if(minimized) {
        setDuration(0.22);
      } else {
        setDuration(0);
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [minimized]);

  const handleMobileNavMenu = () => {
    minimized && dispatch(
      closeMobileNavMenu()
    )
  }
  
  const pagesVariants = {
    initial: {
      borderRadius: tokens.borderRadius.xxl,
      height: `100vh`,
      opacity: 0,
      scale: 0.78,
      translateX: "50vw",
      rotateY: "-20deg",
      transformStyle: "preserve-3d",
      left: "-105vw",
    },
    exit: {
      borderRadius: tokens.borderRadius.xxxl,
      opacity: 0,
      translateX: "-55vw",
      rotateY: "20deg",
      scale: 0.72,
      transformStyle: "preserve-3d",
      transition: {
        duration: 0.22
      }
    },
    normalSizeHomepage: {
      backgroundImage: "linear-gradient(rgba(20, 122, 165, 0) 0px, rgba(20, 122, 165, 0) 600px, rgba(2, 0, 71, 0) 1250px)",
      borderRadius: 0,
      height: `100%`,
      opacity: 1,
      translateX: 0,
      scale: 1,
      rotateY: "0deg",
      left: "0vw",
      transition: {
        backgroundImage: {
          duration: 0.4,
        },
        height: {
          delay: 0.41,
        },
      },
    },
    normalSizeOtherPage: {
      backgroundImage: "linear-gradient(rgba(20, 122, 165, 0) 0px, rgba(20, 122, 165, 0) 0px, rgba(2, 0, 71, 0) 0px)",
      borderRadius: 0,
      height: `100%`,
      opacity: 1,
      translateX: 0,
      scale: 1,
      rotateY: "0deg",
      left: "0vw",
      transition: {
        backgroundImage: {
          duration: 0.4,
        },
        height: {
          delay: 0.41,
        },
      },
    },
    minimizedHomepage: {
      backgroundImage: "linear-gradient(rgba(20, 122, 165, 1) 0px, rgba(20, 122, 165, 1) 600px, rgba(2, 0, 71, 1) 1250px)",
      borderRadius: tokens.borderRadius.xxl,
      height: `100vh`,
      opacity: 1,
      translateX: '-42vw',
      scale: 0.75,
      rotateY: "0deg",
      left: "0vw",
      transition: {
        backgroundImage: {
          duration: duration,
        },
        height: {
          duration: 0
        }
      }
    },
    minimizedOtherPage: {
      backgroundImage: "linear-gradient(rgba(2, 0, 71, 1) 0px, rgba(2, 0, 71, 1) 600px, rgba(2, 0, 71, 1) 1250px)",
      borderRadius: tokens.borderRadius.xxl,
      height: `100vh`,
      opacity: 1,
      translateX: '-42vw',
      scale: 0.75,
      rotateY: "0deg",
      left: "0vw",
      transition: {
        backgroundImage: {
          duration: duration
        },
        height: {
          duration: 0
        }
      }
    }
  }
  
  return (
    <Pages
      animate={
        minimized ? (
          location.pathname === "/welcome" ? "minimizedHomepage" : "minimizedOtherPage"
        ) : (
          location.pathname === "/welcome" ? "normalSizeHomepage" : "normalSizeOtherPage"
        )
      }
      initial={
        minimized ? "initial" : false
      }
      homepage={location.pathname === "/welcome"}
      exit={minimized && "exit"}
      minimized={minimized}
      onClick={() => handleMobileNavMenu()}
      variants={pagesVariants}
    >
      <Navbar />
      <Outlet />
      <Footer />
    </Pages>
  )
}