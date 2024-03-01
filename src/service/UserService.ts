import db from "@/db";
import _ from "lodash";

export default class UserService {
  constructor() {}

  async getUsers({ uids }) {
    let users = [];

    if (uids.length <= 0) {
      return users;
    }
    const snapshot = await db
      .collection("user")
      .where("username", "in", uids)
      .get();

    snapshot.forEach((doc) => {
      const _user = doc.data();
      const { password, ...rest } = _user;
      users.push(rest);
    });

    users = _.sortBy(users, (obj) => _.indexOf(uids, obj.username));

    return users;
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

    const { password, ...rest } = user;

    return rest;
  }

  async add(user) {
    await db.collection("user").add({
      username: user.username,
      password: user.password,
    });
  }

  async update(username, profile) {
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

    db.collection("user").doc(uid).update(profile);
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
