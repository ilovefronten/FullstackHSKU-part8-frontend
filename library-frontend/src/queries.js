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
  query allBooks(
    $genre: [String]
  ) {
    allBooks (genre: $genre) {
      author {
        name
        born
        bookCount
      }
      published
      title
      genres
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
      author {
        name
      }
      title
      published
      genres
    }
  }
`

export const EDIT_BIRTH_YEAR = gql`
  mutation EditAuthor($name: String!, $setBornTo: Int!) {
    editAuthor(name: $name, setBornTo: $setBornTo) {
      born
      name
    }
  }
`

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`

export const ME = gql`
query Me {
  me {
    username
    id
    favoriteGenre
  }
}
`

export const BOOK_ADDED = gql`
  subscription {    
    bookAdded {      
      author {
        name
      }
      title
      published
      genres
    }  
  }  
`