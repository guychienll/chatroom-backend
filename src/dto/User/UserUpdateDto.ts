import { Gender, Profile } from "@/types/User";

class UserUpdateDto {
  avatar: string;

  nickname: string;

  birthday: string;

  gender: Gender;

  bio: string;

  constructor(props: Profile) {
    this.avatar = props.avatar;
    this.nickname = props.nickname;
    this.birthday = props.birthday;
    this.gender = props.gender;
    this.bio = props.bio;
  }
}

export default UserUpdateDto;
