const mongoose = require("mongoose");
const { Schema, model: Model } = mongoose;
const { DateTime } = require("luxon");

const schema = new Schema({
  first_name: { type: String, required: true, maxLength: 100 },
  family_name: { type: String, required: true, maxLength: 100 },
  date_of_birth: { type: Date },
  date_of_death: { type: Date },
});

schema.virtual("url").get(function () {
  return "/catalog/author/" + this._id;
});

schema.virtual("name").get(function () {
  let fullname = "";
  if (this.first_name && this.family_name) {
    fullname = `${this.family_name}, ${this.first_name}`;
  }
  return fullname;
});

schema.virtual("dob_luxon").get(function () {
  return DateTime.fromJSDate(this.date_of_birth).toFormat("yyyy-MM-dd");
});

schema.virtual("lifespan").get(function () {
  return [this.date_of_birth, this.date_of_death]
    .filter((x) => x)
    .map((x) => DateTime.fromJSDate(x).toLocaleString(DateTime.DATE_MED))
    .join(" - ");
});

const model = Model("author", schema);

module.exports = model;
