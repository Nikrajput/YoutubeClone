import React, { useEffect, useState } from "react";
import {
  AppBar,
  makeStyles,
  useTheme,
  Button,
  useMediaQuery,
  Typography,
} from "@material-ui/core";
import { Link, useHistory } from "react-router-dom";
import {Row, Col} from "reactstrap";
import Sidebar from "./sidebar";
import Navbar from "./navbar";
import SEO from "../components/seo";
import ReactPlayer from "react-player/lazy";
import { db, auth  } from "../firebase/firebase";
import { ref, onValue, query, orderByChild, orderByValue, equalTo } from "firebase/database";
import { db as dbRef } from "../firebase";
import date from 'date-and-time';
import withAuthorization from "../authentication/withAuthorization";


const useStyles = makeStyles((theme) => ({

  image:{
    height:"40vh",
    width:"90vw",  
    objectFit:"cover"
  }, 
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
  subscribeButton:{
    fontWeight:"bold",
    width:"25%", 
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
    },
    "&:disabled":{
        background: "inherit",
        color:"black"
    }
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
  channelNameBigger:{
    whiteSpace:"nowrap",
    overflow:"hidden",
    textOverflow:"ellipsis",
    fontFamily:"sans-serif",
    fontSize:"25px",
    fontWeight:"bold"
  },
  viewsBigger:{
    whiteSpace:"nowrap",
    overflow:"hidden",
    textOverflow:"ellipsis",
    fontFamily:"sans-serif",
    fontSize:"18px",
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

function Subscriptions(props) {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const userId = props.match.params.userId;
  const [allUsers, setAllUsers] = useState({});
  const [height, setHeight] = useState(window.screen.height);
  const [loading, setLoading] = useState({});

  useEffect(()=>{
    const userseRef=ref(db,`users`);
    onValue(userseRef,(snapshot)=>{
        if(snapshot.val()){
            const val=Object.keys(snapshot.val()[userId].subscriptions ? snapshot.val()[userId].subscriptions : {}).length;
            setHeight(val*200);
            setAllUsers(snapshot.val());
            setLoading((prevState) => ({
              ...prevState,
              ["users"]: true,
            }));
        }
    })
  },[])


  const handleSubscribe = (channelId) =>{
    const allSubscribers=Object.keys( allUsers[channelId].subscribers );
    let data = allSubscribers.filter((id) => allUsers[channelId]['subscribers'][id].subscriberId==userId);
    const refSubscriber=ref(db,`users/${channelId}/subscribers/${data[0]}`);
    dbRef.doRemoveSubscriber(refSubscriber);
    
    const allSubscriptions=Object.keys( allUsers[userId].subscriptions );
    data = allSubscriptions.filter((id) => allUsers[userId]['subscriptions'][id].channelId==channelId);
    const refSubscription=ref(db,`users/${userId}/subscriptions/${data[0]}`);
    dbRef.doRemoveSubscription(refSubscription);
  }
  

  return (
    <>
        <SEO title="My Subscriptions" />
        <Row style={{padding:"10px"}}>
            <Col sm={12}>
                <Navbar />
            </Col>
            <Col sm={1} style={{padding:"0px"}}>
                <Sidebar />
            </Col>
            <Col sm={11} style={{padding:"0px"}}>
                <Row >
                <Col sm={12} >
                    <hr style={{marginTop:"0px"}} />
                </Col>
                
                <Col sm={12} >
                    <Row style={{minHeight:"90vh",height:`${height}px`}} className={classes.videoContainer}>
                        {Object.values((loading.users && allUsers[userId].subscriptions) ? allUsers[userId].subscriptions : {}).map((currentId) =>{
                            return (
                                <Col sm={12} style={{padding:"50px",paddingLeft:"20vw"}}>
                                    <Row>
                                        <Col sm={2} style={{padding:"0px"}}>
                                            <Link to={`/channel/${currentId.channelId}`}>
                                                <img style={{borderRadius:"50%",height:"100px",width:"100px",objectFit:"cover", imageRendering:"crisp-edges"}} 
                                                src={allUsers[currentId.channelId].avatar} alt="youTube" />
                                            </Link>
                                            
                                        </Col>
                                        <Col sm={3} style={{padding:"0px"}}>
                                            <Row>
                                                <Col sm={12} style={{display:"flex",justifyContent:"flex-start"}}>
                                                    <Typography className={classes.channelNameBigger}>
                                                        {allUsers[currentId.channelId].userName}
                                                    </Typography>
                                                </Col>
                                                <Col sm={12} style={{display:"flex",justifyContent:"flex-start"}}>
                                                    <Typography className={classes.viewsBigger}>
                                                        13k subscribers
                                                    </Typography>
                                                </Col>
                                            </Row>
                                        </Col>
                                        <Col sm={7} style={{display:"flex",justifyContent:"center"}}>
                                            <Button onClick={()=>handleSubscribe(currentId.channelId)}   className={classes.subscribeButton}>
                                                Subscribed
                                            </Button>
                                        </Col>
                                    </Row>
                                </Col>
                            )
                        })}
                        
                    </Row>
                </Col>
                </Row>
            </Col>
        </Row>
    </>  
    
  );
}

const authCondition = (authUser,props) => {
    if(authUser){
        if(authUser.uid ==  props.match.params.userId){
            return true;
        }
    }
    return false;
};

export default withAuthorization(authCondition)(Subscriptions);
