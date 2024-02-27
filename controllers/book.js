const { body, validationResult } = require("express-validator");
const Book = require("../models/book");
const Author = require("../models/author");
const Genre = require("../models/genre");
const BookCopy = require("../models/book_copy");
const asyncHandler = require("express-async-handler");
const debug = require("debug")("book");

// List all books
exports.list = asyncHandler(async (req, res, next) => {
  const list = await Book.find({}, "title author")
    .populate("author")
    .sort({ title: 1 })
    .exec();
  debug("at book.js when listing");
  res.render("book_list", {
    title: "Book List",
    book_list: list,
  });
});

// Find specific book
exports.find = asyncHandler(async (req, res, next) => {
  const [book, bookCopies] = await Promise.all([
    Book.findById(req.params.id).populate("author genre").exec(),
    BookCopy.find({ book: req.params.id }).exec(),
  ]);
  if (!book) {
    const err = new Error("Book not found!");
    err.status(404);
    return next(err);
  }
  res.render("book_details", {
    title: "Book Details",
    book,
    bookCopies,
    hasDependentsErr: req.flash("hasDependentsErr")[0],
  });
});

// Show CUD forms
exports.showAddForm = asyncHandler(async (req, res, next) => {
  const [authors, genres] = await Promise.all([
    Author.find({}),
    Genre.find({}).sort({ name: 1 }),
  ]);

  const sortedAuthors = authors.sort((a, b) =>
    a.family_name.localeCompare(b.family_name, undefined, {
      sensitivity: "base",
    })
  );
  res.render("book_form_add", {
    title: "Add book entry",
    authors: sortedAuthors,
    genres,
  });
});

exports.showDelForm = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Book delete GET");
});

exports.showUpdForm = asyncHandler(async (req, res, next) => {
  const [book, authors, genres] = await Promise.all([
    Book.findById(req.params.id).exec(),
    Author.find({}).exec(),
    Genre.find({}).exec(),
  ]);

  genres.forEach((genre) => {
    if (book.genre.includes(genre._id)) genre.checked = true;
  });

  res.render("book_form_add", { title: "Update Book", book, authors, genres });
});

// Do CUD operations
exports.add = [
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),
  body("genre.*").escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const newBook = Book(req.body);
    if (errors.isEmpty()) {
      await newBook.save();
      res.redirect(newBook.url);
    } else {
      let [authors, genres] = await Promise.all([
        Author.find(),
        Genre.find().sort({ name: 1 }).exec(),
      ]);

      authors = authors.sort((a, b) =>
        a.family_name.localeCompare(b.family_name, undefined, {
          sensitivity: "base",
        })
      );

      genres.forEach((genre) => {
        if (newBook.genre.some((item) => item._id === genre._id)) {
          genre.checked = true;
        }
      });

      res.render("book_form_add", {
        title: "Add book entry",
        book: newBook,
        authors,
        genres,
        errors,
      });
    }
  }),
];
exports.delete = asyncHandler(async (req, res, next) => {
  const copies = await BookCopy.find({ book: req.params.id });
  if (copies.length === 0) {
    await Book.findByIdAndDelete(req.params.id);
    req.flash("hasDependentsErr", false);
    res.redirect("/catalog/book/all");
  } else {
    req.flash("hasDependentsErr", true);
    res.redirect("/catalog/book/" + req.params.id);
  }
});

exports.update = [
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),
  body("genre.*").escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const newBook = new Book({ ...req.body, _id: req.params.id });
    debug(req.body);
    if (errors.isEmpty()) {
      await Book.findByIdAndUpdate(req.params.id, newBook, {});
      res.redirect("/catalog/book/all");
    } else {
      const [book, authors, genres] = await Promise.all([
        Book.findById(req.params.id).exec(),
        Author.find({}).exec(),
        Genre.find({}).exec(),
      ]);

      genres.forEach((genre) => {
        if (book.genre.includes(genre._id)) genre.checked = true;
      });

      res.render("book_form_add", {
        title: "Update Book",
        book,
        authors,
        genres,
        errors: errors.array(),
      });
    }
  }),
];
