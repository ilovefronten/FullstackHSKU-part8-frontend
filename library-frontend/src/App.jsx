import { useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import Recommendation from "./components/Recommendation"
import {
  BrowserRouter as Router, Routes, Route, Link, useNavigate
} from 'react-router-dom'
import LoginForm from './components/LoginForm';
import { useApolloClient } from '@apollo/client';
import { useSubscription } from '@apollo/client'
import { BOOK_ADDED } from './queries'

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

  // 设置subscribe
  useSubscription(BOOK_ADDED, {
    onData: ({ data, client }) => {
      const addedBook = data.data.bookAdded
      alert(`A new book ${addedBook.title} is added!`)
    }
  })

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
                <button><Link style={padding} to={"/recommend"}>recommend</Link></button>
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
        <Route path='/recommend' element={<Recommendation />}></Route>
        <Route path='/login' element={<LoginForm setToken={setToken} navigate={navigate} />}></Route>
      </Routes>
    </>
  );
};

export default App;
