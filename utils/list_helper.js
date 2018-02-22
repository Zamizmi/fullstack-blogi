const dummy = (array) => {
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, item) => {
    return sum + item.likes
  }
  return blogs.length === 0 ? 0 : blogs.reduce(reducer, 0)
}

//returns the value
const maxLikes = (blogs) => {
  const reducer = (max, b) => {
    return blogs.reduce((max, b) => b.likes > max ? b.likes : max, blogs[0].likes)
  }
  return blogs.length === 0 ? 0 : blogs.reduce(reducer, 0)
}

//returns a blog
const favoriteBlog = (blogs) => {
  const reducer = (max, b) => {
    return blogs.reduce((max, b) => b.likes > max ? b : max, blogs[0].likes)
  }
  return blogs.length === 0 ? 0 : blogs.reduce(reducer)
}

//returns {author:string blogs:number}
const mostBlogs = (blogs) => {
  const authorsAndTheirBlogs = []
  blogs.forEach( blog => {
      let author = authorsAndTheirBlogs.find(authorAndBlogs => authorAndBlogs.author === blog.author)
      if(author=== undefined) {
        authorsAndTheirBlogs.push( {author: blog.author, blogs: 1})
      } else {
        author.blogs++
      }
    })

    let busiestAuthor = authorsAndTheirBlogs[0]
    authorsAndTheirBlogs.forEach(author => {
      if(author.blogs>busiestAuthor.blogs) {
        busiestAuthor= author
      }
    })

  return busiestAuthor
}

//returns {author:string likes:number}
const mostLikes = (blogs) => {
  const authorsAndTheirBlogs = []
  blogs.forEach( blog => {
      let author = authorsAndTheirBlogs.find(authorAndBlogs => authorAndBlogs.author === blog.author)
      if(author=== undefined) {
        authorsAndTheirBlogs.push( {author: blog.author, likes: blog.likes})
      } else {
        author.likes += blog.likes
      }
    })

    let bestAuthor = authorsAndTheirBlogs[0]
    authorsAndTheirBlogs.forEach(author => {
      if(author.likes>bestAuthor.likes) {
        bestAuthor= author
      }
    })

  return bestAuthor
}

module.exports = {
  dummy,
  totalLikes,
  maxLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}
