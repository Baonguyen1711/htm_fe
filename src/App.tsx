import './App.css';
import React, { Suspense, useEffect, useRef } from 'react';
import { Routes, Route, useLocation, useSearchParams } from "react-router-dom";
import CreateRoom from './pages/Host/Room/CreateRoom';
import LoadingSpinner from './layouts/Loading/LoadingSpinner';
import { AxiosAuthProvider } from './context/authContext';
import { PlayerProvider } from './context/playerContext';
import { HostProvider } from './context/hostContext';
import { QueryClient, QueryClientProvider } from 'react-query';
import { TimeStartProvider } from './context/timeListenerContext';
import { SoundProvider } from './context/soundContext';



const queryClient = new QueryClient();

const Home = React.lazy(() => import('./pages/Home/Home'));

const UserRound1 = React.lazy(() => import('./pages/User/UserRound1'))
const UserRound2 = React.lazy(() => import('./pages/User/Round2/UserRound2'));
const UserRound3 = React.lazy(() => import('./pages/User/Round3/UserRound3'));
const UserRound4 = React.lazy(() => import('./pages/User/Round4/UserRound4'));

const HostRound1 = React.lazy(() => import('./pages/Host/Management/HostRound1'));
const HostRound2 = React.lazy(() => import('./pages/Host/Management/HostRound2'));
const HostRound3 = React.lazy(() => import('./pages/Host/Management/HostRound3'));
const HostRound4 = React.lazy(() => import('./pages/Host/Management/HostRound4'));

const Login = React.lazy(() => import('./pages/Login/Login'))
const JoinRoom = React.lazy(() => import('./pages/JoinRoom/JoinRoom'))
const SpectatorJoin = React.lazy(() => import('./pages/Spectator/SpectatorJoin'))
const InfoForm = React.lazy(() => import('./pages/User/InformationForm/InformationForm'))

const Dashboard = React.lazy(() => import('./pages/Host/Test/Dashboard'))

function PlayComponent() {
  const [searchParams] = useSearchParams();

  const round = searchParams.get("round") || "1";

  if (round === "1") return <UserRound1 />;
  if (round === "2") return <UserRound2 />;
  if (round === "3") return <UserRound3 />;
  if (round === "4") return <UserRound4 />;

  return <div className="text-center text-red-500">Round không hợp lệ!</div>;
}

function HostComponent() {
  const [searchParams] = useSearchParams();
  const round = searchParams.get("round") || "1";

  if (round === "1") return <HostRound1 />;
  if (round === "2") return <HostRound2 />;
  if (round === "3") return <HostRound3 />;
  if (round === "4") return <HostRound4 />;

  return <div className="text-center text-red-500">Round không hợp lệ!</div>;
}

function SpectatorComponent() {
  const [searchParams] = useSearchParams();
  const round = searchParams.get("round") || "1";

  if (round === "1") return <UserRound1 isSpectator={true} />;
  if (round === "2") return <UserRound2 isSpectator={true} />;
  if (round === "3") return <UserRound3 isSpectator={true} />;
  if (round === "4") return <UserRound4 isSpectator={true} />;

  return <div className="text-center text-red-500">Round không hợp lệ!</div>;
}

function App() {
  const [searchParams] = useSearchParams();
  const roundName = `Round${searchParams.get("round") || "1"}`
  const roomId = searchParams.get("roomId") || ""
  return (
    <>

      <Suspense fallback={<LoadingSpinner />}>
        <QueryClientProvider client={queryClient}>
          <TimeStartProvider roomId={roomId}>
            <SoundProvider>
              <HostProvider>


                <PlayerProvider>
                  <Routes>
                    {/* Public Routes */}
                    <Route
                      path="*"
                      element={

                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/join" element={<JoinRoom />} />
                          <Route path="/spectatorJoin" element={<SpectatorJoin />} />
                          <Route path="/play" element={<PlayComponent />} />
                          <Route path="/login" element={<Login />} />
                          <Route path="/user/info" element={<InfoForm />} />
                        </Routes>


                      }
                    />
                    {/* Host Routes */}
                    <Route
                      path="/host/*"
                      element={
                        <HostProvider>
                          <AxiosAuthProvider>
                            <Routes>
                              <Route path="/login" element={<Login />} />
                              <Route path="dashboard" element={<Dashboard />} />
                              <Route path="create_room" element={<CreateRoom />} />
                              <Route path="" element={<HostComponent />} />
                            </Routes>
                          </AxiosAuthProvider>
                        </HostProvider>

                      }
                    />

                    <Route
                      path="/spectator/*"
                      element={
                        <HostProvider>
                          <AxiosAuthProvider>
                            <Routes>
                              <Route path="" element={<SpectatorComponent />} />
                            </Routes>
                          </AxiosAuthProvider>
                        </HostProvider>

                      }
                    />
                  </Routes>
                </PlayerProvider>
              </HostProvider>

            </SoundProvider>

          </TimeStartProvider>


        </QueryClientProvider>
      </Suspense>
    </>
  );
}

export default App;
