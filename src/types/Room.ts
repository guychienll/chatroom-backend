import { User } from "@/types/User";

export type Room = { id: string; uids: User["username"][]; messages: any[] };
