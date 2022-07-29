/** @jsxImportSource @emotion/react */
import React from "react"
import { tokens } from "../Helpers/styleTokens";
import styled from "@emotion/styled"
import { css, keyframes } from "@emotion/react"
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const waveAnimation = keyframes`
  from {
    background-position-x: 0%;
  }
  to {
    background-position-x: -300%;
  }
`

export const NutriButton = ({ ...props }) => {
  const navigate = useNavigate();
  // type:      'filled'  | none
  // rounded:   any       | none
  // disabled:  true      | [false]
  // size:      'small'   | none
  // accent:    'confirm' | 'info' | 'warning' | 'error' | none
  
  const handleClick = () => {
    navigate('/register');
  }
  
  const StyledLabel = styled.label`
    cursor: pointer;
    ${props => {
      return (
        props.wave && (
          css`
            filter: invert(1);
            color: #ea0e00;
            mix-blend-mode: difference;
          `
        )
      )
    }}
  `

  const StyledButton = styled(motion.button)`
    border-radius: ${tokens.borderRadius.default};
    border: none;
    cursor: pointer;
    font-weight: ${tokens.font.fontWeight.medium};
    outline: none;
    
    /* type */;
    ${props => {
      return (
        props.type === "filled" ? (
        css`
          background: ${tokens.color.accentStrong};
          color: ${tokens.color.contrastDark};
          border: none;
          /* &:hover {
            box-shadow: inset 0 0 0 100em rgb(0 0 0 / 10%);
          } */
        `
      ) : (
        css`
          background-color: ${tokens.color.transparent};
          color: ${tokens.color.contrastLight};
          border: 1px solid ${tokens.color.accentTransparent};
        `
      ))
    }};

    /* disabled */;
    ${props => {
      return (
        props.disabled &&
        css`
          :disabled {
            opacity: 0.4;
            pointer-events: none;
          }
        `
      )
    }}
    
    /* rounded */
    ${props => {
      return props.rounded ? (css`
        border-radius: ${props.rounded};
      `) : (css`
        border-radius: ${tokens.borderRadius.default};
      `)
    }}
    
    /* size */;
    ${props => {
      return (
        props.size === "small" ? (
        css`
          padding: calc(${tokens.spacing.md} / 2) ${tokens.spacing.lg};
          font-size: ${tokens.font.fontSize.xs};
        `
      ) : (
        css`
          padding: calc(${tokens.spacing.xl} / 2) ${tokens.spacing.xxl};
          font-size: ${tokens.font.fontSize.sm};
        `
      ))
    }}

    /* accent */;
    ${props => {
      return (
        props.accent === "confirm" &&
        css`
          background-color: ${tokens.color.secondary};
          color: ${tokens.color.buttonColorSecondary};
        `
      )
    }};
    
    /* Wave effect */
    ${props => {
      return (
        props.wave && (
          css`
            animation: ${waveAnimation};
            animation-iteration-count: infinite;
            animation-timing-function: linear;
            animation-play-state: running;
            background: url("https://nutritiv.s3.eu-west-3.amazonaws.com/assets/wave.svg") repeat-x;
            background-color: ${tokens.color.accentStrong};
            background-clip: border-box;
            background-size: 300% 100%;
            background-position-x: 0;
            background-position-y: 6px;
          `
        )
      )
    }}
  `
  
  return (
    <StyledButton
      initial={{
        animationDuration: "5s",
        filter: "brightness(1.15)",
        backgroundPositionY: "100px",
      }}
      animate={{
        backgroundPositionY: "6px",
      }}
      whileHover={{
        animationDuration: "2s",
        filter: "brightness(1)",
      }}
      whileTap={{
        opacity: 0.8,
        backgroundPositionY: "-100px",
      }}
      transition={{
        duration: 0.25
      }}
      onClick={() => handleClick()}
      {...props}
    >
      <StyledLabel {...props}>
        {props.label}
      </StyledLabel>
    </StyledButton>
  )
}