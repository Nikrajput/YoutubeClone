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
import ReactPlayer from "react-player/lazy";
import { db, auth  } from "../firebase/firebase";
import { ref, onValue, query, orderByKey, equalTo } from "firebase/database";
import SEO from './seo';
import Navbar from './navbar';
import Comments from "./comment";
import { db as dbRef } from "../firebase";
import date from 'date-and-time';

const useStyles = makeStyles((theme) => ({
    line:{
        border:"0",
        clear:"both",
        display:"block",
        width:"100%",
        height:"1px",
        marginTop:"0px",
        borderBottom:"1px solid gainsboro",
        padding:"0px"
    },
    titleBigger:{
        whiteSpace:"nowrap",
        overflow:"hidden",
        textOverflow:"ellipsis",
        fontFamily:"sans-serif,Roboto,Arial",
        fontWeight:"500",
        fontSize:"22px",
        textTransform:"capitalize"
    },
    viewsBigger:{
        whiteSpace:"nowrap",
        overflow:"hidden",
        textOverflow:"ellipsis",
        fontFamily:"sans-serif",
        fontSize:"16px",
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
      }
  }));

let watchTime=0;
var interval=null;
let viewCountIncreased=false;
let duration;  
function WatchVideo(props) {

    const classes = useStyles();
    const theme = useTheme();
    const history = useHistory();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [allVideos, setAllVideos] = useState({});
    const [allUsers, setAllUsers] = useState({});
    const [width, setWidth] = useState();
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
    },[])

    useEffect(() => {
        setWidth((window.outerWidth * 3)/5);
        const videoseRef=ref(db,`videos`);
        onValue(videoseRef,(snapshot)=>{
            if(snapshot.val()){
                setAllVideos(snapshot.val());
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
  }, []);


  const handleTime = (videoId) =>{
    if(!loading.videos)return;
    const videoDate=date.parse(allVideos[videoId].uploadedAt,'HH:mm:ss[ ]DD-MM-YYYY');
    const currentTime = date.parse(date.format(new Date(), 'HH:mm:ss[ ]DD-MM-YYYY'),'HH:mm:ss[ ]DD-MM-YYYY');
    if(Math.floor(date.subtract(currentTime,videoDate).toDays())){
        const numberOfDays=Math.floor(date.subtract(currentTime,videoDate).toDays());
        if(numberOfDays >=365)return `${Math.floor(numberOfDays/365)} year`;
        else if(numberOfDays>=30)return `${Math.floor(numberOfDays/30)} month`;
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

  const VideoLikedByUser = (videoId) =>{
    const allLikes=Object.values((loading.videos && allVideos[videoId].likes) ? allVideos[videoId].likes : {});
    if(!allLikes.length)return false;
    const data = allLikes.filter((currentUser) => currentUser.userId==userId);
    return data.length ? true : false;
  }

  const VideoDisLikedByUser = (videoId) =>{
    const allDisLikes=Object.values((loading.videos && allVideos[videoId].dislikes) ? allVideos[videoId].dislikes : {});
    if(!allDisLikes.length)return false;
    const data = allDisLikes.filter((currentUser) => currentUser.userId==userId);
    return data.length ? true : false;
  }

  const handleLikeVideo = (videoId=props.match.params.videoId) =>{
    if(!isUser){
      history.push('/signIn');
      return;
    }
    if(VideoLikedByUser(videoId)){
      const allLikes=Object.keys( allVideos[videoId].likes );
      const data = allLikes.filter((id) => allVideos[videoId]['likes'][id].userId==userId);
      const refVideos=ref(db,`videos/${videoId}/likes/${data[0]}`);
      dbRef.removeLikeFromVideo(refVideos);
    }
    else{
      if(VideoDisLikedByUser(videoId)){
        const allDisLikes=Object.keys( allVideos[videoId].dislikes );
        const data = allDisLikes.filter((id) => allVideos[videoId]['dislikes'][id].userId==userId);
        const refVideos=ref(db,`videos/${videoId}/dislikes/${data[0]}`);
        dbRef.removeDisLikeFromVideo(refVideos);
      }
      dbRef.addLikeToVideo(videoId,userId);
    }
  }

  const handleDislikeVideo = (videoId=props.match.params.videoId) =>{
    if(!isUser){
      history.push('/signIn');
      return;
    }
    if(VideoDisLikedByUser(videoId)){
        const allDisLikes=Object.keys( allVideos[videoId].dislikes );
        const data = allDisLikes.filter((id) => allVideos[videoId]['dislikes'][id].userId==userId);
        const refVideos=ref(db,`videos/${videoId}/dislikes/${data[0]}`);
        dbRef.removeDisLikeFromVideo(refVideos);
    }
    else{
      if(VideoLikedByUser(videoId)){
        const allLikes=Object.keys( allVideos[videoId].likes );
        const data = allLikes.filter((id) => allVideos[videoId]['likes'][id].userId==userId);
        const refVideos=ref(db,`videos/${videoId}/likes/${data[0]}`);
        dbRef.removeLikeFromVideo(refVideos);
      }
      dbRef.addDisLikeToVideo(videoId,userId);
    }
  }

  const channelSubscribed = () =>{
    if(!isUser || !loading.users || !loading.videos)return false;
    const channelId=allVideos[props.match.params.videoId].userId;
    const allSubscribers=Object.values((allUsers[channelId].subscribers) ? allUsers[channelId].subscribers : {});
    if(!allSubscribers.length)return false;
    const data = allSubscribers.filter((currentUser) => currentUser.subscriberId==userId);
    return data.length ? true : false;
}

  const handleSubscribe = () =>{
    if(!isUser)history.push('/signIn');
    if(!channelSubscribed()){
        dbRef.doAddSubscriber(allVideos[props.match.params.videoId].userId,userId);
        dbRef.doAddSubscription(userId,allVideos[props.match.params.videoId].userId);
    }
    else{
        const channelId=allVideos[props.match.params.videoId].userId;
        const allSubscribers=Object.keys( allUsers[channelId].subscribers );
        let data = allSubscribers.filter((id) => allUsers[channelId]['subscribers'][id].subscriberId==userId);
        const refSubscriber=ref(db,`users/${channelId}/subscribers/${data[0]}`);
        dbRef.doRemoveSubscriber(refSubscriber);
        
        const allSubscriptions=Object.keys( allUsers[userId].subscriptions );
        data = allSubscriptions.filter((id) => allUsers[userId]['subscriptions'][id].channelId== channelId);
        const refSubscription=ref(db,`users/${userId}/subscriptions/${data[0]}`);
        dbRef.doRemoveSubscription(refSubscription);
    }
  }


  function timerCycle() {
    watchTime+=1;
    
  }
  
  function startTimer() {
    interval=setInterval(timerCycle, 1000);
  }
    
  function stopTimer() {
      if(interval)clearInterval(interval);
      interval=null;
  }

  const handleViewCount = ()=>{
    const viewCount=allVideos[props.match.params.videoId].viewCount;
    dbRef.doIncreaseViewCountOnVideo(props.match.params.videoId,viewCount+1);
  }

  const handleProgress = (e)=>{
    if(watchTime>=10){
      if(!viewCountIncreased){
        viewCountIncreased=true;
        handleViewCount();
      }
    }
    duration=Math.floor(e.loadedSeconds);
  }
 

  const handleEnd = ()=>{
    if(!viewCountIncreased && watchTime>=duration){
      handleViewCount();
    }
    watchTime=0;
    interval=null;
    viewCountIncreased=false;
  }


  return (
    <>
      <SEO title="Watch" />
      <Row>
          <Col sm={12}>
              <Navbar />
          </Col>
          <Col sm={12}>
              <Row style={{padding:"20px",background:"#F0F6F6",paddingLeft:"50px",minHeight:"100vh"}}>
                  <Col sm={8} >
                      <Row >
                          <Col sm={12}>
                            <ReactPlayer playing={true} onPlay={startTimer} onPause={stopTimer} onProgress={(e)=>handleProgress(e)} onEnded={handleEnd} style={{background:"black",padding:"10px",width:"100%"}} volume={1} width={width} height={520} controls="true" url={loading.videos ? allVideos[props.match.params.videoId].videoLink : ""}/>
                          </Col>
                          <Col sm={12}>
                              <Row style={{paddingTop:"20px"}}>
                                  <Col sm={12} style={{display:"flex",alignItems:"flex-start"}}>
                                    <Typography className={classes.titleBigger}>{loading.videos ? allVideos[props.match.params.videoId].title : ""}</Typography>
                                  </Col>
                                  <Col sm={12} style={{display:"flex",alignItems:"flex-start"}}>
                                      <Row style={{width:"100%",alignItems:"center"}}>
                                          <Col sm={3} style={{display:"flex",alignItems:"flex-start",justifyContent:"flex-start"}}>
                                            <Typography className={classes.viewsBigger}>
                                              {loading.videos ? allVideos[props.match.params.videoId].viewCount : ""} views - {handleTime(props.match.params.videoId)} ago 
                                            </Typography>
                                          </Col>
                                          <Col sm={9}>
                                                <Row style={{padding:"10px"}}>
                                                    <Col sm={2} style={{paddingRight:"0px"}}>
                                                        <Row >
                                                            <Col sm={3} style={{display:"flex",alignItems:"flex-end",justifyContent:"flex-start"}}>
                                                                <Link onClick={() => handleLikeVideo()}>
                                                                    <img style={{height:"20px",width:"20px",objectFit:"cover", imageRendering:"crisp-edges"}} 
                                                                    src={require(VideoLikedByUser(props.match.params.videoId) ? "../assets/like.png" : "../assets/likeEmpty.png")} 
                                                                    alt="youTube" />
                                                                </Link>
                                                            </Col>
                                                            <Col sm={9} style={{display:"flex",alignItems:"flex-end",justifyContent:"flex-start",paddingLeft:"8px"}}>
                                                                <Typography>
                                                                    {Object.keys( (loading.videos && allVideos[props.match.params.videoId].likes) ? allVideos[props.match.params.videoId].likes : {} ).length}
                                                                </Typography>
                                                            </Col>
                                                        </Row>
                                                    </Col>
                                                    <Col sm={10} style={{paddingLeft:"0px"}}>
                                                        <Row>
                                                            <Col sm={1} >
                                                                <Link onClick={() => handleDislikeVideo()}>
                                                                    <img style={{height:"20px",width:"20px",objectFit:"cover", imageRendering:"crisp-edges"}} 
                                                                    src={require(VideoDisLikedByUser(props.match.params.videoId) ? "../assets/dislike.png" : "../assets/dislikeEmpty.png")} 
                                                                    alt="youTube" />
                                                                </Link>
                                                            </Col>
                                                            <Col sm={11} style={{display:"flex",alignItems:"flex-end",justifyContent:"flex-start",paddingLeft:"0px"}}>
                                                            <Typography>
                                                                {Object.keys( (loading.videos && allVideos[props.match.params.videoId].dislikes) ? allVideos[props.match.params.videoId].dislikes : {} ).length}
                                                            </Typography>
                                                            </Col>
                                                        </Row>
                                                    </Col>
                                                            
                                                </Row>
                                          </Col>
                                      </Row>
                                    
                                  </Col>
                                  <Col sm={12} style={{display:"flex",alignItems:"flex-start",paddingTop:"20px"}}>
                                    <hr className={classes.line} />
                                  </Col>
                                  <Col sm={12}>
                                      <Row>
                                          <Col sm={1}>
                                            <Link to={`/channel/${loading.videos ? allVideos[props.match.params.videoId].userId : ""}`}>
                                              <img style={{borderRadius:"50%",height:"40px",width:"40px",objectFit:"cover", imageRendering:"crisp-edges"}} src={(loading.users && loading.videos) ? allUsers[allVideos[props.match.params.videoId].userId].avatar : ""} alt="youTube" />
                                            </Link>
                                          </Col >
                                          <Col sm={2}>
                                              <Row>
                                                  <Col sm={12} style={{display:"flex",alignItems:"flex-start"}}>
                                                    <Typography className={classes.title}>{(loading.users && loading.videos) ? allUsers[allVideos[props.match.params.videoId].userId].userName : ""}</Typography>
                                                  </Col>
                                                  <Col sm={12} style={{display:"flex",alignItems:"flex-start"}}>
                                                    <Typography className={classes.views}>
                                                        {(loading.users && loading.videos && allUsers[allVideos[props.match.params.videoId].userId].subscribers) ?
                                                         Object.keys(allUsers[allVideos[props.match.params.videoId].userId].subscribers).length 
                                                         : 0} subscribers
                                                    </Typography>
                                                  </Col>
                                              </Row>
                                          </Col>
                                          <Col sm={9} style={{display:"flex",alignItems:"center",justifyContent:"flex-end"}}>
                                                <Button onClick={handleSubscribe}  className={classes.subscribeButton}>
                                                    {channelSubscribed() ? "Subscribed" : "Subscribe"}
                                                </Button>
                                          </Col>
                                      </Row>
                                  </Col>
                                  <Col sm={12} style={{display:"flex",alignItems:"flex-start",paddingTop:"20px"}}>
                                    <hr className={classes.line} />
                                  </Col>
                                  <Col sm={12}>
                                      <Comments videoId={props.match.params.videoId}/>
                                  </Col>
                              </Row>
                          </Col>
                      </Row>
                  </Col>
                  <Col sm={4}>
                    {Object.keys(allVideos).reverse().map((key,idx) => {
                        return (
                            <Row style={{padding:"10px"}}>
                                <Col sm={12}>
                                    {(key !== props.match.params.videoId) && <Row>
                                        <Col sm={6} style={{display:"flex",justifyContent:"flex-end"}}>
                                            <Link to={`/watch/${key}`}>
                                                <ReactPlayer style={{background:"black",padding:"10px",width:"100%"}} width={170} height={100} url={loading.videos ? allVideos[key].videoLink : ""}/>
                                            </Link>
                                        </Col>
                                        <Col sm={6}>
                                            <Row >
                                                <Col sm={12} style={{display:"flex",alignItems:"flex-start"}}>
                                                    <Typography className={classes.title}>{loading.videos ? allVideos[key].title : ""}</Typography>
                                                </Col>
                                                <Col sm={12} style={{display:"flex",alignItems:"flex-start",paddingTop:"5px"}}>
                                                    <Typography className={classes.channelName}>{loading.users ? allUsers[allVideos[key].userId].userName : ""}</Typography>
                                                </Col>
                                                <Col sm={12} style={{display:"flex",alignItems:"flex-start"}}>
                                                    <Typography className={classes.views}>{loading.videos ? allVideos[key].viewCount : ""} views - {handleTime(key)} ago</Typography>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>}
                                </Col>
                            </Row>
                        )
                    })}
                      
                  </Col>
              </Row>
          </Col>
      </Row>
    </>
  );
}

export default WatchVideo;
