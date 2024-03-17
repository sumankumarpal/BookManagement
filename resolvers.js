let books = [];
let users = [];

const resolvers = {
  Query: {
    books: () => books,
    book: (parent, { id }) => books.find(book => book.id === id),
    users: () => users,
    user: (parent, { id }) => users.find(user => user.id === id)
  },
  Mutation: {
    addBook: (parent, { title, author, genre, description }) => {
      const book = { id: String(books.length + 1), title, author, genre, description };
      books.push(book);
      return book;
    }
  }
};

module.exports = resolvers;