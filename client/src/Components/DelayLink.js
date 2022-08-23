import styled from "@emotion/styled";
import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export const DelayLink = (props) => {
  const { label, delay, replace, to, active } = props;
  let timeout = null;
  let navigate = useNavigate();
  let location = useLocation();
  
  const NavLink = styled(Link)`
    pointer-events: ${props => 
      props.active ? "none" : "initial"
    };
    z-index: 2;
  `
  
  useEffect(() => {
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [timeout]);
  
  const handleClick = e => {
    if (
      location?.pathname === to
    ) return;
    if (e.defaultPrevented) return;
    e.preventDefault();
    
    timeout = setTimeout(() => {
      navigate(to, { replace })
    }, delay);
  };

  return (
    <NavLink to={to} active={active} onClick={handleClick}>
      {label}
    </NavLink>
  )
}