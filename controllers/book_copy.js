const BookCopy = require("../models/book_copy");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const debug = require("debug")("book_copy");

// List all book copies
exports.list = asyncHandler(async (req, res, next) => {
  const list = await BookCopy.find({}).populate("book").exec();
  debug("at book.js when listing");
  res.render("book_copy_list", { bookCopyList: list });
});

// Find specific book copy
exports.find = asyncHandler(async (req, res, next) => {
  const copy = await BookCopy.findById(req.params.id).populate("book").exec();
  if (!copy) {
    const error = new Error("Copy not found!");
    return next(error);
  }
  res.render("book_copy_details", { title: "Book Copy Details", copy });
});

// Show CUD forms
exports.showAddForm = asyncHandler(async (req, res, next) => {
  const books = await Book.find({}, "title")
    .collation({ locale: "en", strength: 2 })
    .sort({ name: 1 })
    .exec();
  res.render("book_copy_form_add", { title: "Add book copy entry", books });
});
exports.showDelForm = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Book Copy delete GET");
});
exports.showUpdForm = asyncHandler(async (req, res, next) => {
  const books = await Book.find({}, "title")
    .collation({ locale: "en", strength: 2 })
    .sort({ name: 1 })
    .exec();
  res.render("book_copy_form_add", {
    title: "Edit copy",
    books,
    lastAttempt: await BookCopy.findById(req.params.id),
  });
});

// Do CUD operations
exports.add = [
  body("book", "Book not specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint not specified").trim().isLength({ min: 1 }).escape(),
  body("status").escape(),
  body("due_back", "Date is invalid")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const newBookCopy = BookCopy(req.body);
    if (errors.isEmpty()) {
      // code to run if validation passed
      await newBookCopy.save();
      res.redirect(newBookCopy.url);
    } else {
      // code to run if validation failed
      const books = await Book.find({}, "title")
        .collation({ locale: "en", strength: 2 })
        .sort({ title: 1 })
        .exec();

      res.render("book_copy_form_add", {
        title: "Add book copy entry",
        lastAttempt: newBookCopy,
        books,
        errors: errors.array(),
      });
    }
  }),
];
exports.delete = asyncHandler(async (req, res, next) => {
  const target = await BookCopy.findById(req.params.id);
  await BookCopy.findByIdAndDelete(req.params.id);
  res.redirect("/catalog/book/" + target.book.toString());
});
exports.update = [
  body("book", "Book not specified").trim().isLength({ min: 1 }).escape(),
  body("imprint", "Imprint not specified").trim().isLength({ min: 1 }).escape(),
  body("status").escape(),
  body("due_back", "Date is invalid")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const newBookCopy = BookCopy({ ...req.body, _id: req.params.id });
    if (errors.isEmpty()) {
      // code to run if validation passed
      await BookCopy.findByIdAndUpdate(req.params.id, newBookCopy, {});
      res.redirect(newBookCopy.url);
    } else {
      // code to run if validation failed
      const books = await Book.find({}, "title")
        .collation({ locale: "en", strength: 2 })
        .sort({ title: 1 })
        .exec();

      res.render("book_copy_form_add", {
        title: "Add book copy entry",
        lastAttempt: newBookCopy,
        books,
        errors: errors.array(),
      });
    }
  }),
];
