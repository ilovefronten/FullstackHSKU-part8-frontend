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
  query AllBooks {
    allBooks {
      author
      published
      title
    }
  }
`