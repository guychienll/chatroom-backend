import { User } from "@/types/User";

export class GetUsersDto {
  uids: User["username"][];

  constructor(props: { uids: User["username"][] }) {
    this.uids = props.uids;
  }
}
