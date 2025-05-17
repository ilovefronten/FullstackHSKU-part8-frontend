import { useQuery } from '@apollo/client'
import { ALL_BOOKS, ME } from '../queries'

const Recommendation = () => {
  const userResult = useQuery(ME)
  const bookResult = useQuery(ALL_BOOKS)

  if (userResult.loading || bookResult.loading) {
    return <div>loading...</div>
  }

  const userInfo = userResult.data.me
  const books = bookResult.data.allBooks

  const booksOfFavorite = books.filter(book => 
    book.genres.includes(userInfo.favoriteGenre)
      ? true
      : false      
  )

  console.log(booksOfFavorite);

  return (
    <>
      <h2>Recommendations</h2>
      <div>books in your favorite genre <em>{userInfo.favoriteGenre}</em></div>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {booksOfFavorite.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )

}

export default Recommendation
