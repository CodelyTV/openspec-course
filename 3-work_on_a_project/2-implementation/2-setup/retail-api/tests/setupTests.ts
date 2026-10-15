const isolatedTestDatabaseUrl =
	process.env.TEST_DATABASE_URL ??
	"postgres://retail:retail@localhost:5432/retail_test";

process.env.DATABASE_URL = isolatedTestDatabaseUrl;
