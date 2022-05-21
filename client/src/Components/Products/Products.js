/* eslint-disable no-unused-vars */ // Temp
import React, { useEffect, useState } from 'react'

import nutritivApi from '../../Api/nutritivApi';
import { ProductCard } from './ProductCard';
import { Pagination } from '@mui/material';
import { AnimatePresence, LayoutGroup, motion, Reorder } from 'framer-motion';

export const Products = () => {  
  console.log("###########-Products-###########")
  
  const [allProducts, setAllProducts] = useState([])
  const [allFilteredProducts, setAllFilteredProducts] = useState([])
  const [productsToDisplay, setProductsToDisplay] = useState(null)
  
  const [page, setPage] = useState(1)
  const [numberOfPages, setNumberOfPages] = useState(10)
  const [productsPerPage, setProductsPerPage] = useState(5)
  
  const [loading, setLoading] = useState(false)
  const [errorApiGetProducts, setErrorApiGetProducts] = useState(false)
  
  const [filterByTextInput, setFilterByTextInput] = useState("")
  const [filterByShapeInput, setFilterByShapeInput] = useState("")
  const [filterByTagsInput, setFilterByTagsInput] = useState([])
  // const [filterByPriceMinInput, setFilterByPriceMinInput] = useState(0)
  // const [filterByPriceMaxInput, setFilterByPriceMaxInput] = useState(0)
  const [sortedByPrice, setSortedByPrice] = useState("")
  const [sortedByPriceStatus, setSortedByPriceStatus] = useState("")
  
  const [allTags, setAllTags] = useState([])
  
  // API EFFECTS
  useEffect(() => {
    async function fetchApi() {
      try {
        setLoading(true)
        const { data } = await nutritivApi.get(
          `/products/`,
        );
        setAllProducts(data.products)
        setAllFilteredProducts(data.products)
        setLoading(false)
      } catch (err) {
        setErrorApiGetProducts(true)
        console.log('# apiGetProducts() err :', err)
      }
    }
    fetchApi();
  }, []);
  useEffect(() => {
    async function fetchApi() {
      try {
        setLoading(true)
        const { data } = await nutritivApi.get(
          `/products/tags`
        );
        console.log('# data :', data)
        setAllTags(data.uniqueTags)
      } catch (err) {
        console.log('# /products/tags err :', err)
      }
    }
    fetchApi();
  }, []);

  
  // TOTAL PAGES EFFECT
  useEffect(() => {
    setNumberOfPages(Math.ceil(allFilteredProducts.length / productsPerPage))
  }, [
    productsPerPage,
    allProducts.length,
    allFilteredProducts
  ]);
  
  // DISPLAY EFFECT
  useEffect(() => {
    
    const filterByText = (array) => filterByTextInput ? (
      array.filter((product) => {
        let titleFilter = product.title.toLowerCase().includes(filterByTextInput)
        let descFilter = product.desc.toLowerCase().includes(filterByTextInput)

        return titleFilter || descFilter;
      })
    ) : array;

    const filterByShape = (array) => filterByShapeInput ? (
      array.filter((product) => {
        return (
          product.shape.toLowerCase() === filterByShapeInput
        )
      })
    ) : array;
    
    const filterByTags = (array) => filterByTagsInput ? (
      array.filter((product) => {
        return filterByTagsInput.every(tag => product.tags.includes(tag))
      })
    ) : array;

    const filterByPrice = (array) => {
      if(sortedByPrice === "asc") {
        setSortedByPriceStatus("asc")
        const filteredArray = array.sort((a, b) => {
          if(a.productItems[0].price.value < b.productItems[0].price.value) return -1;
          if(a.productItems[0].price.value > b.productItems[0].price.value) return 1;
          return 0;
        })
        return filteredArray;
      }
      if(sortedByPrice === "desc") {
        setSortedByPriceStatus("asc")
        const filteredArray = array.sort((a, b) => {
          if(a.productItems[0].price.value > b.productItems[0].price.value) return -1;
          if(a.productItems[0].price.value < b.productItems[0].price.value) return 1;
          return 0;
        })
        return filteredArray;
      } 
      return !sortedByPrice && array;
    }

    let result = allProducts;
    result = filterByText(result)    
    result = filterByShape(result)
    result = filterByTags(result)
    result = filterByPrice(result)
    
    setAllFilteredProducts(result)
    setProductsToDisplay(
      result.slice(
        productsPerPage * page - productsPerPage,
        productsPerPage * page
      )
    )
  }, [
    allProducts, 
    page, 
    productsPerPage, 
    filterByTextInput, 
    filterByShapeInput,
    filterByTagsInput,
    sortedByPrice
  ]);

  // HANDLERS
  const handleProductsFilter = (e) => {
    setFilterByTextInput(
      e.target.value.toLowerCase()
    )
    setPage(1);
  }
  const handleFilterByShapeInput = (e) => {
    setFilterByShapeInput(
      e.target.value.toLowerCase()
    )
    setPage(1);
  }
  const handleChangeActivePage = (e, val) => {
    setPage(val)
  }
  const handleChangeProductsPerPage = (e) => {
    setProductsPerPage(e.target.value)
  }
  const handleFilterByTags = (e) => {
    e.target.checked ? (
      setFilterByTagsInput(() => [
        ...filterByTagsInput,
        e.target.name,
      ])
    ) : (
      setFilterByTagsInput(prevState => (
        prevState.filter(tag => tag !== e.target.name)
      )
    ))
    setPage(1);
  }
  const handleOrderByPrice = () => {
    sortedByPrice ? (
      sortedByPrice === "asc" ? setSortedByPrice("desc") : setSortedByPrice("")
    ) : setSortedByPrice("asc")
    setPage(1);
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        default: { duration: 0.5 },
      }}
      id="products"
    >
      {
        loading ? (
          <h2>
            Loading products...
          </h2>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <LayoutGroup>
              <br />
              {/* TITLE FILTER - TEXTBOX */}
              <input 
                onChange={handleProductsFilter}
                placeholder="Search a product..."
                type="text" 
              />
              {/* SHAPE FILTER - DROPDOWN */}
              <form>
                <select 
                  onChange={handleFilterByShapeInput}
                  name="shapeFilter"
                >
                  <option value="">Shape</option>
                  <option value="capsules">Capsule</option>
                  <option value="powder">Powder</option>
                </select>
              </form>
              {/* PRICE SORTER - BUTTON */}
              <button
                onClick={handleOrderByPrice}
              >
                Sorted by price
                {
                  sortedByPrice && (sortedByPrice === "asc" ? (
                    <span> ▲ </span>
                  ) : (
                    <span> ▼ </span>
                  ))
                }
              </button>
              {/* TAGS FILTER - CHECKBOXES */}
              {
                allTags && allTags.map((tag, i) => (
                  <div key={i}>
                    <input 
                      defaultChecked={false}
                      name={tag}
                      onClick={handleFilterByTags}
                      type="checkbox"
                    />
                    <label htmlFor={tag}>
                      {tag}
                    </label>
                  </div>
                ))
              }
              {/* PRODUCTS - CARDS */}
              {/* <motion.div layout> */}
              <AnimatePresence>
                {
                  productsToDisplay?.length > 0 ? (
                    productsToDisplay.map((product, i) => (
                      <ProductCard
                        index={i}
                        key={product._id}
                        product={product}
                      />
                    ))
                  ) : (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      No product(s) found.
                    </motion.p>
                  )
                }
              </AnimatePresence>
              <motion.div layout>
                {/* </motion.div>  */}
                <Pagination
                  count={numberOfPages}
                  page={page}
                  onChange={handleChangeActivePage}
                />
                {/* PRODUCTS PER PAGE - DROPDOWN */}
                <form>
                  <label htmlFor="productsPerPage">
                    Products per page: 
                  </label>
                  <select 
                    onChange={handleChangeProductsPerPage}
                    id="selectProductsPerPage"
                    name="productsPerPage" 
                  >
                    <option value="5">5</option>
                    <option value="15">15</option>
                    <option value="30">30</option>
                  </select>
                </form>
              </motion.div>
            </LayoutGroup>
          </motion.div>
        )
      }
    </motion.div>
  )
}
