var db = require("../models");
var updateMediaTable = require("./updateMediaExport.js").updateMediaTable;
var deleteRowFromTable = require("./updateMediaExport.js").deleteRowFromTable;

//require mediaUpdateExport
//this has the mediaupdate and the media delete functions

module.exports = app => {
	// //RESERVATION ROUTES

	
	app.post("/api/reservations/create", (req, res) => {
		db.Reservation
			.create({
				MediumId: req.body.mediumId,
				UserId: req.body.userId
			})
			.then(data => {
				console.log("RESERVATION ADDED");
				// res.json(data);
			})
			.then(() => {
				updateMediaTable("reserveMedia", req.body.mediumId);
			})
			.then(data => {
				res.json(data);
			});
	});

	//DELETE route for canceling a reservation

	app.delete("/api/reservations/:userId/delete/:mediumId", (req, res) => {
		console.log(
			"==============res controller delete ",
			req.params.userId,
			req.params.mediumId
		);
		Promise.resolve(
			deleteRowFromTable(
				"reservations",
				req.params.userId,
				req.params.mediumId
			)
		)
			.then(() => {
				console.log("about to update media table");
				updateMediaTable("cancelReservation", req.params.mediumId);
			})
			.then(data => {
				res.json(data);
			});
	});
};
