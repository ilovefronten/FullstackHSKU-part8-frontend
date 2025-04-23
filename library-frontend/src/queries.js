import { gql } from '@apollo/client'

export const ALL_AUTHORS = gql`
  query {
    allAuthors {
      bookCount
      born
      name
    }
  }
`
export const ALL_BOOKS = gql`
  query allBooks {
    allBooks {
      author
      published
      title
    }
  }
`

export const ADD_BOOK = gql`
  mutation addBook(
    $title: String!, 
    $author: String!, 
    $published: Int!, 
    $genres: [String!]
  ) {
    addBook(title: $title, author: $author, published: $published, genres: $genres) {
      author
      title
      published
      genres
    }
  }
`