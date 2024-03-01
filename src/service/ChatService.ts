import db from "@/db";
import { v4 as uuid } from "uuid";

class ChatService {
  constructor() {}

  async getUserRooms(username) {
    const snapshot = await db
      .collection("room")
      .where("uids", "array-contains", username)
      .get();

    const rooms = [];
    snapshot.forEach((doc) => {
      rooms.push(doc.data());
    });

    return rooms;
  }

  async getRoomByGroup(uids) {
    const snapshot = await db
      .collection("room")
      .where("uids", "array-contains", uids[0])
      .get();

    const rooms = [];
    snapshot.forEach((doc) => {
      rooms.push(doc.data());
    });

    return rooms.find((room) => {
      return room.uids.includes(uids[1]);
    });
  }

  async getRoom(id) {
    return (await db.collection("room").doc(id).get()).data();
  }

  async createRoom(room) {
    await db.collection("room").doc(room.id).set(room);
  }

  async updateRoom(room) {
    db.collection("room").doc(room.id).update(room);
  }
}

export default ChatService;
