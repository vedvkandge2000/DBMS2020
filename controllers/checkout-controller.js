var db = require("../models");
var updateMediaTable = require("./updateMediaExport.js").updateMediaTable;
var deleteRowFromTable = require("./updateMediaExport.js").deleteRowFromTable;

//require mediaUpdateExport
//this has the mediaupdate and the media delete functions

module.exports = app => {
	
	app.put("/api/checkouthistories/update/checkin", (req, res) => {
		let dataDeliverable = {};

		db.CheckOutHistory
			.update(
				{
					isCheckedOut: false,
					//this only works using "updatedAt", NOT the field name "dateCheckedIn"
					updatedAt: db.Sequelize.literal("NOW()")
				},
				{
					where: {
						UserId: req.body.userId,
						MediumId: req.body.mediumId
					}
				}
			)
			.then(data => {
				//PUT to media table
				console.log(req.body.mediumId);
				updateMediaTable("checkIn", req.body.mediumId);
				res.json(data);
			});
	});

	//CHECK OUT A BOOK WITHOUT RESERVATION
	//POST to checkouthistories table
		app.post("/api/checkouthistories/create/withoutres", (req, res) => {
		db.CheckOutHistory
			.create({
				MediumId: req.body.mediumId,
				UserId: req.body.userId
			})
			.then(data => {
				//PUT to media table
				updateMediaTable(
					"checkoutWithoutReservation",
					req.body.mediumId
				);
				res.json(data);
			});
	});

	//CHECK OUT A BOOK WITH A RESERVATION
	//POST to checkouthistories table
		app.post("/api/checkouthistories/create/withres", (req, res) => {
		db.CheckOutHistory
			.create({
				MediumId: req.body.mediumId,
				UserId: req.body.userId
			})
			.then(data => {
				//DELETE to reservations table
				deleteRowFromTable(
					"reservations",
					req.body.userId,
					req.body.mediumId
				);
			})
			.then(data => {
				//PUT to media table
				updateMediaTable("checkoutWithReservation", req.body.mediumId);
			});
	});

	//RENEW A BOOK
	//check in
	//PUT to checkouthistories table
		app.put("/api/checkouthistories/update/renew", (req, res) => {
		let dataDeliverable = {};

		db.CheckOutHistory
			.update(
				{
					isCheckedOut: false,
					//this only works using "updatedAt", NOT the field name "dateCheckedIn"
					updatedAt: db.Sequelize.literal("NOW()")
				},
				{
					where: {
						UserId: req.body.userId,
						MediumId: req.body.mediumId
					}
				}
			)
			.then(data => {
				//PUT to media table
				updateMediaTable("checkIn", req.body.mediumId);
			})
			.then(() => {
				//check out without reservation
				//POST to checkouthistories table
				return db.CheckOutHistory.create({
					MediumId: req.body.mediumId,
					UserId: req.body.userId
				});
			})
			.then(data => {
				//DELETE to reservations table
				deleteRowFromTable(
					"reservations",
					req.body.userId,
					req.body.mediumId
				);
			})
			.then(data => {
				//PUT to media table
				updateMediaTable("checkoutWithReservation", req.body.mediumId);
				res.json(data);
			});
	});
};
