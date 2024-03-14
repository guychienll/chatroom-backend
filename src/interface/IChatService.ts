import { Room } from "@/types/Room";
import { User } from "@/types/User";

export default interface IChatService {
  getUserRooms(username: User["username"]): Promise<Room[]>;
  getRoomByGroup(uids: User["username"][]): Promise<Room | undefined>;
  getRoom(id: Room["id"]): Promise<Room | null>;
  createRoom(room: Room): Promise<void>;
  updateRoom(room: Room): Promise<void>;
}
