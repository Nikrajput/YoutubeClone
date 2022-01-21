import React, { useState, useEffect } from "react";
import SEO from './seo';
import Navbar from './navbar';
import Videos from "./allVideo";

export default function Landing(props) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <SEO title="Home" />
      <Navbar />
      <Videos />
    </>
  );
}
