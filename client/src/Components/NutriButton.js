/** @jsxImportSource @emotion/react */
import React from "react"
import { mediaQuery, tokens } from "../Helpers/styleTokens";
import styled from "@emotion/styled"
import { css, keyframes } from "@emotion/react"
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const waveAnimation = keyframes`
  from {
    background-position-x: 0%;
  }
  to {
    background-position-x: -400%;
  }
`

export const NutriButton = React.memo(function NutriButton(props) {
  const navigate = useNavigate();
  // type:      'filled'  | none
  // rounded:   any       | none
  // disabled:  true      | [false]
  // size:      'small'   | none
  // accent:    'confirm' | 'info' | 'warning' | 'error' | none
  // wave:      '1'       | none
  // to:        any
  // ...props:  (style, onClick, onMouseEnter...)
  
  const handleClick = () => {
    props.to && navigate(props.to)
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
          border: none;
          color: ${tokens.color.contrastDark};
          transition: all .2s ease;
          &:hover {
            box-shadow: 0 0 6px ${tokens.color.accentStrong};
            transition: all .2s ease;
          }
        `
      ) : (
        css`
          transition: all .2s ease;
          background-color: ${tokens.color.transparent};
          border: 1px solid ${tokens.color.accentTransparent};
          box-shadow: 0 0 0px ${tokens.color.accentTransparent};
          color: ${tokens.color.contrastLight};
          &:hover {
            box-shadow: 0 0 6px ${tokens.color.accentTransparent};
            transition: all .2s ease;
          }
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
          padding: calc(${tokens.spacing.xxs} / 2) ${tokens.spacing.md};
          font-size: ${tokens.font.fontSize.xs};
        `
      ) : (
        css`
          padding: ${tokens.spacing.sm} ${tokens.spacing.xl};
          font-size: ${tokens.font.fontSize.sm};
          ${mediaQuery[1]} {
            padding: calc(${tokens.spacing.xl} / 2) ${tokens.spacing.xxl};
          }
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
            background-size: 400% 100%;
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
        animationDuration: "6.5s",
        filter: "brightness(1.12)",
        backgroundPositionY: "100px",
      }}
      animate={{
        backgroundPositionY: "6px",
      }}
      whileHover={{
        animationDuration: "3.25s",
      }}
      whileTap={{
        backgroundPositionY: "-100px",
        filter: "brightness(1)",
      }}
      transition={{
        backgroundPositionY: {
          duration: 0.125
        },
        duration: 0.2
      }}
      onClick={() => handleClick()}
      {...props}
    >
      <StyledLabel {...props}>
        {props.label}
      </StyledLabel>
    </StyledButton>
  )
})