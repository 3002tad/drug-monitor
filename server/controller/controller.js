// server/controller/controller.js
let Drugdb = require('../model/model');

// Helper: phát hiện request mong muốn JSON (AJAX hoặc header Accept)
function wantsJson(req) {
  return req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'));
}

// ============ CREATE ============
// creates and saves a new drug
exports.create = (req, res) => {
  // validate incoming request
  if (!req.body) {
    return res.status(400).send({ message: "Content cannot be emtpy!" });
  }

  // create new drug
  const drug = new Drugdb({
    name: (req.body.name || "").trim(),
    card: Number(req.body.card),
    pack: Number(req.body.pack),
    perDay: Number(req.body.perDay),
    dosage: (req.body.dosage || "").trim(),
  });

  // save created drug to database
  drug
    .save()
    .then((data) => {
      console.log(`${data.name} added to the database`);

      if (wantsJson(req)) {
        // Trả JSON cho các lời gọi AJAX
        return res.status(201).send(data);
      }
      // Hành vi cũ: redirect
      return res.redirect('/manage');
    })
    .catch((err) => {
      return res.status(500).send({
        message: err.message || "There was an error while adding the drug",
      });
    });
};

// ============ READ ============
// can either retrieve all drugs from the database or retrieve a single drug
exports.find = (req, res) => {
  if (req.query.id) {
    // get by id
    const id = req.query.id;

    Drugdb.findById(id)
      .then((data) => {
        if (!data) {
          return res.status(404).send({ message: "Can't find drug with id: " + id });
        }
        return res.send(data);
      })
      .catch((err) => {
        return res.status(500).send({ message: "Error retrieving drug with id: " + id });
      });
  } else {
    // get all (sorted by name)
    Drugdb.find()
      .sort({ name: 1 })
      .then((drug) => {
        return res.send(drug);
      })
      .catch((err) => {
        return res
          .status(500)
          .send({ message: err.message || "An error occurred while retrieving drug information" });
      });
  }
};

// ============ UPDATE ============
// edits a drug selected using its ID
exports.update = (req, res) => {
  if (!req.body) {
    return res.status(400).send({ message: "Cannot update an empty drug" });
  }

  const id = req.params.id;

  Drugdb.findByIdAndUpdate(id, req.body, {
    new: true,           // trả về document sau khi cập nhật
    runValidators: true, // chạy validator của schema khi update
  })
    .then((data) => {
      if (!data) {
        return res.status(404).send({ message: `Drug with id: ${id} cannot be updated` });
      }
      return res.send(data);
    })
    .catch((err) => {
      return res.status(500).send({ message: "Error in updating drug information" });
    });
};

// ============ DELETE ============
// deletes a drug using its drug ID
exports.delete = (req, res) => {
  const id = req.params.id;

  Drugdb.findByIdAndDelete(id)
    .then((data) => {
      if (!data) {
        return res
          .status(404)
          .send({ message: `Cannot Delete drug with id: ${id}. Pls check id` });
      }
      return res.send({
        message: `${data.name} was deleted successfully!`,
      });
    })
    .catch((err) => {
      return res.status(500).send({
        message: "Could not delete Drug with id=" + id,
      });
    });
};