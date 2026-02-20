import { BrowserRouter, Routes, Route, Link } from "react-router-dom"
import NetworkGraph from "./pages/NetworkGraph"
import Home from "./pages/Home"

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/network-graph" element={<NetworkGraph />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
