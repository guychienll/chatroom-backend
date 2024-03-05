import ErrorHandler from "@/decorator/ErrorHandler";
import RequestBodyValidator from "@/decorator/Validator";
import ConsumeOtpDto from "@/dto/Auth/ConsumeOtpDto";
import GenerateOtpDto from "@/dto/Auth/GenerateOtpDto";
import LoginDto from "@/dto/Auth/LoginDto";
import RegisterDto from "@/dto/Auth/RegisterDto";
import {
  ConflictError,
  EntityNotFoundError,
  TooManyRequestsError,
  UnauthorizedError,
} from "@/model/HttpError";
import MailService from "@/service/MailService";
import UserService from "@/service/UserService";
import { Request, Response } from "@/types/Http";
import { MailTemplate } from "@/types/Mail";
import { OtpType } from "@/types/Auth";
import OtpGenerator from "otp-generator";
import UpdatePasswordDto from "../dto/Auth/UpdatePasswordDto";

class AuthController {
  private userService: UserService;
  private mailService: MailService;

  constructor(userService: UserService, mailService: MailService) {
    this.userService = userService;
    this.mailService = mailService;
    this.generateOtp = this.generateOtp.bind(this);
    this.consumeOtp = this.consumeOtp.bind(this);
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.updatePassword = this.updatePassword.bind(this);
    this.logout = this.logout.bind(this);
  }

  @ErrorHandler()
  @RequestBodyValidator(GenerateOtpDto)
  async generateOtp(req: Request<GenerateOtpDto>, res: Response) {
    const { username, otpType } = req.body;

    if (otpType === OtpType.FORGET_PASSWORD) {
      const user = await this.userService.getUser(username);

      if (!user) {
        throw new EntityNotFoundError();
      }
    }

    if (req.session.otp) {
      throw new TooManyRequestsError();
    }

    const otp = OtpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    await this.mailService.sendMail({
      to: username,
      subject: "[ChatRoom] 驗證信",
      html: this.mailService.compileTemplate(MailTemplate.otp, {
        username,
        otp,
      }),
    });

    req.session.username = username;
    req.session.otp = otp;
    req.session.otpType = otpType;
    req.session.cookie.maxAge = 60 * 1000 * 1;

    res.status(200).send(req.body);
  }

  @ErrorHandler()
  @RequestBodyValidator(ConsumeOtpDto)
  async consumeOtp(req: Request<ConsumeOtpDto>, res: Response) {
    const { otp, type } = req.body;

    if (!!req.session.otpType && req.session.otpType !== type) {
      throw new UnauthorizedError();
    }

    if (!req.session.otp || req.session.otp !== otp) {
      throw new UnauthorizedError();
    }

    delete req.session.username;
    delete req.session.otp;
    delete req.session.otpType;

    res.status(200).send(req.body);
  }

  @ErrorHandler()
  @RequestBodyValidator(UpdatePasswordDto)
  async updatePassword(req: Request<UpdatePasswordDto>, res: Response) {
    const { password, otp, otpType } = req.body;
    const username = req.session.username;

    if (!!req.session.otpType && req.session.otpType !== otpType) {
      throw new UnauthorizedError();
    }

    if (!req.session.otp || req.session.otp !== otp) {
      throw new UnauthorizedError();
    }

    await this.userService.updatePassword(username, password);

    await this.mailService.sendMail({
      to: username,
      subject: "[ChatRoom] 密碼變更通知信",
      html: this.mailService.compileTemplate(
        MailTemplate.update_password_success,
        { username }
      ),
    });

    delete req.session.username;
    delete req.session.otp;
    delete req.session.otpType;

    res.status(200).send({
      message: "success",
    });
  }

  @ErrorHandler()
  @RequestBodyValidator(RegisterDto)
  async register(req: Request<RegisterDto>, res: Response) {
    const { username, password } = req.body;

    if (await this.userService.getUser(username)) {
      throw new ConflictError();
    }

    await this.userService.add({
      username,
      password,
    });

    await this.mailService.sendMail({
      to: username,
      subject: "[ChatRoom] 註冊成功通知",
      html: this.mailService.compileTemplate(MailTemplate.register_success, {
        name: username.split("@")[0],
        email: username,
      }),
    });

    res.status(200).send(req.body);
  }

  @ErrorHandler()
  @RequestBodyValidator(LoginDto)
  async login(req: Request<LoginDto>, res: Response) {
    const { username, password } = req.body;

    const user = await this.userService.getUser(username, true);

    if (!user) {
      throw new UnauthorizedError();
    }

    if (user.password !== password) {
      throw new UnauthorizedError();
    }

    req.session.profile = {
      username: user.username,
    };
    req.session.cookie.maxAge = 1000 * 60 * 60 * 24;

    res.status(200).send(req.body);
  }

  @ErrorHandler()
  async logout(req: Request, res: Response) {
    req.session.destroy();

    res.status(200).send({});
  }
}

export default AuthController;
