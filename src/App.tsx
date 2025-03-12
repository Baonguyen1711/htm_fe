import './App.css';
import { Routes, Route, useLocation, useSearchParams } from "react-router-dom";
import Home from './pages/Home/Home';
import Round1 from './pages/User/Round1';
import Round2 from './pages/User/Round2/Round2';
import Round3 from './pages/User/Round3/Round3';
import Round4 from './pages/User/Round4/Round4';

function PlayComponent() {
  const [searchParams] = useSearchParams();
  const round = searchParams.get("round") || "1"; 

  if (round === "1") return <Round1 />;
  if (round === "2") return <Round2 />;
  if (round === "3") return <Round3 />;
  if (round === "4") return <Round4 />;
  
  return <div className="text-center text-red-500">Round không hợp lệ!</div>;
}

function App() {
  const [searchParams] = useSearchParams();
  const roundName = `Round${searchParams.get("round") || "1"}`
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/play" element={<PlayComponent />} />
      </Routes>
    </>
  );
}

export default App;
