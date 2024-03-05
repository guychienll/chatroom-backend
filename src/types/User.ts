export enum Gender {
  male = "male",
  female = "female",
  other = "other",
}

export type User = {
  username: string;
  password?: string;
  nickname: string;
  avatar: string;
  gender: Gender;
  birthday: string;
  bio: string;
};

export type Profile = Pick<
  User,
  "nickname" | "avatar" | "gender" | "birthday" | "bio"
>;
