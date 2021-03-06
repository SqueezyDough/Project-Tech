const mongoose = require("mongoose");
const Ai = require("../models/ai.model");
const Orbit = require("../models/orbit.model").OrbitSchema;
const utils = require("./utils/utils.controller");

require("dotenv").config();
const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}`;

const orbitController = {};

orbitController.explore = function(req, res) {
	mongoose.connect(url, { useNewUrlParser: true });

	utils.findOrbit(req.params.id).then(function(orbit) {
		utils.findAi(orbit.ownerId).then(function(ai) {
			res.render("pages/explore", {
				title : `${process.env.APP_NAME} - ${ai.serialNr}'s Orbit`,
				ai : ai,
				url : "",
				planets : orbit.planets,
				isSynced: req.isAuthenticated()
			});
		});
	});
};

orbitController.createOrbit = async function(ai) {
	mongoose.connect(url,  { useNewUrlParser: true });

	let OrbitSchema = mongoose.model("Orbit", Orbit);

	// create ownership, connect ai to orbit
	let orbit = new OrbitSchema({
		ownerId : ai._id,
		activeConnections : ai._id,
	});

	// find possible candidates
	Ai.find({ _id: { $ne: ai._id }}, (err, ais) => {
		ais.forEach( (_ai) => {
			if (isMatch(ai, _ai)) {
				// push matched ais to orbit
				_ai.orbits.forEach( (planet) => {
					console.log(planet);
					orbit.planets.push(planet);
				});
			}
		});

		// push orbit to ai orbit
		ai.orbits.push(orbit._id);

		orbit.save(function (err) {
			if (err) {
				console.log(err);
			}
		});
	});

	ai.save(function (err) {
		if (err) {
			console.log(err);
		}
		else {
			//console.log("Orbit created: " + orbit);
		}
	});
};

function isMatch(ai, candidateAi) {
	let keys = Object.values(Object.keys(ai.properties));
	let matchedProperties = 0;

	for (let i = 0; i < keys.length; i++) {
		if (ai.properties[keys[i]] == candidateAi.properties[keys[i]]) {
			matchedProperties++;
		}
	}
	console.log(matchedProperties);
	if (matchedProperties >= 3) {
		return true;
	}

	return false;
}

module.exports = orbitController;

