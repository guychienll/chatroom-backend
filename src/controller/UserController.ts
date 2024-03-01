import ErrorHandler from "@/decorator/ErrorHandler";
import UserUpdateDto from "@/dto/User/UserUpdateDto";
import HttpError from "@/model/HttpError";
import UserService from "@/service/UserService";
import { Request } from "@/types/Request";

class GetUsersDto {
  uids: [];

  constructor({ uids }) {
    this.uids = uids;
  }
}

class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
    this.profile = this.profile.bind(this);
    this.update = this.update.bind(this);
    this.getUsers = this.getUsers.bind(this);
    this.getUser = this.getUser.bind(this);
  }

  @ErrorHandler()
  async getUsers(req: Request<GetUsersDto>, res) {
    const reqBody = new GetUsersDto(req.body);
    const users = await this.userService.getUsers(reqBody);
    res.status(200).send(users);
  }

  @ErrorHandler()
  async getUser(req, res) {
    const user = await this.userService.getUser(req.query.username);
    res.status(200).send(user);
  }

  async update(req: Request<UserUpdateDto>, res) {
    if (!req.session.profile) {
      req.session.destroy();
      throw new HttpError("Session Expired", 498);
    }

    await this.userService.update(req.session.profile.username, {
      avatar: req.body.avatar,
      nickname: req.body.nickname,
      birthday: req.body.birthday,
      gender: req.body.gender,
      bio: req.body.bio,
    });

    res.status(200).send(req.body);
  }

  @ErrorHandler()
  async profile(req, res) {
    if (!req.session.profile) {
      req.session.destroy();
      throw new HttpError("Session Expired", 498);
    }

    const username = req.session.profile.username;
    const user = await this.userService.get(username);

    res.status(200).send({
      username: user.username,
      avatar: user.avatar,
      nickname: user.nickname,
      birthday: user.birthday,
      gender: user.gender,
      bio: user.bio,
    });
  }
}

export default UserController;
