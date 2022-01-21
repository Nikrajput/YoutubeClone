import React, { useEffect } from "react";
import {
  AppBar,
  makeStyles,
  useTheme,
  Button,
  useMediaQuery,
  Link as MLink,
  Typography
} from "@material-ui/core";
import {Row, Col} from "reactstrap";
import { useHistory, Link } from "react-router-dom";
import { db, auth  } from "../firebase/firebase";


const useStyles = makeStyles((theme) => ({
  button:{
    "&:hover": {
      background: "#D6DBDF",
      cursor: "pointer"
    }
  }
}));

function Sidebar() {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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

  const handleMyChannel = ()=>{
    if(!isUser){
      history.push('/signIn');
      return;
    }
    history.push(`/channel/${userId}`);
    return;
  }

  const handleMySubscriptions = ()=>{
    if(!isUser){
      history.push('/signIn');
      return;
    }
    history.push(`/subscriptions/${userId}`);
    return;
  }


  return (
      <Row style={{padding:"10px"}}>
        <Col sm={12} >
            <Link to="/" style={{textDecoration:"none",color:"black"}}>
              <div className={classes.button}>
                  <img style={{height:"20px"}} src={require("../assets/home.png")} alt="youTube"></img>
                  <Typography style={{fontSize:"12px"}}>Home</Typography>
              </div>
            </Link>
        </Col>
        <Col sm={12} style={{marginTop:"20px"}}>
            <Link onClick={handleMySubscriptions} style={{textDecoration:"none",color:"black"}}>
              <div className={classes.button}>
                  <img style={{height:"20px"}} src={require("../assets/subscription.png")} alt="youTube"></img>
                  <Typography style={{fontSize:"12px"}}>Subscriptions</Typography>
              </div>
            </Link>
        </Col>
        <Col sm={12} style={{marginTop:"20px"}}>
            <Link onClick={handleMyChannel} style={{textDecoration:"none",color:"black"}}>
              <div className={classes.button}>
                  <img style={{height:"20px"}} src={require("../assets/myVideo.png")} alt="youTube"></img>
                  <Typography style={{fontSize:"12px"}}>My Channel</Typography>
              </div>
            </Link>
        </Col>
      </Row>
  );
}
export default Sidebar;
