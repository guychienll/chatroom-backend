import { User } from "@/types/User";

export class GetUsersDto {
  uids: User["username"][];

  constructor({ uids }: { uids: User["username"][] }) {
    this.uids = uids;
  }
}
