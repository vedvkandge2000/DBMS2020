var db = require("../models");
var deleteRowFromTable = require("./updateMediaExport.js").deleteRowFromTable;

module.exports = app => {
	//FAVORITES ROUTES
	//POST - favorite item
	
	app.post("/api/favorites/create", (req, res) => {
		db.Favorite
			.create({
				MediumId: req.body.mediumId,
				UserId: req.body.userId
			})
			.then(data => {
				console.log("FAVORITE ADDED");
				res.json(data);
			});
	});

	//DELETE - favorite item - see generic delete route
	app.delete("/api/favorites/:userId/delete/:mediumId", (req, res) => {
		Promise.resolve(() => {
			return deleteRowFromTable(
				"favorites",
				req.params.userId,
				req.params.mediumId
			);
		}).then(data => {
			res.json(data);
		});
	});
};
