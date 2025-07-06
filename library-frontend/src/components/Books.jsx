import { useQuery, useSubscription } from '@apollo/client'
import { ALL_BOOKS, BOOK_ADDED } from '../queries'
import { useState } from 'react'

const Books = (props) => {

  const [filter, setFilter] = useState('')

  const result = useQuery(ALL_BOOKS, {
    variables: filter ? { genre: [filter] } : {}
  })

  // 设置subscribe
  useSubscription(BOOK_ADDED, {
    onData: ({ data, client }) => {
      const addedBook = data.data.bookAdded
      alert(`A new book ${addedBook.title} is added!`)
      // 更新cache
      client.cache.updateQuery({ query: ALL_BOOKS }, ({ allBooks }) => {
        return {
          allBooks: allBooks.concat(addedBook),
        }
      })
    }
  })

  if (result.loading || !result.data) {
    return <div>loading...</div>
  }

  console.log(result.data.allBooks);

  const books = result.data.allBooks

  const booksToDisplay = filter
    ? result.data.allBooks.filter(book => {
      if (book.genres.includes(filter)) {
        return true
      }
      return false
    })
    : books

  console.log(booksToDisplay);

  const genreList = []

  books.forEach(book => {
    book.genres.forEach(genre => {
      if (!genreList.includes(genre)) {
        genreList.push(genre)
      }
    })
  })

  return (
    <div>
      <h2>books</h2>
      {filter ? <div>in genre <em>{filter}</em></div> : <></>}
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <br />
      <div>
        {
          filter 
            ? (<button onClick={() => setFilter('')}>clear genre</button>) 
            : (
              genreList.map(genre => {
                return (
                  <button
                    key={genre}
                    onClick={({ target }) => setFilter(target.textContent)}
                  >
                    {genre}
                  </button>
                )
              })
            )
        }

      </div>

    </div>
  )
}

export default Books
