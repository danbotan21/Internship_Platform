import AuthModal from './components/AuthModal'
import { useAuth } from './hooks/authContext'
import AppRoutes from './routes/AppRoutes'


function App() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <AuthModal />
  }

  return <AppRoutes />
}

export default App

