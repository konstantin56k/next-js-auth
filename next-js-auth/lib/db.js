import { MongoClient } from "mongodb";

export async function connectToDatabase(params) {
  const client = await MongoClient.connect(
    `mongodb+srv://konstantin56k:${process.env.MONGO_PASS}@cluster0.b3jeuob.mongodb.net/auth-demo?retryWrites=true&w=majority`
  );

  return client;
}
