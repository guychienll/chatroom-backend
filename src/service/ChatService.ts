import { User } from "@/types/User";
import db from "@/db";
import { Room } from "@/types/Room";
import { converter } from "@/util/converter";

class ChatService {
  constructor() {}

  async getUserRooms(username: User["username"]) {
    const snapshot = await db
      .collection("room")
      .withConverter(converter<Room>())
      .where("uids", "array-contains", username)
      .get();

    const rooms: Room[] = [];

    snapshot.forEach((doc) => {
      rooms.push(doc.data());
    });

    return rooms;
  }

  async getRoomByGroup(uids: User["username"][]) {
    const snapshot = await db
      .collection("room")
      .withConverter(converter<Room>())
      .where("uids", "array-contains", uids[0])
      .get();

    const rooms: Room[] = [];

    snapshot.forEach((doc) => {
      rooms.push(doc.data());
    });

    return rooms.find((room) => room.uids.includes(uids[1]));
  }

  async getRoom(id: Room["id"]) {
    const doc = await db
      .collection("room")
      .withConverter(converter<Room>())
      .doc(id)
      .get();

    const room = doc.data();

    return room ? room : null;
  }

  async createRoom(room: Room) {
    await db
      .collection("room")
      .withConverter(converter<Room>())
      .doc(room.id)
      .set(room);
  }

  async updateRoom(room: Room) {
    db.collection("room")
      .withConverter(converter<Room>())
      .doc(room.id)
      .update(room);
  }
}

export default ChatService;
