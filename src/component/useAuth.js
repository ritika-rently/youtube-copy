import { useEffect, useState } from 'react';
import { gapi } from 'gapi-script';

const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const SCOPES = process.env.REACT_APP_SCOPES;

export const useAuth = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Define setSignInStatus outside of useEffect so it can be used by signIn and signOut
  const setSignInStatus = (isSignedIn) => {
    setIsSignedIn(isSignedIn);
    if (isSignedIn) {
      const user = gapi.auth2.getAuthInstance().currentUser.get();
      const idToken = user.getAuthResponse().id_token;
      sessionStorage.setItem('authToken', idToken);
    } else {
      sessionStorage.removeItem('authToken');
    }
  };

  useEffect(() => {
    const initClient = () => {
      gapi.auth2.init({
        clientId: CLIENT_ID,
        scope: SCOPES,
        plugin_name: 'youtube',
      }).then(() => {
        const authInstance = gapi.auth2.getAuthInstance();
        // Listen for sign-in state changes.
        authInstance.isSignedIn.listen(setSignInStatus);
        // Set initial sign-in state.
        setSignInStatus(authInstance.isSignedIn.get());
      });
    };

    // Load the gapi client and initialize it
    gapi.load('client:auth2', initClient);
  }, []);

  // Functions to sign in and sign out, using setSignInStatus defined outside
  const signIn = () => {
    const authInstance = gapi.auth2.getAuthInstance();
    authInstance.signIn().then(() => setSignInStatus(authInstance.isSignedIn.get()));
  };

  const signOut = () => {
    const authInstance = gapi.auth2.getAuthInstance();
    authInstance.signOut().then(() => setSignInStatus(authInstance.isSignedIn.get()));
  };

  return { isSignedIn, signIn, signOut };
};
