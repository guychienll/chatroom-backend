import ErrorHandler from "@/decorator/ErrorHandler";
import HttpError from "@/model/HttpError";
import UserService from "@/service/UserService";
import { Request } from "@/types/Request";
import UserUpdateDto from "@/dto/User/UserUpdateDto";

class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
    this.profile = this.profile.bind(this);
    this.update = this.update.bind(this);
  }

  async update(req: Request<UserUpdateDto>, res) {
    if (!req.session.username) {
      throw new HttpError("Session Expired", 498);
    }

    await this.userService.update(req.session.username, {
      avatar: req.body.avatar,
      age: req.body.age,
    });

    res.status(200).send(req.body);
  }

  @ErrorHandler()
  async profile(req, res) {
    if (!req.session.username) {
      throw new HttpError("Session Expired", 498);
    }

    const user = await this.userService.get(req.session.username);

    res.status(200).send({
      username: user.username,
    });
  }
}

export default UserController;
