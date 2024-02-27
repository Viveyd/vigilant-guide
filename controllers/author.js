const { body, validationResult } = require("express-validator");
const Author = require("../models/author");
const Book = require("../models/book");

const asyncHandler = require("express-async-handler");

// List all authors
exports.list = asyncHandler(async (req, res, next) => {
  const list = await Author.find({}).sort({ family_name: 1 }).exec();
  res.render("author_list", { title: "Author List", list });
});

// Find specific author
exports.find = asyncHandler(async (req, res, next) => {
  const [author, authorBooks] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }).exec(),
  ]);

  if (!author) {
    const err = new Error("Author not found!");
    err.status = 404;
    return next(err);
  }

  res.render("author_details", {
    title: "Author Details",
    author,
    hasDependentsErr: req.flash("hasDependentsErr")[0],
    list: authorBooks,
  });
});

// Show CUD forms
exports.showAddForm = (req, res, next) => {
  res.render("author_form_add", { title: "Add author entry" });
};
exports.showDelForm = (req, res, next) => {
  res.render("author_form_del", { title: "Delete author entry" });
};
exports.showUpdForm = async (req, res, next) => {
  res.render("author_form_add", {
    title: "Update author entry",
    author: await Author.findById(req.params.id),
  });
};

// Do CUD operations
exports.add = [
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters."),
  body("family_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Family name must be specified.")
    .isAlphanumeric()
    .withMessage("Family name has non-alphanumeric characters."),
  body("date_of_birth", "Invalid date of birth")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),
  body("date_of_death", "Invalid date of death")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const newAuthor = new Author(req.body);
    if (errors.isEmpty()) {
      await newAuthor.save();
      res.redirect(newAuthor.url);
    } else {
      res.render("author_form_add", {
        title: "Add author entry",
        author: newAuthor,
        errors: errors.array(),
      });
    }
  }),
];
exports.delete = asyncHandler(async (req, res, next) => {
  const [author, authoredBooks] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }).exec(),
  ]);

  if (authoredBooks.length === 0) {
    await Author.findByIdAndDelete(req.params.id);
    req.flash("hasDependentsErr", false);
    res.redirect("/catalog/author/all");
  } else {
    req.flash("hasDependentsErr", true);
    res.redirect(`/catalog/author/${req.params.id}`);
  }
});

exports.update = [
  body("first_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters."),
  body("family_name")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Family name must be specified.")
    .isAlphanumeric()
    .withMessage("Family name has non-alphanumeric characters."),
  body("date_of_birth", "Invalid date of birth")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),
  body("date_of_death", "Invalid date of death")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const newAuthor = new Author({ ...req.body, _id: req.params.id });
    if (errors.isEmpty()) {
      await Author.findByIdAndUpdate(req.params.id, newAuthor, {});
      res.redirect(newAuthor.url);
    } else {
      res.render("author_form_add", {
        title: "Add author entry",
        author: newAuthor,
        errors: errors.array(),
      });
    }
  }),
];
