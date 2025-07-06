const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')
const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')
const _ = require('lodash')

const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

const resolvers = {

  Query: {
    me: (root, args, context) => {
      console.log(context.currentUser);
      return context.currentUser
    },
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      const filter = {}

      // 如果传了 author 参数，就先找到对应的 Author._id
      if (args.author) {
        const authorObj = await Author.findOne({ name: args.author })
        if (!authorObj) return []  // 作者不存在，直接返回空数组
        filter.author = authorObj._id
      }

      // 如果传了 genre 参数，就按 genre 过滤
      if (args.genre) {
        filter.genres = { $in: args.genre }
      }

      // 1. 查出所有符合 filter 的书，并 populate 作者
      const books = await Book.find(filter).populate('author')

      // 2. 统计每个作者的书籍数量
      //    这里直接在内存中统计，也可以用 aggregate，更高效：
      const countMap = {}
      books.forEach(b => {
        const id = b.author._id.toString()
        countMap[id] = (countMap[id] || 0) + 1
      })

      // 3. 把 bookCount 注入到每本书的 author 对象里
      return books.map(b => {
        // b.toObject() 可以把 mongoose document 转成普通 JS 对象
        const bookObj = b.toObject()
        bookObj.author.bookCount = countMap[b.author._id.toString()] || 0
        return bookObj
      })
    },
    allAuthors: async () => {
      const authors = await Author.find({})
      const books = await Book.find({}).populate('author')

      return authors.map(author => {
        const bookCount = _.countBy(books, (value) => {
          if (value.author.name === author.name)
            return author.name
          return 'other'
        })
        return {
          name: author.name,
          born: author.born,
          bookCount: bookCount[author.name]
        }
      })
    }
  },
  Mutation: {
    createUser: async (root, args) => {
      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre
      })

      try {
        return await user.save()
      } catch (error) {
        throw new GraphQLError('Creating new user failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.username,
            error
          }
        })
      }
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      if (!user || args.password !== 'secret') {
        throw new GraphQLError('wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT',
          }
        })
      }

      const userForToken = {
        username: user.username,
        id: user._id
      }

      return {
        value: jwt.sign(
          userForToken,
          process.env.JWT_SECRET,
          { expiresIn: 60 * 60 }
        )
      }
    },

    addBook: async (root, args, context) => {
      const currentUser = context.currentUser

      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })
      }

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
        const bookAdded = await newBook.populate('author')
        console.log(bookAdded)
        // 注册并保存所有执行subscription的clients  

        // 给所有subscriber客户端发送notification
        pubsub.publish('BOOK_ADDED', { bookAdded: bookAdded })
        /* 
          The iterator name is an arbitrary string, but to follow the convention, 
          it is the subscription name written in capital letters. 
          e.g 'BOOK_ADDED'
        */

        return bookAdded
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

    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser

      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })
      }

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
  },
  Subscription: {
    bookAdded: {
      // The clients are saved to an "iterator object" called BOOK_ADDED 
      // thanks to the following code
      subscribe: () => pubsub.asyncIterableIterator('BOOK_ADDED')
    }
  }

}

module.exports = resolvers