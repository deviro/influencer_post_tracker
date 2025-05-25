import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { CampaignsPage } from './pages/CampaignsPage'

function App() {
  const basename = import.meta.env.PROD ? '/influencer_post_tracker' : ''
  
  return (
    <Router basename={basename}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/campaigns" element={<CampaignsPage />} />
      </Routes>
    </Router>
  )
}

export default App
