import db from "@/db";
import { Profile, User } from "@/types/User";
import _ from "lodash";
import { converter } from "@/util/converter";

export default class UserService {
  constructor() {}

  async getUsers({ uids }: { uids: User["username"][] }) {
    const users: User[] = [];

    if (uids.length <= 0) {
      return [];
    }

    const snapshot = await db
      .collection("user")
      .withConverter(converter<User>())
      .where("username", "in", uids)
      .get();

    snapshot.forEach((doc) => {
      const _user = doc.data();
      delete _user.password;
      users.push(_user);
    });

    return _.sortBy(users, (obj) => _.indexOf(uids, obj.username));
  }

  async getUser(username: User["username"], withPassword?: boolean) {
    const snapshot = await db
      .collection("user")
      .withConverter(converter<User>())
      .where("username", "==", username)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const users: User[] = [];

    snapshot.forEach((doc) => {
      const _user = doc.data();
      !withPassword && delete _user.password;
      users.push(_user);
    });

    return users.shift() ?? null;
  }

  async add(user: Required<Pick<User, "username" | "password">>) {
    await db.collection("user").add({
      username: user.username,
      password: user.password,
    });
  }

  async update(username: User["username"], profile: Profile) {
    const snapshot = await db
      .collection("user")
      .withConverter(converter<User>())
      .where("username", "==", username)
      .get();

    const ids: string[] = [];

    snapshot.forEach((doc) => {
      ids.push(doc.id);
    });

    const id = ids.shift();

    if (!id) {
      return;
    }

    db.collection("user")
      .withConverter(converter<User>())
      .doc(id)
      .update(profile);
  }

  async updatePassword(
    username: User["username"],
    password: Required<User["password"]>
  ) {
    const snapshot = await db
      .collection("user")
      .where("username", "==", username)
      .get();

    const ids: string[] = [];

    snapshot.forEach((doc) => {
      ids.push(doc.id);
    });

    const id = ids.shift();

    if (!id) {
      return;
    }

    db.collection("user").withConverter(converter<User>()).doc(id).update({
      password,
    });
  }
}
