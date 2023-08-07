const config = {
	client: process.env.DB_CLIENT,
	connection: {
		host: process.env.DB_HOST,
		port: process.env.DB_PORT ?? 3306,
		user: process.env.DB_USER,
		password: process.env.DB_PASS,
		database: process.env.DB_DB,
	},
};
const knex = require("knex")(config);

module.exports = knex;
