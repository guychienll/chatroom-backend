import { Gender, Profile } from "@/types/User";
import { IsUrl } from "class-validator";

class UserUpdateDto {
  constructor(profile: Profile) {
    this.avatar = profile.avatar;
    this.nickname = profile.nickname;
    this.birthday = profile.birthday;
    this.gender = profile.gender;
    this.bio = profile.bio;
  }

  @IsUrl()
  avatar: string;

  nickname: string;

  birthday: string;

  gender: Gender;

  bio: string;
}

export default UserUpdateDto;
