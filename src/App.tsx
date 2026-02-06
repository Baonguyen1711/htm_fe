import './App.css';
import React, { Suspense, useEffect, useState } from 'react';
import { Routes, Route, useSearchParams, useLocation } from "react-router-dom";
import CreateRoom from './pages/Host/Room/CreateRoom';

import ReduxProvider from './app/store/providers/ReduxProvider';

import { TimeStartProvider } from './context/timeListenerContext';
import { SoundProvider } from './context/soundContext';
import FallBack from './components/ui/Error/FallBack';
import ProtectedRoute from './routes/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import ErrorBoundary from './components/ui/Error/ErrorBoundary';
import 'react-toastify/dist/ReactToastify.css';
import { AnimatePresence, circIn, motion } from "framer-motion";
import "./index.css";
import { useFirebaseListener } from './shared/hooks';


const Home = React.lazy(() => import('./pages/Home/Home'));

const UserRound1 = React.lazy(() => import('./pages/User/Round1/UserRound1'))
const UserRound2 = React.lazy(() => import('./pages/User/Round2/UserRound2'));
const UserRound3 = React.lazy(() => import('./pages/User/Round3/UserRound3'));
const UserRound4 = React.lazy(() => import('./pages/User/Round4/UserRound4'));
const UserRoundTurn = React.lazy(() => import('./pages/User/Round1/UserRound1'));
const NewLayout = React.lazy(() => import("./layouts/GameLayout"))
const UserMultipleChoice = React.lazy(() => import('./pages/User/MultipleChoice/MultipleChoice'));
const NewUserRound1 = React.lazy(() => import('./pages/User/NewUserRound1'))


const HostRound1 = React.lazy(() => import('./pages/Host/Management/HostRound1'));
const HostRound2 = React.lazy(() => import('./pages/Host/Management/HostRound2'));
const HostRound3 = React.lazy(() => import('./pages/Host/Management/HostRound3'));
const HostRound4 = React.lazy(() => import('./pages/Host/Management/HostRound4'));
const HostRoundTurn = React.lazy(() => import('./pages/Host/Management/HostRound1'));
const HostMultipleChoice = React.lazy(() => import('./pages/Host/Management/NewHostMultipleChoice'));
const AfterRoundRanking = React.lazy(() => import('./components/ui/AfterRoundRanking'))
const SummaryAfterRound = React.lazy(() => import('./components/ui/SummaryAfterRound'))
const FinalRanking = React.lazy(() => import('./components/NewFinalRanking'))
const HostRanking = React.lazy(() => import('./components/HostRanking'));
const HostLobby = React.lazy(() => import('./pages/Host/Management/HostLobby'));
const Lobby = React.lazy(() => import('./pages/Lobby/NewLobby'))
const MCLobby = React.lazy(() => import('./pages/MC/MCLobby'))

const Login = React.lazy(() => import('./pages/Login/Login'))
const Register = React.lazy(() => import('./pages/Register/Register'))
const JoinRoom = React.lazy(() => import('./pages/JoinRoom/JoinRoom'))
const SpectatorJoin = React.lazy(() => import('./pages/Spectator/SpectatorJoin'))

const InfoForm = React.lazy(() => import('./pages/User/InformationForm/InformationForm'))

const HostFinalScore = React.lazy(() => import('./pages/FinalScore/HostFinalScore'));
const PlayerFinalScore = React.lazy(() => import('./pages/FinalScore/PlayerFinalScore'));
const HostDashboard = React.lazy(() => import('./pages/Host/Dashboard/Dashboard'))
const UserDashboard = React.lazy(() => import('./pages/User/Dashboard/UserDashboard'))

const CreatePracticeRoom = React.lazy(() => import('./pages/Practice/CreatePracticeRoom'))
const PrivatePractice = React.lazy(() => import('./pages/Practice/PrivatePractice'))
function PlayComponent(roundMapping: any) {
  const [searchParams] = useSearchParams();

  console.log("roundMapping inside host component", roundMapping)
  const round = searchParams.get("round");
  // const currentRound = roundMapping && roundMapping[parseInt(round) - 1]
  //   ? roundMapping[parseInt(round) - 1]
  //   : round;

  // // Hoặc tốt hơn: hiển thị loading khi chưa có mapping (vì mapping rất quan trọng cho game)
  // if (roundMapping === undefined) {
  //   return <div>Loading round configuration...</div>; // hoặc spinner
  // }
  const roomMode = searchParams.get("roomMode") || "room";

  // MIGRATED: Using Redux-based components with new hooks
  if (round === "1") return <UserRound1 />;
  if (round === "2") return <UserRound2 />;
  if (round === "3") return <UserRound3 />;
  if (round === "4") return <UserRound4 />;
  if (round === "turn") return <UserRoundTurn />;
  if (round === "summary") return <SummaryAfterRound isHost={false} />;
  if (round === "final") return <FinalRanking isHost={false} />;
  if (roomMode === "multiplayer" || roomMode === "practice") return <HostMultipleChoice isHost={false} />;


  return <div className="text-center text-red-500">Round không hợp lệ!</div>;
}

function HostComponent(roundMapping: any) {
  const [searchParams] = useSearchParams();
  console.log("roundMapping inside host component", roundMapping)
  const round = searchParams.get("round");
  // const currentRound = roundMapping && roundMapping[parseInt(round) - 1]
  //   ? roundMapping[parseInt(round) - 1]
  //   : round;

  // // Hoặc tốt hơn: hiển thị loading khi chưa có mapping (vì mapping rất quan trọng cho game)
  // if (roundMapping === undefined) {
  //   return <div>Loading round configuration...</div>; // hoặc spinner
  // }
  const roomMode = searchParams.get("roomMode") || "room";
  console.log("room mode", roomMode);
  // console.log("mappedRound", currentRound)
  if (round === "1") return <HostRound1 />;
  if (round === "2") return <HostRound2 />;
  if (round === "3") return <HostRound3 />;
  if (round === "4") return <HostRound4 />;
  if (round === "turn") return <HostRoundTurn />;
  if (round === "summary") return <SummaryAfterRound isHost={true} />;
  if (round === "final") return <FinalRanking isHost={true} />;
  if (roomMode === "multiplayer") return <HostMultipleChoice isHost={true} />;

  return <div className="text-center text-red-500">Round không hợp lệ!</div>;
}

function SpectatorComponent() {
  const [searchParams] = useSearchParams();
  const round = searchParams.get("round") || "1";

  // MIGRATED: Using Redux-based components with spectator mode
  if (round === "1") return <UserRound1 isSpectator={true} />;
  if (round === "2") return <UserRound2 isSpectator={true} />;
  if (round === "3") return <UserRound3 isSpectator={true} />;
  if (round === "4") return <UserRound4 isSpectator={true} />;
  if (round === "summary") return <SummaryAfterRound isHost={false} isSpectator={true} />;
  if (round === "turn") return <UserRoundTurn isSpectator={true} />;
  if (round === "final") return <FinalRanking isHost={false} />;

  return <div className="text-center text-red-500">Round không hợp lệ!</div>;
}

function MCComponent() {
  const [searchParams] = useSearchParams();

  const round = searchParams.get("round");
  // const currentRound = roundMapping && roundMapping[parseInt(round) - 1]
  //   ? roundMapping[parseInt(round) - 1]
  //   : round;

  // // Hoặc tốt hơn: hiển thị loading khi chưa có mapping (vì mapping rất quan trọng cho game)
  // if (roundMapping === undefined) {
  //   return <div>Loading round configuration...</div>; // hoặc spinner
  // }
  const roomMode = searchParams.get("roomMode") || "room";
  console.log("room mode", roomMode);
  // console.log("mappedRound", currentRound)
  if (round === "1") return <UserRound1 isSpectator={true} isMC={true} />;
  if (round === "2") return <UserRound2 isSpectator={true} isMC={true}/>;
  if (round === "3") return <UserRound3 isSpectator={true} isMC={true}/>;
  if (round === "4") return <UserRound4 isSpectator={true} isMC={true}/>;
  if (round === "summary") return <SummaryAfterRound isHost={false} isSpectator={true} isMC={true}  />;
  if (round === "turn") return <UserRoundTurn isSpectator={true} isMC={true}/>;
  if (round === "final") return <FinalRanking isHost={false} />;

  return <div className="text-center text-red-500">Round không hợp lệ!</div>;
}

function App() {
  const [roundMapping, setRoundMapping] = useState<any>()
  const { listenToRoundMapping } = useFirebaseListener()

  useEffect(() => {
    const unsubscribe = listenToRoundMapping(
      (round_mapping) => {
        console.log("round_mapping", round_mapping)
        setRoundMapping(round_mapping)
      }
    )

    return () => {
      unsubscribe();
    };
  }, [])

  const pageVariants = {
    initial: { opacity: 0, x: 100 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -100 },
  };

  const pageTransition = {
    type: "tween" as const,
    ease: "easeInOut" as const,
    duration: 0.5,
  };

  const lobbyVariants = {
    initial: { x: 0, opacity: 1 },   // stays on screen
    exit: { x: "-100%", opacity: 0 }, // slide out on unmount
  };
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId") || ""
  const location = useLocation();

  return (
    <>

      <ReduxProvider>


        <ErrorBoundary fallback={<FallBack />}>
          <Suspense fallback={<FallBack />}>

            <AnimatePresence mode="wait">
              <Routes
                location={location}
                key={location.pathname}
              >
                {/* Public Routes */}
                <Route
                  path="*"
                  element={

                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/join" element={<JoinRoom />} />
                      <Route path="/spectatorJoin" element={<SpectatorJoin />} />
                      <Route path="/lobby" element={<Lobby isHost={false} />} />

                      <Route path="/play" element={
                        <TimeStartProvider roomId={roomId}>
                          <SoundProvider>
                            <ErrorBoundary onRetry={() => window.location.reload()}>
                              <PlayComponent roundMapping={roundMapping} />
                            </ErrorBoundary>
                          </SoundProvider>
                        </TimeStartProvider>
                      } />

                      <Route path="/login" element={<Login />} />
                      <Route path="/user/info" element={<InfoForm />} />
                      <Route path="/user/dashboard" element={<UserDashboard />} />
                    </Routes>


                  }
                />
                {/* Host Routes */}


                <Route
                  path="/host/*"
                  element={



                    <Routes

                    >
                      <Route
                        path="lobby"
                        element={
                          // <motion.div
                          //   variants={lobbyVariants}
                          //   initial="initial"
                          //   animate="initial"
                          //   exit="exit"
                          //   transition={{ type: "spring", stiffness: 120, damping: 20 }}
                          //   className="h-full w-full"
                          // >
                          // <HostLobby />
                          <Lobby isHost={true} />
                          // </motion.div>
                        }
                      />
                      <Route path="/login" element={<Login />} />
                      <Route path="dashboard" element={<ProtectedRoute element={<HostDashboard />} requireAccessToken={false} requireHost={true} />} />
                      <Route path="create_room" element={<ProtectedRoute element={<CreateRoom />} requireAccessToken={false} requireHost={true} />} />
                      <Route
                        path=""
                        element={
                          <TimeStartProvider roomId={roomId}>

                            <SoundProvider>

                              <ProtectedRoute
                                element={<HostComponent roundMapping={roundMapping} />}
                                requireAccessToken={true}
                              />
                            </SoundProvider>
                          </TimeStartProvider>
                        }
                      />

                    </Routes>
                  }
                />

                <Route
                  path="/admin/*"
                  element={
                    <Routes>
                      <Route path="dashboard" element={<ProtectedRoute element={<HostDashboard />} requireAccessToken={false} requireAdmin={true} />} />
                    </Routes>
                  }
                />

                <Route
                  path="/mc/*"
                  element={
                    <Routes>
                      <Route path="lobby" element={<ProtectedRoute element={<MCLobby />} requireMC={true}/>} />
                      <Route
                        path=""
                        element={
                          <TimeStartProvider roomId={roomId}>

                            <SoundProvider>
                              <MCComponent/>
                              {/* <ProtectedRoute
                                element={<HostComponent roundMapping={roundMapping} />}
                                requireAccessToken={true}
                              /> */}
                            </SoundProvider>
                          </TimeStartProvider>
                        }
                      />
                    </Routes>
                  }
                />

                <Route
                  path="/spectator/*"
                  element={
                    <TimeStartProvider roomId={roomId}>
                      <SoundProvider>

                        <Routes>
                          <Route path="" element={
                            <ErrorBoundary onRetry={() => window.location.reload()}>
                              <SpectatorComponent />
                            </ErrorBoundary>
                          } />
                        </Routes>

                      </SoundProvider>
                    </TimeStartProvider>
                  }
                />

                <Route
                  path="/practice/*"
                  element={
                    <TimeStartProvider roomId={roomId}>
                      <SoundProvider>

                        <Routes>
                          <Route path="create" element={
                            <ErrorBoundary onRetry={() => window.location.reload()}>
                              <CreatePracticeRoom />
                            </ErrorBoundary>
                          } />

                          <Route path="private" element={
                            <ErrorBoundary onRetry={() => window.location.reload()}>
                              <PrivatePractice />
                            </ErrorBoundary>
                          } />
                        </Routes>

                      </SoundProvider>
                    </TimeStartProvider>
                  }
                />


              </Routes>

            </AnimatePresence>


            <ToastContainer />
          </Suspense>
        </ErrorBoundary>
      </ReduxProvider>
    </>
  );
}

export default App;
