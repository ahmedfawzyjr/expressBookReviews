const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


const axios = require('axios');

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) { 
      users.push({"username": username, "password": password});
      return res.status(200).json({message: "User successfully registered. Now you can login"});
    } else {
      return res.status(400).json({message: "User already exists!"});    
    }
  } 
  return res.status(400).json({message: "Unable to register user (missing username/password)."});
});

// Get the book list available in the shop using Promises (Task 10)
public_users.get('/', function (req, res) {
  const get_books = new Promise((resolve, reject) => {
    resolve(books);
  });
  get_books.then((bks) => {
    res.status(200).send(JSON.stringify(bks, null, 4));
  });
});

// Get book details based on ISBN using Promises (Task 11)
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const get_book = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject({status: 404, message: "Book not found"});
    }
  });

  get_book
    .then((book) => {
      res.status(200).send(JSON.stringify(book, null, 4));
    })
    .catch((err) => {
      res.status(err.status || 500).json({message: err.message});
    });
});
  
// Get book details based on author using async/await (Task 12)
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  try {
    const get_books_by_author = new Promise((resolve, reject) => {
      let filtered_books = {};
      for (let key in books) {
        if (books[key].author === author) {
          filtered_books[key] = books[key];
        }
      }
      resolve(filtered_books);
    });
    let result = await get_books_by_author;
    res.status(200).send(JSON.stringify(result, null, 4));
  } catch (err) {
    res.status(500).json({message: err.message});
  }
});

// Get all books based on title using async/await (Task 13)
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  try {
    const get_books_by_title = new Promise((resolve, reject) => {
      let filtered_books = {};
      for (let key in books) {
        if (books[key].title === title) {
          filtered_books[key] = books[key];
        }
      }
      resolve(filtered_books);
    });
    let result = await get_books_by_title;
    res.status(200).send(JSON.stringify(result, null, 4));
  } catch (err) {
    res.status(500).json({message: err.message});
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const get_review = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn].reviews);
    } else {
      reject({status: 404, message: "Book not found"});
    }
  });

  get_review
    .then((reviews) => {
      res.status(200).send(JSON.stringify(reviews, null, 4));
    })
    .catch((err) => {
      res.status(err.status || 500).json({message: err.message});
    });
});

// Helper functions using Axios (Tasks 10 - 13) to fetch from local server
const getBooksWithAxios = async () => {
    try {
        const response = await axios.get('http://localhost:5000/');
        return response.data;
    } catch (error) {
        console.error("Error fetching books with axios:", error.message);
    }
};

const getBookByISBNWithAxios = (isbn) => {
    return axios.get(`http://localhost:5000/isbn/${isbn}`)
        .then(response => response.data)
        .catch(error => console.error(`Error fetching book ISBN ${isbn} with axios:`, error.message));
};

const getBookByAuthorWithAxios = async (author) => {
    try {
        const response = await axios.get(`http://localhost:5000/author/${author}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching book author ${author} with axios:`, error.message);
    }
};

const getBookByTitleWithAxios = async (title) => {
    try {
        const response = await axios.get(`http://localhost:5000/title/${title}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching book title ${title} with axios:`, error.message);
    }
};

module.exports.general = public_users;
module.exports.getBooksWithAxios = getBooksWithAxios;
module.exports.getBookByISBNWithAxios = getBookByISBNWithAxios;
module.exports.getBookByAuthorWithAxios = getBookByAuthorWithAxios;
module.exports.getBookByTitleWithAxios = getBookByTitleWithAxios;
