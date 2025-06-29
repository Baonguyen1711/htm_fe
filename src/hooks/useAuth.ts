import { useState, useEffect, useRef } from "react";
import {
  getAuth,
  signInWithEmailAndPassword,
  User,
  signOut,
  onAuthStateChanged,
  signInAnonymously,
  browserLocalPersistence,
  setPersistence
} from "firebase/auth";
import {app} from "../firebase-config";
// import { useAxiosAuth } from "../context/authContext";
import { authenticateUser } from "../services/firebaseServices";
import authService from "../services/auth.service";


const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true)

  // const { setAuthToken } = useAxiosAuth()
  useEffect(() => {
    const auth = getAuth(app);
    console.log("Current persistence:", auth)
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // if(isMounted.current) {
      //   isMounted.current = false
      //   return
      // }
      if (user) {
        const uid = user.uid;
        console.log("uid", uid)
        const token = await user.getIdToken();
        //await authenticateUser(token)
        await authService.authenticateUser(
          {
            token: token
          }
        )
        // setAuthToken(token);
      } else {
        // setAuthToken(null);
      }
    });

    return () => unsubscribe();
  }, []);


  const login = async (email: string, password: string) => {
      setLoading(true);
      setError(null); // Clear any previous errors
      const auth = getAuth(app);
  
      try {
          // Set persistence to 'local' before signing in
          await setPersistence(auth, browserLocalPersistence);
  
          const userCredential = await signInWithEmailAndPassword(
              auth,
              email,
              password
          );
          setUser(userCredential.user);
          console.log("userCredential", userCredential);
          return userCredential.user;
      } catch (err: any) {
          console.error("Error:", err.message);
          setError(err.message);
          return null;
      } finally {
          setLoading(false);
      }
  };

  const logout = async () => {
    setLoading(true);
    setError(null); // Clear any previous errors
    const auth = getAuth();
    try {
      await signOut(auth);
      setUser(null);
      console.log("User signed out");
    } catch (err: any) {
      console.error("Error signing out:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signInWithoutPassword = async () => {
    const auth = getAuth();
    await setPersistence(auth, browserLocalPersistence);
    await signInAnonymously(auth)
      .then(() => {
        console.log("sign in sucessfully")
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;

        console.log(errorMessage)
      });

  }

  const getToken = async () => {
    setLoading(true);
    setError(null); // Clear any previous errors
    if (user) {
      console.log("user", user);
      try {
        const token = await user.getIdToken();
        return token;
      } catch (err: any) {
        console.error("Error fetching token:", err.message);
        setError(err.message);
        return null;
      } finally {
        setLoading(false);
      }
    }
    return null;
  };

  return { user, login, logout, getToken, loading, error, signInWithoutPassword };
};

export default useAuth;