import { motion } from 'framer-motion';
import styled from '@emotion/styled'
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { tokens } from '../Helpers/styleTokens';

const StyledBackground = styled(motion.div)`
  background-size: 100% 100%;
  bottom: 0;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
`;

export const GradientBackground = ({ ...props }) => {
  const { 
    firstColor, secondColor, minimizedHomepageColor, minimizedDefaultColor 
  } = props;
  
  const minimized = useSelector(state => state.modals.mobileNavMenu);
  const location = useLocation();
  const [homepage, setHomepage] = useState(false);
  const [duration, setDuration] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if(minimized) {
        setDuration(0.2)
      } else {
        setDuration(0)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [minimized]);
  
  const variants = {
    homepage: { 
      backgroundImage: `linear-gradient(180deg, ${firstColor} 0px, ${firstColor} 600px, ${secondColor} 1100px)`,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    default: {
      backgroundImage: `linear-gradient(180deg, ${firstColor} 0px, ${firstColor} 0px, ${secondColor} 0px)`,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    },
    minimizedHomepage: {
      backgroundImage: `linear-gradient(180deg, ${firstColor} 0px, ${firstColor} 0px, ${minimizedHomepageColor} 0px)`,
      transition: {
        duration: duration,
      }
    },
    minimizedDefault: {
      backgroundImage: `linear-gradient(180deg, ${firstColor} 0px, ${firstColor} 0px, ${minimizedDefaultColor} 0px)`,
      transition: {
        duration: duration,
      }
    }
  };
  
  useEffect(() => {
    setHomepage(location.pathname === "/welcome")
  }, [location.pathname]);

  return (
    <StyledBackground
      id="gradient-background"
      variants={variants}
      initial={false}
      animate={
        minimized ? (
          homepage ? 'minimizedHomepage' : 'minimizedDefault'
        ) : (
          homepage ? 'homepage' : 'default'
        )
      }
    />
  )
}