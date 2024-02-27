var express = require("express");
var router = express.Router();
const AuthorCtrl = require("../controllers/author");
const BookCtrl = require("../controllers/book");
const CopyCtrl = require("../controllers/book_copy");
const GenreCtrl = require("../controllers/genre");
const IndexCtrl = require("../controllers/index");

router.get("/", IndexCtrl.index);

// Author routes
router.get("/author/all", AuthorCtrl.list);
router.get("/author/add", AuthorCtrl.showAddForm);
router.get("/author/delete", AuthorCtrl.showDelForm);
router.get("/author/:id/update", AuthorCtrl.showUpdForm);
router.get("/author/:id", AuthorCtrl.find);
router.post("/author/add", AuthorCtrl.add);
router.post("/author/:id/update", AuthorCtrl.update);
router.post("/author/:id/delete", AuthorCtrl.delete);

// Book routes
router.get("/book/all", BookCtrl.list);
router.get("/book/add", BookCtrl.showAddForm);
router.get("/book/delete", BookCtrl.showDelForm);
router.get("/book/:id/update", BookCtrl.showUpdForm);
router.get("/book/:id", BookCtrl.find);
router.post("/book/add", BookCtrl.add);
router.post("/book/:id/update", BookCtrl.update);
router.post("/book/:id/delete", BookCtrl.delete);

// Book Copy routes
router.get("/book-copy/all", CopyCtrl.list);
router.get("/book-copy/add", CopyCtrl.showAddForm);
router.get("/book-copy/delete", CopyCtrl.showDelForm);
router.get("/book-copy/:id/update", CopyCtrl.showUpdForm);
router.get("/book-copy/:id", CopyCtrl.find);
router.post("/book-copy/add", CopyCtrl.add);
router.post("/book-copy/:id/update", CopyCtrl.update);
router.post("/book-copy/:id/delete", CopyCtrl.delete);

// Genre routes
router.get("/genre/all", GenreCtrl.list);
router.get("/genre/add", GenreCtrl.showAddForm);
router.get("/genre/delete", GenreCtrl.showDelForm);
router.get("/genre/:id/update", GenreCtrl.showUpdForm);
router.get("/genre/:id", GenreCtrl.find);
router.post("/genre/add", GenreCtrl.add);
router.post("/genre/:id/update", GenreCtrl.update);
router.post("/genre/:id/delete", GenreCtrl.delete);

module.exports = router;
