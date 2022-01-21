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

import { auth } from "../firebase";
import { db } from "../firebase";

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
    textAlign: "left",
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
  }
}));

const Signin = () => {
  const classes = useStyles();
  const history = useHistory();

  const theme = useTheme();
  const mediumDevice = useMediaQuery(theme.breakpoints.down("md"));

  // ** State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

  // ** Login Functions
  const handleGoogleLogin = () => {
    setIsLoading(true);
    auth
      .dogoogleSignIn()
      .then((authUser) => {
        db.doCreateUser(authUser.user.uid,authUser.user.email,authUser.user.displayName,authUser.user.photoURL)
        history.push("/");
        setIsLoading(false);
      })
      .catch((err) => {
        const error = handleAuthError(err);
        setErrorMessage(error);
        setIsLoading(false);
      });
  };

  const handleSignin = () => {
    setIsLoading(true);
    auth
      .doSignInWithEmailAndPassword(email, password)
      .then(() => {
        setEmail("");
        setPassword("");
        history.push("/");
        setIsLoading(false);
      })
      .catch((err) => {
        const error = handleAuthError(err);
        setErrorMessage(error);
        setIsLoading(false);
      });
  }

  return (
    <>
      <SEO title="Sign in" />
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
                        </Row>
                        <Row className={classes.loginButtons}>
                            <Col sm={12}>
                            <Button
                                disableElevation
                                variant="contained"
                                fullWidth
                                onClick={handleSignin}
                                className={classes.button}
                            >
                                Sign in
                            </Button>
                            </Col>
                        </Row>
                        </Form>
                        <Row>
                            <Col sm={6} style={{width:"100%",paddingRight:"0px"}}>
                                <Button
                                    disableElevation
                                    variant="contained"
                                    fullWidth
                                    onClick={handleGoogleLogin}
                                    className={classes.button}
                                >
                                    Sign in using <img style={{height:"25px",width:"auto",paddingLeft:"5px"}} src={require("../assets/google.png")} alt="YouTube"/>
                                 </Button>
                            </Col>
                            <Col sm={6}  style={{width:"100%",paddingLeft:"5px"}}>
                                <Button
                                    disableElevation
                                    variant="contained"
                                    fullWidth
                                    onClick={() => history.push('/signUp')}
                                    className={classes.button}
                                >
                                    Sign up
                                </Button>
                            </Col>
                        </Row>
                        
                        
                        
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

export default Signin;