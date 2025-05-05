const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const _ = require('lodash')
const { v1: uuid } = require('uuid')
const { GraphQLError } = require('graphql')

const mongoose = require('mongoose')
mongoose.set('strictQuery', false)

const Book = require('./models/book')
const Author = require('./models/author')

require('dotenv').config()

const MONGODB_URI = process.env.MONGODB_URI

let authors = [
  {
    name: 'Robert Martin',
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: 'Martin Fowler',
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963
  },
  {
    name: 'Fyodor Dostoevsky',
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821
  },
  {
    name: 'Joshua Kerievsky', // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  {
    name: 'Sandi Metz', // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
]

/*
 * Suomi:
 * Saattaisi olla järkevämpää assosioida kirja ja sen tekijä tallettamalla kirjan yhteyteen tekijän nimen sijaan tekijän id
 * Yksinkertaisuuden vuoksi tallennamme kuitenkin kirjan yhteyteen tekijän nimen
 *
 * English:
 * It might make more sense to associate a book with its author by storing the author's id in the context of the book instead of the author's name
 * However, for simplicity, we will store the author's name in connection with the book
 *
 * Spanish:
 * Podría tener más sentido asociar un libro con su autor almacenando la id del autor en el contexto del libro en lugar del nombre del autor
 * Sin embargo, por simplicidad, almacenaremos el nombre del autor en conexión con el libro
*/

let books = [
  {
    title: 'Clean Code',
    published: 2008,
    author: 'Robert Martin',
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Agile software development',
    published: 2002,
    author: 'Robert Martin',
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ['agile', 'patterns', 'design']
  },
  {
    title: 'Refactoring, edition 2',
    published: 2018,
    author: 'Martin Fowler',
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Refactoring to patterns',
    published: 2008,
    author: 'Joshua Kerievsky',
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'patterns']
  },
  {
    title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
    published: 2012,
    author: 'Sandi Metz',
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'design']
  },
  {
    title: 'Crime and punishment',
    published: 1866,
    author: 'Fyodor Dostoevsky',
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'crime']
  },
  {
    title: 'Demons',
    published: 1872,
    author: 'Fyodor Dostoevsky',
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'revolution']
  },
]

const seedDatabase = async () => {
  try {
    await Author.deleteMany({})
    await Book.deleteMany({})
    console.log('Database cleared.')

    // 保存所有作者
    for (const author of authors) {
      const { name, born } = author
      const authorToSave = new Author({ name, born })
      await authorToSave.save()
      console.log('Saved author:', author.name)
    }

    // 保存所有书籍
    for (const book of books) {
      const { title, published, author, genres } = book
      const authorObj = await Author.findOne({ name: author })

      if (!authorObj) {
        console.warn(`Author ${author} not found for book "${title}"`)
        continue
      }

      const bookToSave = new Book({
        title,
        published,
        author: authorObj._id, // 注意：引用 _id
        genres
      })

      const savedBook = await bookToSave.save()
      console.log('Saved book:', savedBook.title)
    }

    console.log('Seeding complete.')
  } catch (err) {
    console.error('Seeding error:', err)
    mongoose.connection.close()
  }
}

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
    seedDatabase()  // 初始化数据库
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

/*
  you can remove the placeholder query once your first one has been implemented 
*/

const typeDefs = `
  type Book {
    title: String!
    author: Author!
    published: Int
    genres: [String!]
  }

  type Author {
    name: String!
    born: Int
    bookCount: Int!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]
    ) : Book
    editAuthor(
      name: String!, 
      setBornTo: Int!
    ) : Author
  }
`

const resolvers = {

  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      const filter = {}

      // 先查作者的 _id
      if (args.author) {
        const authorObj = await Author.findOne({ name: args.author })
        if (!authorObj) return [] // 作者不存在，直接返回空数组
        filter.author = authorObj._id
      }

      if (args.genre) {
        filter.genres = args.genre // 匹配 genres 数组中含此 genre 的书
      }

      return Book.find(filter).populate('author') // populate 作者数据
    },
    allAuthors: async () => {
      return Author.find({})
    }
  },
  Mutation: {
    addBook: async (root, args) => {
      let authorDoc = null

      // 查找或创建作者
      if (args.author) {
        authorDoc = await Author.findOne({ name: args.author })
        if (!authorDoc) {
          try {
            authorDoc = await new Author({ name: args.author }).save()
          } catch (error) {
            console.error('Failed to save new author:', error)
            throw new GraphQLError('Author saving failed', {
              extensions: {
                code: 'BAD_USER_INPUT',
                invalidArgs: args.author,
                error
              }
            })
          }
        }
      }

      // 创建书籍，注意 author 是引用 authorDoc 的 _id
      const newBook = new Book({
        title: args.title,
        published: args.published,
        genres: args.genres,
        author: authorDoc ? authorDoc._id : undefined
      })

      try {
        await newBook.save()
        // populate 让 GraphQL 能正确解析 author 字段
        return await newBook.populate('author')
      } catch (error) {
        throw new GraphQLError('Saving book failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.title,
            error
          }
        })
      }
    },

    editAuthor: async (root, args) => {
      console.log(args);

      const author = await Author.findOne({ name: args.name })
      if (!author) {
        return null
      }
      author.born = args.setBornTo
      try {
        return await author.save()
      } catch (error) {
        throw new GraphQLError('Saving book failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error
          }
        })
      }
    }
  }

}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
