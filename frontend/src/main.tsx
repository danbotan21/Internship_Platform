import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { UserRoleProvider } from './context/UserRoleContext.tsx'
import { AuthProvider } from './hooks/useAuth'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <UserRoleProvider>
          <App />
        </UserRoleProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
