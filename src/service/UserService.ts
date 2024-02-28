import db from "@/db";

export default class UserService {
  constructor() {}

  async add(user) {
    await db.collection("user").add({
      username: user.username,
      password: user.password,
    });
  }

  async update(username, profile) {
    const { avatar, age } = profile;

    const snapshot = await db
      .collection("user")
      .where("username", "==", username)
      .get();

    let uid = null;
    snapshot.forEach((doc) => {
      if (!uid) {
        uid = doc.id;
      }
    });

    db.collection("user").doc(uid).update({
      avatar,
      age,
    });
  }

  async updatePassword(username, password) {
    const snapshot = await db
      .collection("user")
      .where("username", "==", username)
      .get();

    let uid = null;
    snapshot.forEach((doc) => {
      if (!uid) {
        uid = doc.id;
      }
    });

    db.collection("user").doc(uid).update({
      password,
    });
  }

  async get(username) {
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
