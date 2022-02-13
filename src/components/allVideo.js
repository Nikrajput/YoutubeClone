import React, { useEffect, useState } from "react";
import {
  AppBar,
  makeStyles,
  useTheme,
  Button,
  useMediaQuery,
  Typography,
} from "@material-ui/core";
import { Link } from "react-router-dom";
import {Row, Col} from "reactstrap";
import Sidebar from "./sidebar";
import ReactPlayer from "react-player/lazy";
import { db  } from "../firebase/firebase";
import { ref, onValue, query, orderByChild } from "firebase/database";
import date from 'date-and-time';


const useStyles = makeStyles((theme) => ({
  header: {
    boxShadow: "none",
    background: "white",
    backdropFilter: "blur(8px)",
  },
  searchBox:{
    width:"60%", 
    height:"40px",
    fontFamily:"sans-serif",
    boxShadow: "inset 0 0 5px rgb(136 136 136 / 35%)",
    paddingLeft:"15px",
    outline:"none"
  },
  button:{
    fontWeight:"bold",
    width:"60%", 
    height:"38px",
    fontFamily:"sans-serif",
    boxShadow: "inset 0 0 5px rgb(136 136 136 / 35%)",
    paddingLeft:"15px",
    border:"solid black",
    background:"black",
    color:"white",
    "&:hover": {
      color: "black",
      background: "white",
    }
  },
  videoContainer: {
    position: "absolute",
    height: "100%",
    width:"99%",
    background:"#F0F6F6",
    margin:"0px"
  },
  title:{
    whiteSpace:"nowrap",
    overflow:"hidden",
    textOverflow:"ellipsis",
    fontFamily:"sans-serif",
    fontWeight:"bold",
    fontSize:"15px",
    textTransform:"capitalize"
  },
  channelName:{
    whiteSpace:"nowrap",
    overflow:"hidden",
    textOverflow:"ellipsis",
    fontFamily:"sans-serif",
    fontSize:"14px"
  },
  views:{
    whiteSpace:"nowrap",
    overflow:"hidden",
    textOverflow:"ellipsis",
    fontFamily:"sans-serif",
    fontSize:"14px",
  }
}));

function Videos() {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [videos, setVideos] = useState({});
  const [allUsers, setAllUsers] = useState({});
  const [height, setHeight] = useState(window.outerWidth);
  const [loading, setLoading] = useState({});


  useEffect(()=>{
    const videoseRef=query(ref(db,`videos`),orderByChild('uploadedAt'));
    onValue(videoseRef,(snapshot)=>{
      if(snapshot.val()){
        setVideos(snapshot.val());
        const val=Object.keys(snapshot.val()).length;
        setHeight((val/4)*400);
        setLoading((prevState) => ({
          ...prevState,
          ["videos"]: true,
        }));
      }
    })
    const userseRef=ref(db,`users`);
    onValue(userseRef,(snapshot)=>{
        if(snapshot.val()){
            setAllUsers(snapshot.val());
            setLoading((prevState) => ({
              ...prevState,
              ["users"]: true,

            }));
        }
    })
  },[])

  const handleTime = (videoId) =>{
    const videoDate=date.parse(videos[videoId].uploadedAt,'HH:mm:ss[ ]DD-MM-YYYY');
    const currentTime = date.parse(date.format(new Date(), 'HH:mm:ss[ ]DD-MM-YYYY'),'HH:mm:ss[ ]DD-MM-YYYY');
    if(Math.floor(date.subtract(currentTime,videoDate).toDays())){
        const numberOfDays=Math.floor(date.subtract(currentTime,videoDate).toDays());
        if(numberOfDays >=365)return `${numberOfDays/365} year`;
        else if(numberOfDays>=30)return `${numberOfDays/30} month`;
        else return `${numberOfDays} day`;
    }
    else if(Math.floor(date.subtract(currentTime,videoDate).toHours())){
        const numberOfHours=Math.floor(date.subtract(currentTime,videoDate).toHours());
        return `${numberOfHours} hour`;
    }
    else if(Math.floor(date.subtract(currentTime,videoDate).toMinutes())){
      const numberOfMinutes=Math.floor(date.subtract(currentTime,videoDate).toMinutes());
      return `${numberOfMinutes} minute`;
  }
    else{
      const numberOfSeconds=Math.floor(date.subtract(currentTime,videoDate).toSeconds());
      return `${numberOfSeconds} second`
    }
  }
  

  return (
    <Row style={{padding:"10px"}}>
        <Col sm={1} style={{padding:"0px"}}>
            <Sidebar />
        </Col>
        <Col sm={11} style={{padding:"0px"}}>
            <Row >
              <Col sm={12} >
                <hr style={{marginTop:"0px"}} />
              </Col>
              <Col sm={12} style={{height:`${height}px`}}>
                <Row className={classes.videoContainer}>
                  {Object.keys(videos).reverse().map((key,idx) => {
                    return (
                      <Col sm={3} style={{padding:"10px"}}>
                        <Row>
                          <Col sm={12}>
                            <Link to={`/watch/${key}`}>
                              <ReactPlayer style={{background:"black",padding:"10px"}}  width={300} height={150} url={ videos[key].videoLink} />
                            </Link>
                          </Col>
                          <Col sm={12} style={{paddingTop:"10px"}}>
                            <Row>
                              <Col sm={2}>
                                <Link to={`/channel/${videos[key].userId}`}>
                                  <img style={{borderRadius:"50%",height:"40px",width:"40px",objectFit:"cover", imageRendering:"crisp-edges"}} src={loading.users ? allUsers[videos[key].userId].avatar : ""} alt="youTube" />
                                </Link>
                              </Col>
                              <Col sm={10} >
                                <Row >
                                  <Col sm={12} style={{display:"flex",alignItems:"flex-start"}}>
                                    <Typography className={classes.title}>{videos[key].title}</Typography>
                                  </Col>
                                  <Col sm={12} style={{display:"flex",alignItems:"flex-start",paddingTop:"5px"}}>
                                    <Typography className={classes.channelName}>{(loading.users ) ? allUsers[videos[key].userId].userName : ""}</Typography>
                                  </Col>
                                  <Col sm={12} style={{display:"flex",alignItems:"flex-start"}}>
                                    <Typography className={classes.views}>{videos[key].viewCount} views - {handleTime(key)} ago</Typography>
                                  </Col>
                                </Row>
                              </Col>
                            </Row>
                          </Col>
                        </Row>
                      </Col>
                    )})
                  }
                </Row>
              </Col>
            </Row>
        </Col>
    </Row>
  );
}
export default Videos;
