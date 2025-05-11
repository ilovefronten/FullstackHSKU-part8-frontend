import { useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import {
  BrowserRouter as Router, Routes, Route, Link, useNavigate
} from 'react-router-dom'
import LoginForm from './components/LoginForm';
import { useApolloClient } from '@apollo/client';

const App = () => {

  const [token, setToken] = useState('')
  const navigate = useNavigate()

  const client = useApolloClient()

  const padding = {
    padding: 5
  }


  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
    navigate('/login')
  }

  return (
    <>
      <div>
        <button><Link style={padding} to="/">authors</Link></button>
        <button><Link style={padding} to="/books">books</Link></button>
        {
          token
            ? (
              <>
                <button><Link style={padding} to="/add">add book</Link></button>
                <button onClick={logout}>log out</button>
              </>
            )
            : (
              <>
                <button><Link style={padding} to="/login">login</Link></button>
              </>
            )
        }

      </div>
      <Routes>
        <Route path='/' element={<Authors />}></Route>
        <Route path='/books' element={<Books />}></Route>
        <Route path='/add' element={<NewBook />}></Route>
        <Route path='/login' element={<LoginForm setToken={setToken} navigate={navigate} />}></Route>
      </Routes>
    </>
  );
};

export default App;
