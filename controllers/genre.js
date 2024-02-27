const Genre = require("../models/genre");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// List all genres
exports.list = asyncHandler(async (req, res, next) => {
  const list = await Genre.find({}).sort({ name: 1 }).exec();
  res.render("genre_list", { title: "Genre List", list });
});

// Find specific genre
exports.find = asyncHandler(async (req, res, next) => {
  const [genre, genre_books] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({ genre: req.params.id }, "title summary").exec(),
  ]);
  if (!genre) {
    const err = new Error("Genre not found!");
    err.status = 404;
    return next(err);
  }
  res.render("genre_details", {
    title: "Genre Details",
    genre,
    genre_books,
    hasDependentsErr: req.flash("hasDependentsErr")[0],
  });
});

// Show CUD forms
exports.showAddForm = asyncHandler(async (req, res, next) => {
  res.render("genre_form_add", { title: "Add a genre entry" });
});
exports.showDelForm = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Genre update DEL");
});
exports.showUpdForm = asyncHandler(async (req, res, next) => {
  const genre = await Genre.findById(req.params.id);
  res.render("genre_form_add", { title: "Edit genre entry", genre });
});

// Do CUD operations
exports.add = [
  body("name", "Genre name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const newGenre = Genre(req.body);
    if (errors.isEmpty()) {
      const existingEntry = await Genre.findOne({ name: req.body.name });
      if (existingEntry) {
        res.redirect(existingEntry.url);
      } else {
        newGenre.save();
        res.redirect(newGenre.url);
      }
    } else {
      res.render("genre_form_add", {
        title: "Add a genre entry",
        genre: newGenre,
        errors: errors.array(),
      });
    }
  }),
];
exports.delete = asyncHandler(async (req, res, next) => {
  const BooksInGenre = await Book.find({ genre: req.params.id });
  if (BooksInGenre.length === 0) {
    req.flash("hasDependentsErr", false);
    await Genre.findByIdAndDelete(req.params.id);
    res.redirect("/catalog/genre/all");
  } else {
    req.flash("hasDependentsErr", true);
    res.redirect("/catalog/genre/" + req.params.id);
  }
});
exports.update = [
  body("name", "Genre name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const newGenre = new Genre({ ...req.body, _id: req.params.id });
    if (errors.isEmpty()) {
      const existingEntry = await Genre.findOne({ name: req.body.name });
      if (existingEntry) {
        res.redirect(existingEntry.url);
      } else {
        await Genre.findByIdAndUpdate(req.params.id, newGenre, {});
        res.redirect(newGenre.url);
      }
    } else {
      res.render("genre_form_add", {
        title: "Edit genre entry",
        genre: newGenre,
        errors: errors.array(),
      });
    }
  }),
];
