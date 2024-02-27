import ErrorHandler from "@/decorator/ErrorHandler";
import LoginDto from "@/dto/Auth/LoginDto";
import RegisterDto from "@/dto/Auth/RegisterDto";
import SendValidationCode from "@/dto/Auth/SendValidationCodeDto";
import ValidateCodeDto from "@/dto/Auth/ValidCodeDto";
import HttpError from "@/model/HttpError";
import MailService from "@/service/MailService";
import UserService from "@/service/UserService";
import { validate } from "class-validator";
import OtpGenerator from "otp-generator";

export interface IRequest<T> extends Express.Request {
  body: T;
  session: any;
}

class AuthController {
  private userService: UserService;
  private mailService: MailService;

  constructor(userService: UserService, mailService: MailService) {
    this.userService = userService;
    this.mailService = mailService;
    this.sendValidationCode = this.sendValidationCode.bind(this);
    this.validateCode = this.validateCode.bind(this);
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.profile = this.profile.bind(this);
  }

  @ErrorHandler()
  async sendValidationCode(req: IRequest<SendValidationCode>, res) {
    const { username } = req.body;

    if (req.session.otp) {
      throw new HttpError("Already Get One OTP", 429);
    }

    if (await this.userService.getUser(username)) {
      throw new HttpError("User Already Exist", 403);
    }

    const otp = OtpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    await this.mailService.sendMail({
      to: username,
      subject: "[ChatRoom] 註冊驗證信",
      html: this.mailService.compileTemplate("otp.html", {
        name: username,
        otp,
      }),
    });

    req.session.otp = otp;
    req.session.cookie.maxAge = 60 * 1000 * 2;

    res.status(200).send(req.body);
  }

  @ErrorHandler()
  async validateCode(req: IRequest<ValidateCodeDto>, res) {
    const { code } = new ValidateCodeDto(req.body);

    if (!req.session.otp || req.session.otp !== code) {
      throw new HttpError("OTP Expired or Invalid", 498);
    }

    res.status(200).send(req.body);
  }

  @ErrorHandler()
  async register(req: IRequest<RegisterDto>, res) {
    const { username, password } = req.body;

    if (await this.userService.getUser(username)) {
      throw new HttpError("User Already Exist", 403);
    }

    await this.userService.addUser({
      username,
      password,
    });

    await this.mailService.sendMail({
      to: username,
      subject: "[ChatRoom] 註冊成功通知",
      html: this.mailService.compileTemplate("register-success.html", {
        name: username.split("@")[0],
        email: username,
      }),
    });

    res.status(200).send(req.body);
  }

  @ErrorHandler()
  async login(req: IRequest<LoginDto>, res) {
    const loginDto = req.body;

    if ((await validate(loginDto)).length > 0) {
      throw new HttpError("Invalid Input", 400);
    }

    const { username, password } = loginDto;

    const user = await this.userService.getUser(username);

    if (!user) {
      throw new HttpError("Invalid account or password", 401);
    }

    if (user.password !== password) {
      throw new HttpError("Invalid account or password", 401);
    }

    req.session.username = user.username;
    req.session.cookie.maxAge = 1000 * 60 * 60 * 24;

    res.status(200).send(req.body);
  }

  @ErrorHandler()
  async profile(req, res) {
    if (!req.session.username) {
      throw new HttpError("Session Expired", 498);
    }

    const user = await this.userService.getUser(req.session.username);

    res.status(200).send({
      username: user.username,
    });
  }
}

export default AuthController;
