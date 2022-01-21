import React from 'react';

import { withRouter } from 'react-router-dom';
import { auth } from '../firebase/firebase'

const withAuth = (Component) => {
  class withAuth extends React.Component {

    state = {
      user: null
    }
    
    componentDidMount() {
      auth.onAuthStateChanged(authUser => {
        if (!authUser || authUser === null) {
          this.props.history.push("/signin")
        } else {
          this.setState({ user: authUser })
        }
      })
    }

    render() {
      const { user } = this.state
      return (
        <Component user={user} />
      )
    }
  }

  return withRouter(withAuth)
}

export default withAuth