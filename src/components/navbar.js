import React, { useEffect, useState } from "react";
import {
  AppBar,
  makeStyles,
  useTheme,
  Button,
  useMediaQuery,
} from "@material-ui/core";
import { useHistory, Link } from "react-router-dom";
import {Row, Col} from "reactstrap";
import { auth, db } from "../firebase/firebase";
import { auth as authFirebase} from "../firebase";
import { ref, onValue, query, orderByKey, equalTo } from "firebase/database";


const useStyles = makeStyles((theme) => ({
  header: {
    boxShadow: "none",
    background: "white",
    backdropFilter: "blur(8px)",
    overflowX:"hidden"
  },
  searchBox:{
    width:"60%", 
    height:"40px",
    fontFamily:"sans-serif",
    boxShadow: "inset 0 0 5px rgb(136 136 136 / 35%)",
    paddingLeft:"15px",
    outline:"none"
  },
  searchOption:{
    width:"60%", 
    height:"40px",
    fontFamily:"sans-serif",
    paddingLeft:"15px",
    outline:"none",
    borderTop:"none",
    borderColor:"black",
    background:"white",
    color:"black",
    borderRadius:"15px",
    cursor:"pointer"
  },
  button:{
    fontWeight:"bold",
    width:"80%", 
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
  signOutButton:{
    fontWeight:"bold",
    width:"80%", 
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
  }
}));

function Navbar() {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [isUser, setIsUser] = useState(false);
  const [user,setUser] = useState({});
  const [userId,setUserId] = useState("");

  const [allVideos, setAllVideos] = useState({});
  const [allUsers, setAllUsers] = useState({});
  const [loading, setLoading] = useState({});
  const [options, setOptions] = useState({});

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

  useEffect(() => {
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

  const handleTitlePart = (text)=>{
    if(!loading.videos)return{};
    const result={};
    Object.keys(allVideos).map((key)=>{
      const title=allVideos[key].title.toLowerCase();
      const index=title.split(" ").indexOf(text.toLowerCase());
      if(index!=-1){
        result[title]=key;
      }
    })
    setOptions(()=>({
      ...result
    }))
  }
  const handleCategoryPart = (text)=>{
    if(!loading.videos)return{};
    const result={};
    Object.keys(allVideos).map((key)=>{
      const category=allVideos[key].category.toLowerCase();
      if(text.toLowerCase() == category){
        result[allVideos[key].title]=key;
      }
    })
    setOptions((prevState)=>({
      ...prevState,
      ...result
    }))
  }
  const handleInputOption = (e)=>{
    const text=e.target.value;
    handleTitlePart(text);
    handleCategoryPart(text);
  }

  return (
    
    <Row style={{padding:"10px"}}>
      <Col sm={2} style={{display:"flex",justifyContent:"flex-start"}}>
        <Link to="/">
          <img style={{height:"25px",width:"auto",imageRendering:"crisp-edges"}} src={require("../assets/YoutubeTextLogo.png")} alt="youTube" />
        </Link>
      </Col>
      <Col sm={8} style={{zIndex:"5",height:"0px"}}>
        <Row>
          <Col sm={12}>
            <input onChange={(e)=>handleInputOption(e)} type="search" placeholder="Search" className={classes.searchBox}></input>
          </Col>
          {Object.keys(options).map((key)=>{
            return (
              <Col sm={12} >
                <input onClick={()=>{history.push(`/watch/${options[key]}`)}} readOnly={true} value={key}  className={classes.searchOption}></input>
              </Col>
            )
          })}
          
        </Row>
      </Col>
      <Col sm={2} >
          <Row>
              <Col sm={2} style={{display:"flex",justifyContent:"flex-end",padding:"0px"}}>
                <Link to="/uploadVideo">
                  <img style={{height:"35px"}} src={require("../assets/add-video.png")} alt="youTube"></img>
                </Link>
              </Col>
              <Col sm={10} style={{display:"flex",justifyContent:"center"}}>
                {!isUser ? 
                  <Row>
                      <Col sm={3}>
                        <img style={{borderRadius:"50%",height:"40px",width:"40px",objectFit:"cover", imageRendering:"crisp-edges"}} src={require("../assets/user.png")} alt="youTube" />
                      </Col>
                      <Col sm={9}>
                        <Button onClick={() => history.push('/signIn')} className={classes.button}>SignIn</Button>
                      </Col>
                  </Row>
                
                :<Row>
                    <Col sm={3}>
                      <Link to={`/channel/${userId}`}>
                        <img style={{borderRadius:"50%",height:"40px",width:"40px",objectFit:"cover", imageRendering:"crisp-edges"}} src={user.avatar} alt="youTube" />
                      </Link>
                    </Col>
                    <Col sm={9}>
                      <Button onClick={authFirebase.doSignOut} className={classes.signOutButton}>SignOut</Button>
                    </Col>
                  </Row>
                }
              </Col>
          </Row>
      </Col>
    </Row>
  
  );
}
export default Navbar;
