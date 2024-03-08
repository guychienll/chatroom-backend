import { Profile, User } from "@/types/User";

type UserName = User["username"];
type UserPassword = User["password"];

export default interface IUserService {
  getUsers: ({ uids }: { uids: UserName[] }) => Promise<User[]>;
  getUser: (username: UserName, withPassword?: boolean) => Promise<User | null>;
  add: (user: Required<Pick<User, "username" | "password">>) => Promise<void>;
  update: (username: UserName, profile: Profile) => Promise<void>;
  updatePassword: (
    username: UserName,
    password: Required<UserPassword>
  ) => Promise<void>;
}
