import { Pagination } from '@mui/material'
import React from 'react'

export const ProductsPagination = ({ setPage, numberOfPages }) => {
  
  return (
    <Pagination
      count={numberOfPages}
      onChange={(e, val) => setPage(val)}
    />
  )
}
