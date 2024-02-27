import db from "@/db";

export default class UserService {
  constructor() {}

  async addUser(user) {
    await db.collection("user").add({
      username: user.username,
      password: user.password,
    });
  }

  async getUser(username) {
    const snapshot = await db
      .collection("user")
      .where("username", "==", username)
      .get();

    if (snapshot.empty) {
      return null;
    }

    let user = null;
    snapshot.forEach((doc) => {
      if (!user) {
        user = doc.data();
      }
    });

    return user;
  }
}
