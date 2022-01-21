import React, { useState, useEffect } from "react";
import {
  makeStyles,
  Typography,
  Box,
  Button,
  useMediaQuery,
  useTheme,
  CircularProgress,
} from "@material-ui/core";
import {
  FormGroup,
  Label,
  Input,
  Form,
  Row,
  Col,
  Alert,
} from "reactstrap";

import { Link, useHistory } from "react-router-dom";
import { uid } from 'uid';
import "firebase/compat/auth";

import { db } from "../firebase";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { auth } from "../firebase";
import { handleAuthError } from "./handleAuthError";
import SEO from "../components/seo";



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

const Signup = () => {
  const classes = useStyles();
  const history = useHistory();

  const theme = useTheme();
  const mediumDevice = useMediaQuery(theme.breakpoints.down("md"));

  // ** State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState(null)

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = () => {
      setTimeout(() => {
        setErrorMessage("");
      }, 3000);
    };

    return timer;
  }, [errorMessage]);

  const validateEmail = (email) =>{
    return email.match(
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
  };
  // ** Login Functions
  const handleSignup = () => {
    if(!name || !email || !password || !image ){
      setErrorMessage("All Fields are compulsory")
      return;
    }

    if(!validateEmail(email)){
      setErrorMessage("Email is not valid");
      return;
    }

    if (image.type !== "image/jpeg" && image.type !=="image/png") {
      setErrorMessage("Invalid Image Type")
      return;
    }
    setIsLoading(true);
    const storage = getStorage();
    const itemId=uid(16);
    const storageRef = ref(storage, `${image.name}${itemId}`);
    const uploadTask = uploadBytesResumable(storageRef, image);
    uploadTask.on('state_changed', 
        (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            switch (snapshot.state) {
            case 'paused':
                console.log('Upload is paused');
                break;
            case 'running':
                console.log('Upload is running');
                break;
            }
        }, 
        (err) => {
          const error = handleAuthError(err);
          setErrorMessage(error);
          setIsLoading(false);
        }, 
        () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              auth
                .doCreateUserWithEmailAndPassword(email, password)
                .then((authUser) => {
                  db.doCreateUser(authUser.user.uid,email,name,downloadURL);
                  setEmail("");
                  setPassword("");
                  setImage(null);
                  setName("");
                  history.push("/");
                  setIsLoading(false);
                })
                .catch((err) => {
                  const error = handleAuthError(err);
                  setErrorMessage(error);
                  setIsLoading(false);
                });
            });
        }
        );
  };

  return (
    <>
      <SEO title="Sign up" />
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
                        <CircularProgress color="inherit" size={60} />
                        </div>
                    )}
                    <div className={classes.formContainer}>
                        <Typography
                        className={classes.heading}
                        >
                        Start your journey!
                        </Typography>
                        
                        <Form className={classes.form}>
                        {errorMessage && <Alert color="danger">{errorMessage}</Alert>}
                        <Row>
                            <Col sm={12}>
                            <FormGroup>
                                <Label className={classes.text} for="name">Username</Label>
                                <Input
                                type="text"
                                name="name"
                                id="name"
                                className={classes.inputBox}
                                placeholder="Enter your username"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                />
                            </FormGroup>
                            </Col>
                            <Col sm={12}>
                            <FormGroup>
                                <Label className={classes.text} for="email">Email</Label>
                                <Input
                                type="email"
                                name="email"
                                id="email"
                                className={classes.inputBox}
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                />
                            </FormGroup>
                            </Col>
                            <Col sm={12}>
                            <FormGroup>
                                <Label className={classes.text} for="password">Password</Label>
                                <Input
                                type="password"
                                name="password"
                                id="password"
                                className={classes.inputBox}
                                placeholder="******"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                />
                            </FormGroup>
                            </Col>
                            <Col sm={12}>
                            <FormGroup>
                                <Label className={classes.text} for="confirm">Avatar</Label>
                                <Input
                                  type="file"
                                  name="image"
                                  id="image"
                                  onChange={(e) => setImage(e.target.files[0])}
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
                                onClick={handleSignup}
                                className={classes.button}
                            >
                                Sign up
                            </Button>
                            </Col>
                        </Row>
                        </Form>
                        <Typography variant="h6" className={classes.signupText}>
                        Already have an account?
                        <span>
                            <Link to="/signin" style={{ color: "black",fontFamily:"sans-serif" }}>
                            Login here
                            </Link>
                        </span>
                        </Typography>
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

export default Signup;