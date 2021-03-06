const mongoose = require("mongoose");
const schema = require("../models/ai.model").AiSchema;
const moment = require("moment");
const orbit = require("../controllers/orbit.controller");

require("dotenv").config();

// conn string
const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}`;

// create account
exports.ai_newSync = function (req, res) {
    res.render("pages/sync-module", {
		title: "Sync new module",
    });
};

// create
exports.ai_create = function (req, res) {
    mongoose.connect(url,  { useNewUrlParser: true }).then(
        () => {
            // construct model
			let AiSchema = mongoose.model("Ai", schema);

			// format date so db is happy
			let formatDate = moment(req.body.contructionDate).format("YYYY-DD-MM");

            // create new instance of user
            let ai = new AiSchema({
                serialNr : req.body.serialNr,
                password: req.body.password,
                instanceName: req.body.instanceName,
                brandName: req.body.brandName,
				constructionDate: new Date(formatDate),
				gender: req.body.gender,
				properties : {
					intelligence: req.body.intelligence,
					environment: req.body.environment,
					shape: req.body.shape,
					abilities: req.body.abilities
				},
			});

            // save user
            ai.save(function (err) {
				if (err) {
					console.log(err);
				}
                else {
					orbit.createOrbit(ai);
                    res.send(`User created: \n ${ai}`);
                }
			});

			//return res.redirect("myAI");
        },
        err => { console.log(err); }
    );
};