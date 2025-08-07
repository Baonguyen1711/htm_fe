import { useState, useEffect } from "react";
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
import app from "../../../shared/services/firebase/config";
import { useAppDispatch } from "../../../app/store";
import { authApi } from "../../../shared/services/auth/authApi"
import { setCurrentPlayer } from "../../../app/store/slices/gameSlice";




const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const authenticateUser = authApi.authenticateUser;
  const dispatch = useAppDispatch();

  // const { setAuthToken } = useAxiosAuth()
  useEffect(() => {
    const auth = getAuth(app);
    console.log("Current persistence:", auth)
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const uid = user.uid;
        console.log("uid", uid)
        const token = await user.getIdToken();
        console.log("token", token)

        // Only call authenticateUser if not on join room page
        // This prevents automatic authentication when players are just browsing the join room form
        const isOnJoinRoomPage = window.location.pathname === '/join' ||
                                 window.location.pathname === '/spectatorJoin';
        if (!isOnJoinRoomPage) {
          authenticateUser(token)
        }

        dispatch(setCurrentPlayer({
          uid: uid
        }))
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
        const errorMessage = error.message;
        console.log(errorMessage)
      });

  }

  const authenticateUserManually = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      await authenticateUser(token);
      console.log("Manual authentication completed");
    }
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

  return { user, login, logout, getToken, loading, error, signInWithoutPassword, authenticateUserManually };
};

export default useAuth;