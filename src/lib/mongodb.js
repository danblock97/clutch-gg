import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {
	tls: true,
};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
	throw new Error("Please add your MongoDB URI to .env.local");
}

if (process.env.NODE_ENV === "development") {
	if (!global._mongoClientPromise) {
		client = new MongoClient(uri, options);
		global._mongoClientPromise = client.connect();
	}
	clientPromise = global._mongoClientPromise;
} else {
	client = new MongoClient(uri, options);
	clientPromise = client.connect();
}

clientPromise.then((client) => {
	const db = client.db("lol-tracker");
	db.collection("profiles")
		.createIndex({ createdAt: 1 }, { expireAfterSeconds: 180 })
		.catch((error) => {
			console.error("Index creation failed:", error);
		});
});

export default clientPromise;
