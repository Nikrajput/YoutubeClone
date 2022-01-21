import React, { useState, useEffect } from "react";
import SEO from './seo';
import Navbar from './navbar';
import ChannelContent from "./channelContent";

export default function Channel(props) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <SEO title="Channel" />
      <Navbar />
      <ChannelContent channelId={props.match.params.userId} />
    </>
  );
}
