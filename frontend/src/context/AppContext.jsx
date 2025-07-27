import {createContext} from 'react'

export const AppContent = createContext()

export const AppContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [userData, setUserData] = useState(null)
    // const [isLoading, setIsLoading] = useState(false)

    const value = {
        backendUrl,
        isLoggedIn,
        setIsLoggedIn,
        userData,
        setUserData,
    }

  return (
    <AppContent.Provider value={value}>
      {props.children}
    </AppContent.Provider>
  )
}