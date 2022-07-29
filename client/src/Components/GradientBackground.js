import { motion } from 'framer-motion';
import styled from '@emotion/styled'
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

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

export const Background = ({ ...props }) => {
  const { 
    firstColor, secondColor, initial, transition 
  } = props;

  const location = useLocation();
  const [homepage, setHomepage] = useState(false)
  
  const variants = {
    homepage: { 
      backgroundImage: `linear-gradient(180deg, ${firstColor} 0px, ${firstColor} 650px, ${secondColor} 1250px)`,
      transition: transition
    },
    default: {
      backgroundImage: `linear-gradient(180deg, ${firstColor} 0px, ${firstColor} 0px, ${secondColor} 0px)`,
      transition: transition
    }
  };
  
  useEffect(() => {
    setHomepage(location.pathname === "/welcome")
  }, [location.pathname]);
  
  return (
    <StyledBackground
      variants={variants}
      initial={initial}
      animate={homepage ? 'homepage' : 'default'}
    />
  )
}