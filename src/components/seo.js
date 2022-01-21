/**
 * SEO component for the frontend
 */

 import React from 'react'
 import Helmet from 'react-helmet'
  
 const SEO = ({ description, image, lang, meta, title }) => {
 
   const formatedTitle = title
 
   return (
     <Helmet
       htmlAttributes={{ lang }}
       title={formatedTitle}
       
     >
       <link rel="icon" href="/favicon.ico" />
     </Helmet>
   )
 }
 
 SEO.defaultProps = {
   lang: `en`,
   meta: [],
 }
 
 export default SEO