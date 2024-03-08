import ErrorHandler from "@/decorator/ErrorHandler";
import { RequestBodyValidator } from "@/decorator/Validator";
import UserUpdateDto from "@/dto/User/UserUpdateDto";
import IUserService from "@/interface/IUserService";
import { EntityNotFoundError, SessionTimeoutError } from "@/model/HttpError";
import { Request, Response } from "@/types/Http";
import { User } from "@/types/User";
import { GetUsersDto } from "../dto/User/GetUsersDto";

class UserController {
  private userService: IUserService;

  constructor(userService: IUserService) {
    this.userService = userService;
    this.profile = this.profile.bind(this);
    this.update = this.update.bind(this);
    this.getUsers = this.getUsers.bind(this);
    this.getUser = this.getUser.bind(this);
  }

  @ErrorHandler()
  @RequestBodyValidator(GetUsersDto)
  async getUsers(req: Request<GetUsersDto>, res: Response) {
    const users = await this.userService.getUsers(req.body);
    res.status(200).send(users);
  }

  @ErrorHandler()
  async getUser(
    req: Request<any, { username: User["username"] }>,
    res: Response
  ) {
    const user = await this.userService.getUser(req.query.username);
    res.status(200).send(user);
  }

  @ErrorHandler()
  @RequestBodyValidator(UserUpdateDto)
  async update(req: Request<UserUpdateDto>, res: Response) {
    if (!req.session.profile) {
      req.session.destroy(() => {
        console.log("session destroyed");
      });
      throw new SessionTimeoutError();
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
  async profile(req: Request, res: Response) {
    if (!req.session.profile) {
      delete req.session.profile;
      throw new SessionTimeoutError();
    }

    const username = req.session.profile.username;

    const user = await this.userService.getUser(username);

    if (!user) {
      throw new EntityNotFoundError();
    }

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
