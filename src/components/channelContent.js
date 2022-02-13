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
import ReactPlayer from "react-player/lazy";
import { db, auth  } from "../firebase/firebase";
import { ref, onValue, query, orderByChild, orderByValue, equalTo } from "firebase/database";
import { db as dbRef } from "../firebase";
import date from 'date-and-time';


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
    width:"15%", 
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

function ChannelContent(props) {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const channelId = props.channelId;
  const [videos, setVideos] = useState({});
  const [allUsers, setAllUsers] = useState({});
  const [height, setHeight] = useState((2*window.screen.height*35)/100);
  const [loading, setLoading] = useState({});
  const [isUser, setIsUser] = React.useState(false);
  const [userId,setUserId] = React.useState("");


  useEffect(()=>{
    auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
        setIsUser(true);
      }
      else{
        setIsUser(false);
      }
    });
  },[channelId])


  useEffect(()=>{
    const videoseRef=query(ref(db,`videos`),orderByChild('userId'),equalTo(channelId));
    onValue(videoseRef,(snapshot)=>{
      if(snapshot.val()){
        setVideos(snapshot.val());
        const val=Object.keys(snapshot.val()).length;
        setHeight(Math.ceil(val/4)*300 + (2*window.screen.height*35)/100);
        setLoading((prevState) => ({
          ...prevState,
          ["videos"]: true,
        }));
      }
      else{
        setVideos({});
        setHeight((2*window.screen.height*35)/100);
        setLoading((prevState) => ({
          ...prevState,
          ["videos"]: true,
        }));
      }
    })
    
  },[channelId]);

  useEffect(() => {
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
  },[channelId])

  const channelSubscribed = () =>{
    if(!loading.users)return false;
    const allSubscribers=Object.values((allUsers[channelId].subscribers) ? allUsers[channelId].subscribers : {});
    if(!allSubscribers.length)return false;
    const data = allSubscribers.filter((currentUser) => currentUser.subscriberId==userId);
    return data.length ? true : false;
  }

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

  const handleSubscribe = () =>{
    if(!isUser)history.push('/signIn');
    if(!channelSubscribed()){
        dbRef.doAddSubscriber(channelId,userId);
        dbRef.doAddSubscription(userId,channelId);
    }
    else{
        const allSubscribers=Object.keys( allUsers[channelId].subscribers );
        let data = allSubscribers.filter((id) => allUsers[channelId]['subscribers'][id].subscriberId==userId);
        const refSubscriber=ref(db,`users/${channelId}/subscribers/${data[0]}`);
        dbRef.doRemoveSubscriber(refSubscriber);
        
        const allSubscriptions=Object.keys( allUsers[userId].subscriptions );
        data = allSubscriptions.filter((id) => allUsers[userId]['subscriptions'][id].channelId==channelId);
        const refSubscription=ref(db,`users/${userId}/subscriptions/${data[0]}`);
        dbRef.doRemoveSubscription(refSubscription);
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
              
              <Col sm={12} >
                <Row style={{height:`${height}px`}} className={classes.videoContainer}>
                    <Col sm={12} style={{padding:"0px"}}>
                        <img className={classes.image} src={require("../assets/background.jpg")}></img>
                    </Col>
                    <Col sm={12} style={{padding:"50px",paddingLeft:"0px"}}>
                        <Row>
                            <Col sm={2} style={{padding:"0px"}}>
                                <img style={{borderRadius:"50%",height:"100px",width:"100px",objectFit:"cover", imageRendering:"crisp-edges"}} 
                                src={loading.users ? allUsers[channelId].avatar : ""} alt="youTube" />
                            </Col>
                            <Col sm={2} style={{padding:"0px"}}>
                                <Row>
                                    <Col sm={12} style={{display:"flex",justifyContent:"flex-start"}}>
                                        <Typography className={classes.channelNameBigger}>
                                            {loading.users ? allUsers[channelId].userName : ""}
                                        </Typography>
                                    </Col>
                                    <Col sm={12} style={{display:"flex",justifyContent:"flex-start"}}>
                                        <Typography className={classes.viewsBigger}>
                                            {Object.keys((loading.users && allUsers[channelId].subscribers) ? allUsers[channelId].subscribers : {}).length} subscribers
                                        </Typography>
                                    </Col>
                                </Row>
                            </Col>
                            <Col sm={8} style={{display:"flex",justifyContent:"flex-end"}}>
                                <Button onClick={handleSubscribe}   className={classes.subscribeButton}>
                                    {channelSubscribed() ? "Subscribed" : "Subscribe"}
                                </Button>
                            </Col>
                        </Row>
                    </Col>
                  {loading.videos && Object.keys(videos).reverse().map((key,idx) => {
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
                                <img style={{borderRadius:"50%",height:"40px",width:"40px",objectFit:"cover", imageRendering:"crisp-edges"}} src={loading.users ? allUsers[videos[key].userId].avatar : ""} alt="youTube" />
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
export default ChannelContent;
