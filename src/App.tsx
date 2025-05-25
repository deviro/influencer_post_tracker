import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { CampaignsPage } from './pages/CampaignsPage'
import { Toaster } from '@/components/ui/toaster'
import { ErrorBoundary } from './components/ErrorBoundary'

function App() {
  const basename = import.meta.env.PROD ? '/influencer_post_tracker' : '' 
  
  return (
    <ErrorBoundary>
      <Router basename={basename}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
        </Routes>
        <Toaster />
      </Router>
    </ErrorBoundary>
  )
}

export default App
