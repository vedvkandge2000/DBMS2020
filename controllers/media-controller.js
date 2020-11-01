var db = require("../models");
var Sequelize = require("sequelize");
var Op = Sequelize.Op;

var axios = require("axios");
//require mediaUpdateExport
var updateMediaTable = require("./updateMediaExport.js").updateMediaTable;
var deleteRowFromTable = require("./updateMediaExport.js").deleteRowFromTable;
//this has the mediaupdate and the media delete functions

module.exports = app => {
	// GET route for BOOK page
	
	app.get("/media/:mediaType/:industryIdentifier", (req, response) => {
		var query = {};
		query.mediaType = req.params.mediaType;
		query.industryIdentifier = req.params.industryIdentifier;

		db.Medium
			.findAll({
				where: query
			})
			.then(data => {
				var dataDeliverable = JSON.parse(JSON.stringify(data[0]));

				console.log(dataDeliverable);
				response.render("book", dataDeliverable);
			});
	});

	// GET route for SEARCH page
	
	app.get("/search/:searchBy/:searchQuery", (req, res) => {
		searchBy = req.params.searchBy.toLowerCase();
		searchQuery = "%" + req.params.searchQuery + "%";

		var dataDeliverable = {};
		dataDeliverable.searchBy = req.params.searchBy;
		dataDeliverable.searchQuery = req.params.searchQuery;

		switch (searchBy) {
			case "title":
				var query = {
					title: { [Op.like]: [searchQuery] }
				};
				break;

			case "author":
				var query = {
					author: { [Op.like]: [searchQuery] }
				};
				break;

			case "isbn":
				var query = {
					industryIdentifier: { [Op.like]: [searchQuery] }
				};
				break;

			case "all":
				var query = {
					[Op.or]: [
						{
							title: { [Op.like]: [searchQuery] }
						},
						{
							author: { [Op.like]: [searchQuery] }
						},
						{
							industryIdentifier: { [Op.like]: [searchQuery] }
						}
					]
				};

			default:
				console.log("error");
				break;
		}

		console.log("CONSOLE LOGGING QUERY");
		console.log(query);

		db.Medium
			.findAll({
				where: query
			})
			.then(data => {
				if (data.length > 0) {
					dataDeliverable.results = JSON.parse(JSON.stringify(data));
				} else {
					dataDeliverable.error = {
						error: "Item not available in database."
					};
				}

				// res.json(dataDeliverable);
				res.render("search", dataDeliverable);
			});
	});

	// POST route for adding a new BOOK to the database
	
	app.post("/api/media/new", (req, res) => {
		var newMedium = {};
		newMedium.mediaType = req.body.mediaType;

		if (newMedium.mediaType === "book") {
			var isbn = req.body.industryIdentifier;
			newMedium.industryIdentifier = isbn;
		}

		var queryURL =
			"https://www.googleapis.com/books/v1/volumes?q=isbn:" + isbn;

		axios({
			method: "get",
			url: queryURL
		})
			.then(response => {
				if (response.status === 200) {
					var volumeInfo = response.data.items[0].volumeInfo;
					console.log(volumeInfo);

					newMedium.title = volumeInfo.title;
					newMedium.author = volumeInfo.authors[0];
					newMedium.summary = volumeInfo.description;

					if (volumeInfo.imageLinks) {
						newMedium.image = volumeInfo.imageLinks.thumbnail;
					} else {
						newMedium.image = "/assets/img/placeholder.gif";
					}

					newMedium.totalStock = req.body.totalStock;
					newMedium.numShelved = req.body.totalStock;
				}
			})
			.then(() => {
				return db.Medium.create(newMedium);
			})
			.then(data => {
				res.json(data);
			});
	}); // app.post

	//UPDATE AN EXISTING BOOK -- CHANGE EXISTING BOOK AMOUNT
	//PUT to media table - add one item OR delete one item

	//DELETE ALL INSTANCES OF A BOOK - REMOVING ROW FROM MEDIA TABLE
	
	app.delete("/api/media/delete/:industryIdentifier", (req, res) => {
		// if (req.body.mediaType === "book") {
		Promise.resolve(() => {
			deleteRowFromTable("media", req.params.industryIdentifier);
		}).then(data => {
			res.json(data);
		});
		// }
	});
};
