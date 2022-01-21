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
import {Row, Col, Input} from "reactstrap";
import Sidebar from "./sidebar";
import ReactPlayer from "react-player/lazy";
import { db, auth  } from "../firebase/firebase";
import { db as dbRef } from "../firebase";
import { ref, onValue, query, orderByChild, orderByKey, equalTo } from "firebase/database";
import { uid } from "uid";


const useStyles = makeStyles((theme) => ({
   inputBox:{
    height:"32px",
    width:"100%",
    fontFamily:"sans-serif",
    background:"inherit",
    outline:"none",
    borderTopStyle:"hidden",
    borderLeftStyle:"hidden",
    borderRightStyle:"hidden",
    "&:focus":{
        background:"inherit",
        boxShadow:"none"
    }
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
  commentButton:{
    fontWeight:"bold",
    width:"90%", 
    height:"38px",
    fontFamily:"sans-serif",
    boxShadow: "inset 0 0 5px rgb(136 136 136 / 35%)",
    border:"solid black",
    background:"black",
    alignContent:"center",
    color:"white",
    "&:hover": {
      color: "black",
      background: "white",
    },
    "&:disabled": {
        background: "inherit",
      }
  },
  cancelButton:{
    fontWeight:"bold",
    width:"15%", 
    height:"38px",
    fontFamily:"sans-serif",
    boxShadow: "inset 0 0 5px rgb(136 136 136 / 35%)",
    border:"solid black",
    background:"white",
    alignContent:"center",
    color:"black",
    "&:hover": {
      color: "white",
      background: "black",
    }
  },
  videoContainer: {
    position: "absolute",
    height: "100%",
    width:"99%",
    background:"#F0F6F6",
    margin:"0px"
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
  comment:{
    whiteSpace:"nowrap",
    overflow:"hidden",
    textOverflow:"ellipsis",
    fontFamily:"sans-serif",
    fontSize:"14px",
    wordBreak:"normal"
  }
}));



function Comments(props) {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const history = useHistory();

  const [videos, setVideos] = useState({});
  const [allUsers, setAllUsers] = useState({});
  const [comment, setComment] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState({});
  const [isUser, setIsUser] = React.useState(false);
  const [user,setUser] = React.useState({});
  const [userId,setUserId] = React.useState("");
  const [addReply,setAddReply] = useState({});
  const [allComments,setAllComments] = useState({});
  const [allReplies,setAllReplies] = useState({});
  const [showCommentButton, setShowCommentButton] = useState(false);
  const [showReplyButton, setShowReplyButton] = useState(false);
  const [showReplies,setShowReplies] = useState({});
  
  useEffect(()=>{
    const repliesRef=ref(db,`replies`);
    onValue(repliesRef,(snapshot)=>{
        if(snapshot.val()){
            setAllReplies(snapshot.val());
            setLoading((prevState) => ({
              ...prevState,
              ["replies"]: true
            }));
        }
    })
  },[])

  useEffect(()=>{
    const commentsRef=ref(db,`comments`);
    onValue(commentsRef,(snapshot)=>{
        if(snapshot.val()){
            setAllComments(snapshot.val());
            setLoading((prevState) => ({
              ...prevState,
              ["comments"]: true
            }));
        }
    })
  },[])

  useEffect(()=>{
    auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
        const userRef=query(ref(db,`users`),orderByKey(),equalTo(user.uid));
        onValue(userRef,(snapshot)=>{
            if(snapshot.val()){
                const key=Object.keys(snapshot.val());
                setUser(snapshot.val()[key[0]]);
            }
        })
        setIsUser(true);
      }
      else{
        setIsUser(false);
      }
    });
  },[])
  useEffect(()=>{
    const videoseRef=query(ref(db,`videos`),orderByChild('uploadedAt'));
    onValue(videoseRef,(snapshot)=>{
      if(snapshot.val()){
        setVideos(snapshot.val());
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
              ["users"]: true
            }));
        }
    })
  },[])

  const handleAddReply = (commentId,value)=>{
    setAddReply((prevState) => ({
      ...prevState,
      [commentId]: value
    }));
  }

  const handleShowReply = (commentId,value)=>{
    setShowReplies((prevState) => ({
      ...prevState,
      [commentId]: value
    }));
  }

  const handleComment = ()=>{
    comment.trimEnd();
    comment.trimStart();
    dbRef.addComment(props.videoId,userId,comment,0,0);
    setComment("");
    setShowCommentButton(false);
    return;
  }

  const handleReply = (commentId)=>{
    reply.trimEnd();
    reply.trimStart();
    dbRef.addReply(commentId,userId,reply,0,0);
    setReply("");
    setShowReplyButton(false);
    setAddReply((prevState) => ({
      ...prevState,
      [commentId]: false
    }));
    return;
  }

  const CommentLikedByUser = (commentId) =>{
    const allLikes=Object.values(allComments[commentId].likes ? allComments[commentId].likes : {});
    if(!allLikes.length)return false;
    const data = allLikes.filter((currentUser) => currentUser.userId==userId);
    return data.length ? true : false;
  }

  const CommentDisLikedByUser = (commentId) =>{
    const allDisLikes=Object.values(allComments[commentId].dislikes ? allComments[commentId].dislikes : {});
    if(!allDisLikes.length)return false;
    const data = allDisLikes.filter((currentUser) => currentUser.userId==userId);
    return data.length ? true : false;
  }

  const handleLikeComment = (commentId) =>{
    if(!isUser){
      history.push('/signIn');
      return;
    }
    if(CommentLikedByUser(commentId)){
      const allLikes=Object.keys( allComments[commentId].likes );
      const data = allLikes.filter((id) => allComments[commentId]['likes'][id].userId==userId);
      const refComments=ref(db,`comments/${commentId}/likes/${data[0]}`);
      dbRef.removeLikeFromComment(refComments);
    }
    else{
      if(CommentDisLikedByUser(commentId)){
        const allDisLikes=Object.keys( allComments[commentId].dislikes );
        const data = allDisLikes.filter((id) => allComments[commentId]['dislikes'][id].userId==userId);
        const refComments=ref(db,`comments/${commentId}/dislikes/${data[0]}`);
        dbRef.removeDisLikeFromComment(refComments);
      }
      dbRef.addLikeToComment(commentId,userId);
    }
  }

  const handleDislikeComment = (commentId) =>{
    if(!isUser){
      history.push('/signIn');
      return;
    }
    if(CommentDisLikedByUser(commentId)){
        const allDisLikes=Object.keys( allComments[commentId].dislikes );
        const data = allDisLikes.filter((id) => allComments[commentId]['dislikes'][id].userId==userId);
        const refComments=ref(db,`comments/${commentId}/dislikes/${data[0]}`);
        dbRef.removeDisLikeFromComment(refComments);
    }
    else{
      if(CommentLikedByUser(commentId)){
        const allLikes=Object.keys( allComments[commentId].likes );
        const data = allLikes.filter((id) => allComments[commentId]['likes'][id].userId==userId);
        const refComments=ref(db,`comments/${commentId}/likes/${data[0]}`);
        dbRef.removeLikeFromComment(refComments);
      }
      dbRef.addDisLikeToComment(commentId,userId);
    }
  }

  const ReplyLikedByUser = (replyId) =>{
    const allLikes=Object.values(allReplies[replyId].likes ? allReplies[replyId].likes : {});
    if(!allLikes.length)return false;
    const data = allLikes.filter((currentUser) => currentUser.userId==userId);
    return data.length ? true : false;
  }

  const ReplyDisLikedByUser = (replyId) =>{
    const allDisLikes=Object.values(allReplies[replyId].dislikes ? allReplies[replyId].dislikes : {});
    if(!allDisLikes.length)return false;
    const data = allDisLikes.filter((currentUser) => currentUser.userId==userId);
    return data.length ? true : false;
  }

  const handleLikeReply = (replyId) =>{
    if(!isUser){
      history.push('/signIn');
      return;
    }
    if(ReplyLikedByUser(replyId)){
      const allLikes=Object.keys( allReplies[replyId].likes );
      const data = allLikes.filter((id) => allReplies[replyId]['likes'][id].userId==userId);
      const refReplies=ref(db,`replies/${replyId}/likes/${data[0]}`);
      dbRef.removeLikeFromReply(refReplies);
    }
    else{
      if(ReplyDisLikedByUser(replyId)){
        const allDisLikes=Object.keys( allReplies[replyId].dislikes );
        const data = allDisLikes.filter((id) => allReplies[replyId]['dislikes'][id].userId==userId);
        const refReplies=ref(db,`replies/${replyId}/dislikes/${data[0]}`);
        dbRef.removeDisLikeFromComment(refReplies);
      }
      dbRef.addLikeToReply(replyId,userId);
    }
  }

  const handleDislikeReply = (replyId) =>{
    if(!isUser){
      history.push('/signIn');
      return;
    }
    if(ReplyDisLikedByUser(replyId)){
        const allDisLikes=Object.keys( allReplies[replyId].dislikes );
        const data = allDisLikes.filter((id) => allReplies[replyId]['dislikes'][id].userId==userId);
        const refReplies=ref(db,`replies/${replyId}/dislikes/${data[0]}`);
        dbRef.removeDisLikeFromReply(refReplies);
    }
    else{
      if(ReplyLikedByUser(replyId)){
        const allLikes=Object.keys( allReplies[replyId].likes );
        const data = allLikes.filter((id) => allReplies[replyId]['likes'][id].userId==userId);
        const refReplies=ref(db,`replies/${replyId}/likes/${data[0]}`);
        dbRef.removeLikeFromReply(refReplies);
      }
      dbRef.addDisLikeToReply(replyId,userId);
    }
  }
  

  return (
    <Row style={{padding:"10px"}}>
        <Col sm={12}>
            <Row>
                <Col sm={1}>
                    <img style={{borderRadius:"50%",height:"40px",width:"40px",objectFit:"cover", imageRendering:"crisp-edges"}} src={isUser ? user.avatar : require("../assets/user.png")} alt="youTube" />
                </Col>
                <Col sm={11}>
                    <Row>
                        <Col sm={12}>
                            <Input
                                type="text"
                                name="comment"
                                id="comment"
                                className={classes.inputBox}
                                placeholder="Add a public comment..."
                                type="textarea"
                                cssModule={{'form-control':classes.inputBox}}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                onFocus={()=> {
                                  setShowCommentButton(true);
                                  if(!isUser){
                                    history.push('/signIn');
                                  }
                                }}
                                >
                            </Input>
                        </Col>
                        <Col sm={12} style={{padding:"10px"}}>
                            {showCommentButton && <Row>
                                <Col sm={10} style={{display:"flex",alignItems:"center",justifyContent:"flex-end"}}>
                                    <Button onClick={() => {setComment("");setShowCommentButton(false)}}  className={classes.cancelButton}>
                                        Cancel
                                    </Button>
                                </Col>
                                <Col sm={2} style={{display:"flex",alignItems:"center",justifyContent:"flex-end"}}>
                                    <Button onClick={handleComment}  className={classes.commentButton} disabled={/^\s*$/.test(comment)}>
                                        Comment
                                    </Button>
                                </Col>
                            </Row>}
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Col>
        <Col sm={12}>
            {Object.values((loading.comments && loading.videos && videos[props.videoId].comments) ? videos[props.videoId].comments : {}).reverse().map((currentComment,index)=>{
              return (<Row>
                  <Col sm={1} style={{display:"flex",justifyContent:"flex-start"}}>
                      <img style={{borderRadius:"50%",height:"40px",width:"40px",objectFit:"cover", imageRendering:"crisp-edges"}} 
                      src={loading.users ? allUsers[allComments[currentComment.commentId].userId].avatar : ""} alt="youTube" />
                  </Col>
                  <Col sm={11}>
                      <Row>
                          <Col sm={12} style={{display:"flex",alignItems:"center",justifyContent:"flex-start"}}>
                              <Typography className={classes.title}>{loading.users ? allUsers[allComments[currentComment.commentId].userId].userName : ""}</Typography>
                          </Col>
                          <Col sm={12} style={{display:"flex",alignItems:"center",justifyContent:"flex-start"}}>
                              <Typography className={classes.comment}>{allComments[currentComment.commentId].text}</Typography>
                          </Col>
                          <Col sm={12}>
                              <Row style={{padding:"10px"}}>
                                <Col sm={1}>
                                  <Row>
                                    <Col sm={6} style={{display:"flex",alignItems:"flex-end",justifyContent:"flex-start"}}>
                                      <Link onClick={() => handleLikeComment(currentComment.commentId)}>
                                        <img style={{height:"20px",width:"20px",objectFit:"cover", imageRendering:"crisp-edges"}} 
                                        src={require(CommentLikedByUser(currentComment.commentId) ? "../assets/like.png" : "../assets/likeEmpty.png")} 
                                        alt="youTube" />
                                      </Link>
                                    </Col>
                                    <Col sm={6} style={{display:"flex",alignItems:"flex-end",justifyContent:"flex-start",paddingLeft:"2px"}}>
                                      <Typography>{Object.keys( allComments[currentComment.commentId].likes ? allComments[currentComment.commentId].likes : {} ).length}
                                      </Typography>
                                    </Col>
                                  </Row>
                                </Col>
                                <Col sm={1}>
                                  <Row>
                                      <Col sm={6} style={{display:"flex",alignItems:"flex-end",justifyContent:"flex-start"}}>
                                          <Link onClick={() => handleDislikeComment(currentComment.commentId)}>
                                            <img style={{height:"20px",width:"20px",objectFit:"cover", imageRendering:"crisp-edges"}} 
                                            src={require(CommentDisLikedByUser(currentComment.commentId) ? "../assets/dislike.png" : "../assets/dislikeEmpty.png")} 
                                            alt="youTube" />
                                          </Link>
                                      </Col>
                                      <Col sm={6} style={{display:"flex",alignItems:"flex-end",justifyContent:"flex-start",paddingLeft:"2px"}}>
                                        <Typography>
                                          {Object.keys( allComments[currentComment.commentId].dislikes ? allComments[currentComment.commentId].dislikes : {} ).length}
                                        </Typography>
                                      </Col>
                                    </Row>
                                </Col>
                                <Col sm={10} style={{display:"flex",alignItems:"center",justifyContent:"flex-start",padding:"0px"}}>
                                    <Button onClick={() => {
                                      handleAddReply(currentComment.commentId,true);
                                      setShowReplyButton(true);
                                      if(!isUser){
                                        history.push('/signIn');
                                      }
                                    }} 
                                    style={{paddingTop:"0px",fontFamily:"sans-serif",paddingLeft:"0px"}}>Reply</Button>
                                </Col>
                              </Row>
                          </Col>
                          <Col sm={12}>
                            {addReply[currentComment.commentId] && <Row>
                                <Col sm={1}>
                                    <img style={{borderRadius:"50%",height:"40px",width:"40px",objectFit:"cover", imageRendering:"crisp-edges"}} 
                                    src={isUser ? user.avatar : ""} alt="youTube" />
                                </Col>
                                <Col sm={11}>
                                    <Row>
                                        <Col sm={12}>
                                            <Input
                                                type="text"
                                                name="reply"
                                                id="reply"
                                                className={classes.inputBox}
                                                placeholder="Add a public reply..."
                                                type="textarea"
                                                cssModule={{'form-control':classes.inputBox}}
                                                value={reply}
                                                onChange={(e) => setReply(e.target.value)}
                                                onFocus={() => setShowReplyButton(true)}
                                                >
                                            </Input>
                                        </Col>
                                        <Col sm={12} style={{padding:"10px"}}>
                                          {showReplyButton && <Row>
                                              <Col sm={10} style={{display:"flex",alignItems:"center",justifyContent:"flex-end"}}>
                                                  <Button onClick={() => {setReply("");setShowReplyButton(false);handleAddReply(currentComment.commentId,false)}}  
                                                  className={classes.cancelButton}>
                                                      Cancel
                                                  </Button>
                                              </Col>
                                              <Col sm={2} style={{display:"flex",alignItems:"center",justifyContent:"flex-end"}}>
                                                  <Button onClick={()=>handleReply(currentComment.commentId)}  className={classes.commentButton} 
                                                  disabled={/^\s*$/.test(reply)}>
                                                      Reply
                                                  </Button>
                                              </Col>
                                          </Row>}
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>}
                          </Col>
                          <Col sm={12}>
                            {(loading.replies && allComments[currentComment.commentId].replies) && 
                              <Row>
                                <Col sm={12} style={{display:"flex",alignItems:"center",justifyContent:"flex-start", paddingBottom:"10px"}}>
                                  <Button onClick={()=>handleShowReply(currentComment.commentId,!showReplies[currentComment.commentId])}
                                  style={{paddingTop:"0px",fontFamily:"sans-serif",paddingLeft:"0px",fontWeight:"bold",color:"blue"}}>
                                    {`${showReplies[currentComment.commentId] ? "Hide" : "Show"} Replies`}
                                  </Button>
                                  
                                </Col>
                            </Row>}
                            {Object.values((loading.replies && allComments[currentComment.commentId].replies) ? allComments[currentComment.commentId].replies  
                            : {}).reverse().map((currentReply,index) => {
                              return (
                                <>
                                  
                                  {showReplies[currentComment.commentId] &&<Row>
                                      <Col sm={1} style={{display:"flex",justifyContent:"flex-start"}}>
                                          <img style={{borderRadius:"50%",height:"40px",width:"40px",objectFit:"cover", imageRendering:"crisp-edges"}} 
                                          src={loading.users ? allUsers[allReplies[currentReply.replyId].userId].avatar : ""} alt="youTube" />
                                      </Col>
                                      <Col sm={11}>
                                          <Row>
                                              <Col sm={12} style={{display:"flex",alignItems:"center",justifyContent:"flex-start"}}>
                                                  <Typography className={classes.title}>{loading.users ? allUsers[allReplies[currentReply.replyId].userId].userName : ""}</Typography>
                                              </Col>
                                              <Col sm={12} style={{display:"flex",alignItems:"center",justifyContent:"flex-start"}}>
                                                  <Typography className={classes.comment}>{allReplies[currentReply.replyId].text}</Typography>
                                              </Col>
                                              <Col sm={12}>
                                                  <Row style={{padding:"10px"}}>
                                                    <Col sm={1}>
                                                      <Row>
                                                        <Col sm={6} style={{display:"flex",alignItems:"flex-end",justifyContent:"flex-start"}}>
                                                          <Link onClick={() => handleLikeReply(currentReply.replyId)}>
                                                            <img style={{height:"20px",width:"20px",objectFit:"cover", imageRendering:"crisp-edges"}} 
                                                            src={require(ReplyLikedByUser(currentReply.replyId) ? "../assets/like.png" : "../assets/likeEmpty.png")} 
                                                            alt="youTube" />
                                                          </Link>
                                                        </Col>
                                                        <Col sm={6} style={{display:"flex",alignItems:"flex-end",justifyContent:"center",paddingLeft:"2px"}}>
                                                          <Typography>
                                                            {Object.keys( allReplies[currentReply.replyId].likes ? allReplies[currentReply.replyId].likes : {} ).length}
                                                          </Typography>
                                                        </Col>
                                                      </Row>
                                                    </Col>
                                                    <Col sm={1}>
                                                      <Row>
                                                          <Col sm={6} style={{display:"flex",alignItems:"flex-end",justifyContent:"flex-start"}}>
                                                              <Link onClick={() => handleDislikeReply(currentReply.replyId)}>
                                                                <img style={{height:"20px",width:"20px",objectFit:"cover", imageRendering:"crisp-edges"}} 
                                                                src={require(ReplyDisLikedByUser(currentReply.replyId) ? "../assets/dislike.png" : "../assets/dislikeEmpty.png")} 
                                                                alt="youTube" />
                                                              </Link>
                                                            </Col>
                                                            <Col sm={6} style={{display:"flex",alignItems:"flex-end",justifyContent:"center",paddingLeft:"2px"}}>
                                                              <Typography>
                                                                {Object.keys( allReplies[currentReply.replyId].dislikes ? allReplies[currentReply.replyId].dislikes : {} ).length}
                                                              </Typography>
                                                            </Col>
                                                        </Row>
                                                    </Col>
                                                    
                                                  </Row>
                                              </Col>
                                            
                                          </Row>
                                      </Col>
                                  </Row>}
                                </>
                                
                              )
                            })}
                          </Col>
                      </Row>
                  </Col>
              </Row>)
            })}
        </Col>
    </Row>
  );
}
export default Comments;
