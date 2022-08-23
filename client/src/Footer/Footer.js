/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import React from 'react'
import { Link } from 'react-router-dom'
import { tokens } from '../Helpers/styleTokens'

export const Footer = () => {
  return (
    <footer 
      css={css`
        margin: 0 auto;
        text-align: center;
        user-select: none;
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