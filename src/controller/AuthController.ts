import ErrorHandler from "@/decorator/ErrorHandler";
import LoginDto from "@/dto/Auth/LoginDto";
import RegisterDto from "@/dto/Auth/RegisterDto";
import GenerateOtpDto from "@/dto/Auth/GenerateOtpDto";
import ConsumeOtpDto from "@/dto/Auth/ConsumeOtpDto";
import HttpError from "@/model/HttpError";
import MailService from "@/service/MailService";
import UserService from "@/service/UserService";
import { OtpType } from "@/types/OtpType";
import { Request } from "@/types/Request";
import { validate } from "class-validator";
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
  async generateOtp(req: Request<GenerateOtpDto>, res) {
    const reqBody = new GenerateOtpDto(req.body);
    if ((await validate(reqBody)).length > 0) {
      throw new HttpError("Invalid Input", 400);
    }
    const { username, otpType } = reqBody;

    if (otpType === OtpType.FORGET_PASSWORD) {
      const user = await this.userService.get(username);

      if (!user) {
        throw new HttpError("User Not Found", 404);
      }
    }

    if (req.session.otp) {
      throw new HttpError("Already Get One OTP", 429);
    }

    const otp = OtpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    await this.mailService.sendMail({
      to: username,
      subject: "[ChatRoom] 驗證信",
      html: this.mailService.compileTemplate("otp.html", {
        name: username,
        otp,
      }),
    });

    req.session.username = username;
    req.session.otp = otp;
    req.session.otpType = reqBody.otpType;
    req.session.cookie.maxAge = 60 * 1000 * 1;

    res.status(200).send(reqBody);
  }

  @ErrorHandler()
  async consumeOtp(req: Request<ConsumeOtpDto>, res) {
    const reqBody = new ConsumeOtpDto(req.body);

    if ((await validate(reqBody)).length > 0) {
      throw new HttpError("Invalid Input", 400);
    }

    const { otp, type } = reqBody;

    if (!!req.session.otpType && req.session.otpType !== type) {
      throw new HttpError("invalid token", 401);
    }

    if (!req.session.otp || req.session.otp !== otp) {
      throw new HttpError("OTP Expired or Invalid", 498);
    }

    delete req.session.username;
    delete req.session.otp;
    delete req.session.otpType;

    res.status(200).send(reqBody);
  }

  @ErrorHandler()
  async updatePassword(req: Request<UpdatePasswordDto>, res) {
    const reqBody = new UpdatePasswordDto(req.body);

    if ((await validate(reqBody)).length > 0) {
      throw new HttpError("Invalid Input", 400);
    }

    const { password, otp, otpType } = reqBody;
    const username = req.session.username;

    if (!!req.session.otpType && req.session.otpType !== otpType) {
      throw new HttpError("invalid token", 401);
    }

    if (!req.session.otp || req.session.otp !== otp) {
      throw new HttpError("OTP Expired or Invalid", 498);
    }

    await this.userService.updatePassword(username, password);

    await this.mailService.sendMail({
      to: username,
      subject: "[ChatRoom] 密碼變更通知信",
      html: this.mailService.compileTemplate("update-password-success.html", {
        name: username,
      }),
    });

    delete req.session.username;
    delete req.session.otp;
    delete req.session.otpType;

    res.status(200).send({
      message: "Password Updated",
    });
  }

  @ErrorHandler()
  async register(req: Request<RegisterDto>, res) {
    const reqBody = new RegisterDto(req.body);

    if ((await validate(reqBody)).length > 0) {
      throw new HttpError("Invalid Input", 400);
    }

    const { username, password } = reqBody;

    if (await this.userService.get(username)) {
      throw new HttpError("User Already Exist", 403);
    }

    await this.userService.add({
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

    res.status(200).send(reqBody);
  }

  @ErrorHandler()
  async login(req: Request<LoginDto>, res) {
    const reqBody = new LoginDto(req.body);
    if ((await validate(reqBody)).length > 0) {
      throw new HttpError("Invalid Input", 400);
    }

    const { username, password } = reqBody;

    const user = await this.userService.get(username);

    if (!user) {
      throw new HttpError("Invalid account or password", 401);
    }

    if (user.password !== password) {
      throw new HttpError("Invalid account or password", 401);
    }

    req.session.profile = {
      username: user.username,
    };
    req.session.cookie.maxAge = 1000 * 60 * 60 * 24;

    res.status(200).send(reqBody);
  }

  @ErrorHandler()
  async logout(req, res) {
    req.session.destroy();

    res.status(200).send({});
  }
}

export default AuthController;
