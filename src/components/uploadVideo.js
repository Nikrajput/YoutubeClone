import React, { useState, useEffect } from "react";
import {
  makeStyles,
  Typography,
  Box,
  Button,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";
import {
  FormGroup,
  Label,
  Input,
  Form,
  Row,
  Col,
  Alert,Dropdown, DropdownToggle, DropdownMenu, DropdownItem
} from "reactstrap";

import { Link, useHistory } from "react-router-dom";
import { uid } from 'uid';
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import { db } from "../firebase";
import SEO from "../components/seo";
import withAuthorization from "../authentication/withAuthorization";
import CircularProgressWithLabel from "../utils/circularProgressWithLabel";
import axios from "axios";



const useStyles = makeStyles((theme) => ({

  logoContainer: {
    position: "absolute",
    top: 10,
    left: 20,

    "& > img": {
      height: "60px"
    },

    [theme.breakpoints.down("sm")]: {
      "& > img": {
        height: "40px"
      }
    }
  },

  text:{
    display:"flex",
    justifyContent:"flex-start",
    fontFamily:"sans-serif",
    fontWeight:"bold"
  },
  inputBox:{
    height:"42px",
    fontFamily:"sans-serif",
    boxShadow: "inset 0 0 5px rgb(136 136 136 / 35%)",
    paddingLeft:"15px",
    outline:"none"
  },
  dropdown:{
    background:"white",
    color:"black",
    fontFamily:"sans-serif",
    width:"100%",
    boxShadow: "inset 0 0 5px rgb(136 136 136 / 35%)",
    outline:"none",
    border:"1px solid #ced4da",
    "&:hover": {
        color: "black",
        background: "white",
        border:"1px solid #ced4da",
    },
    display:"flex",
    justifyContent:"flex-start"
  },

  button:{
    fontWeight:"bold",
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

  heading: {
    fontSize: "1.3rem",
    fontWeight: "bold",
    fontFamily:"sans-serif",
    display:"flex",
    justifyContent:"flex-start",

    [theme.breakpoints.down("sm")]: {
      fontSize: "1.2rem"
    }
  },

  formSection: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    positon: "relative",

    [theme.breakpoints.down("md")]: {
      width: "100%",
      margin: "0 5%",
    },
  },

  loader: {
    zIndex: 3,
    position: "absolute",
    background: "white",
    color:"black",
    width: "50%",
    opacity: 0.3,
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    [theme.breakpoints.down("md")]: {
      width: "100%"
    }
  },

  formContainer: {
    width: "50%",

    [theme.breakpoints.down("md")]: {
      width: "100%",
    },
  },

  form: {
    margin: "2rem 0",
  },

  loginButtons: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    marginTop: "1rem"
  },

  signupText: {
    color: "gray",
    textAlign: "center",
    fontFamily:"sans-serif",

    "& > span": {
      color: "black",
      fontWeight: "bold",
      marginLeft: "0.5rem",
    },

    [theme.breakpoints.down("sm")]: {
      fontSize: "1rem"
    }
  },

  // ** Image Section **
  imageSection: {
    width: "100%",
    height:"100vh",
    padding:"0px"
  },

  imageContainer: {
    position: "fixed",
    height: "100%",
    width:"52%"
  },

  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },
}));

const categoryArray = ["Entertainment", "Educational", "Vlogs", "Reels", "Sports", "News"];

const UploadVideo = () => {
  const classes = useStyles();
  const history = useHistory();

  const theme = useTheme();
  const mediumDevice = useMediaQuery(theme.breakpoints.down("md"));

  const user = firebase.auth().currentUser;
  const userId = user.uid;

  // ** State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [video, setVideo] = useState(null);
  const [allCategory, setAllCategory] = useState([]);

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const [percentageUploaded, setPercentageUploaded] = useState(0);

  useEffect(() => {
    setAllCategory([...categoryArray]);
    setPercentageUploaded(0);
    const timer = () => {
      setTimeout(() => {
        setErrorMessage("");
      }, 3000);
    };

    return timer;
  }, []);

  // ** Login Functions
  var timer;
  function startTimer() {
      timer = setInterval(function() {
        setPercentageUploaded((prevState) => prevState+1);
      }, 1000);
  }
    
  function stopTimer() {
      clearInterval(timer);
  }
  const handleUpload = async() => {
    if(!title || !category || !video ){
      setErrorMessage("All Fields are compulsory")
      return;
    }
    if (video.type !== "video/mp4") {
      setErrorMessage("Invalid Video Type")
      return;
    }
    if(video.size > 10000000){
      setErrorMessage("File size cannot be greater than 10 MB");
      return;
    }

    setIsLoading(true);
    startTimer();
    const data=new FormData();
    data.append('video',video);
    const result = await axios.post(`https://video-image-upload.herokuapp.com/`,data);
    db.doUploadVideo(userId,result.data.video.secure_url,title,category);
    setPercentageUploaded(93);
    setTimeout(()=>{
      stopTimer();
      setPercentageUploaded(100);
      setTitle("");
      setCategory("");
      setVideo(null);
      history.push("/");
      setIsLoading(false);
    },7000)
  };

  return (
    <>
      <SEO title="Upload Video" />
      <Row style={{width:"100%"}}>
          <Col sm={6} xs={12}>
            <Row>
                <Col sm={12} style={{height:"50px"}}>
                    <Link to="/">
                        <div className={classes.logoContainer}>
                            <img style={{height:"25px",width:"auto"}} src={require("../assets/YoutubeTextLogo.png")} alt="YouTube"/>
                        </div>
                    </Link>
                </Col>
                <Col sm={12} style={{paddingTop:"100px"}}>
                <section className={classes.formSection}>
                    {isLoading && (
                        <div className={classes.loader}>
                            <CircularProgressWithLabel value={percentageUploaded} color="primary" size={60} />
                        </div>
                    )}
                    <div className={classes.formContainer}>
                        <Typography
                        className={classes.heading}
                        >
                        Upload Your Video!
                        </Typography>
                        
                        <Form className={classes.form}>
                        {errorMessage && <Alert color="danger">{errorMessage}</Alert>}
                        <Row>
                            <Col sm={12}>
                            <FormGroup>
                                <Label className={classes.text} for="title">Title</Label>
                                <Input
                                    type="text"
                                    name="title"
                                    id="title"
                                    className={classes.inputBox}
                                    placeholder="Enter title for your video"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </FormGroup>
                            </Col>
                            <Col sm={12}>
                            <FormGroup>
                                <Label className={classes.text} for="category">Category</Label>
                                <Dropdown isOpen={dropdown} toggle={(e) =>{setDropdown(!dropdown)}} >
                                    <DropdownToggle  className={classes.dropdown}>
                                        {category ? category : "Select Category for Video"}
                                    </DropdownToggle>
                                    <DropdownMenu style={{width:"100%"}} >
                                        {allCategory.map(data => {
                                            return (
                                                <DropdownItem   onClick={(e) => setCategory(e.target.innerText)}>{data}</DropdownItem>
                                            )
                                        })}
                                    </DropdownMenu>
                                </Dropdown>
                            </FormGroup>
                            </Col>
                            <Col sm={12}>
                            <FormGroup>
                                <Label className={classes.text} for="video">Video</Label>
                                <Input
                                  type="file"
                                  name="video"
                                  id="video"
                                  onChange={(e) => setVideo(e.target.files[0])}
                                  className={classes.inputBox}
                                />
                            </FormGroup>
                            </Col>
                        </Row>
                        <Row className={classes.loginButtons}>
                            <Col sm={12}>
                            <Button
                                disableElevation
                                variant="contained"
                                fullWidth
                                onClick={handleUpload}
                                className={classes.button}
                            >
                                Upload
                            </Button>
                            </Col>
                        </Row>
                        </Form>
                    </div>
                    </section>
                </Col>
            </Row>
          </Col>
          <Col sm={6} className={classes.imageSection}>
            {!mediumDevice && (
                <div className={classes.imageContainer}>
                    <img
                        className={classes.image}
                        src={require("../assets/image.jpg")}
                        alt=""
                    />
                </div>
            )}
          </Col>
      </Row>
    </>
  );
};

const authCondition = (authUser) => authUser;

export default withAuthorization(authCondition)(UploadVideo);