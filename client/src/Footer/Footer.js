/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import React from 'react'
import { Link } from 'react-router-dom'
import { tokens } from '../Helpers/styleTokens'

export const Footer = () => {
  return (
    <footer 
      css={css`
        bottom: 0;
        left: 0;
        max-width: ${tokens.maxWidth.xl};
        margin: 0 auto;
        position: absolute;
        right: 0;
        text-align: center;
        user-select: none;
        width: 100%;
      `}
    >
      This site is protected by reCAPTCHA and the Google&nbsp;
      <a href="https://policies.google.com/privacy">Privacy Policy</a> and&nbsp;
      <a href="https://policies.google.com/terms">Terms of Service</a> apply.&nbsp;
      <Link to="/releases">
        Release
      </Link>
      .
    </footer>
  )
}