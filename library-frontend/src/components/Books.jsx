import { useQuery } from '@apollo/client'
import { ALL_BOOKS } from '../queries'
import { useState } from 'react'

const Books = (props) => {

  const [filter, setFilter] = useState('')

  const result = useQuery(ALL_BOOKS)

  if (result.loading) {
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
          {booksToDisplay.map((a) => (
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
        <button onClick={() => setFilter('')}>clear genre</button>
        {genreList.map(genre => {
          return (
            <button
              key={genre}
              onClick={({ target }) => setFilter(target.textContent)}
            >
              {genre}
            </button>
          )
        })}

      </div>

    </div>
  )
}

export default Books
