export const handleAuthError = (error) => {
  if (error.code === "auth/user-not-found") {
    return "User does not exist"
  }

  else if (error.code === "auth/invalid-email") {
    return "Enter a valid email address"
  }

  else if (error.code === "auth/wrong-password") {
    return "Invalid credentials"
  }

  else if (error.code === "auth/weak-password") {
    return "Weak Password"
  }
  else{
    return `${error.code}`;
  }
}