import { getSession } from "next-auth/client";
import { hashPassword, verifyPassword } from "../../../lib/auth";
import { connectToDatabase } from "../../../lib/db";

async function handler(req, res) {
  if (req.method !== "PATCH") {
    return;
  }

  // protecting API route. Just authenticated user has access to the route.
  const session = await getSession({ req: req });

  if (!session) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  const userEmail = session.user.email;
  // will enter oldP and newP on client side
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;

  // connect to DB to fetch users data
  const client = await connectToDatabase();
  const usersCollection = client.db().collection("users");
  const user = await usersCollection.findOne({ email: userEmail });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    client.close();
    return;
  }

  const currentPassword = user.password;
  const verifiedPassword = await verifyPassword(oldPassword, currentPassword);
  console.log(verifiedPassword);

  if (!verifiedPassword) {
    res.status(403).json({ message: "Invalid password" });
    client.close();
    return;
  }

  const newHashedPassword = await hashPassword(newPassword);

  // $set - command for mongoDB that we need change just password
  // to update password: 1st - identify by email; 2nd - enter new hashed password
  const result = await usersCollection.updateOne(
    { email: userEmail },
    { $set: { password: newHashedPassword } }
  );

  res.status(200).json({ message: "Password updated" });
  client.close();
}

export default handler;
