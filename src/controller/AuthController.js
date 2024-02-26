import db from "@/db";
import ErrorHandler from "@/decorator/ErrorHandler";
import Schema from "@/decorator/Schema";
import LoginDto from "@/dto/Auth/LoginDto";
import RegisterDto from "@/dto/Auth/RegisterDto";
import SendValidationCode from "@/dto/Auth/SendValidationCodeDto";
import ValidateCodeDto from "@/dto/Auth/ValidCodeDto";
import HttpError from "@/model/HttpError";
import MailService from "@/service/MailService";
import OtpGenerator from "otp-generator";

class AuthController {
  #userService;

  constructor(userService) {
    this.#userService = userService;
  }

  @ErrorHandler
  @Schema("send_validation_code")
  async sendValidationCode(req, res) {
    const { username: email } = new SendValidationCode(req.body);

    if (req.session.otp) {
      throw new HttpError("Already Get One OTP", 429);
    }

    const snapshot = await db
      .collection("user")
      .where("username", "==", email)
      .get();

    if (!snapshot.empty) {
      throw new HttpError("User Already Exist", 403);
    }

    const otp = OtpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    await MailService.sendMail({
      from: '"ChatRoom" <chatroom.noreply@gmail.com>',
      to: email,
      subject: "[ChatRoom] 註冊驗證信",
      html: MailService.compileTemplate("otp.html", {
        name: email,
        otp,
      }),
    });

    req.session.otp = otp;
    req.session.cookie.maxAge = 60 * 1000 * 2;

    res.send(req.body);
  }

  @ErrorHandler
  @Schema("validate_code")
  async validateCode(req, res) {
    const { code } = new ValidateCodeDto(req.body);

    if (!req.session.otp || req.session.otp !== code) {
      throw new HttpError("OTP Expired or Invalid", 498);
    }

    res.send(req.body);
  }

  @ErrorHandler
  @Schema("register")
  async register(req, res) {
    const { username, password } = new RegisterDto(req.body);

    const snapshot = await db
      .collection("user")
      .where("username", "==", username)
      .get();

    if (!snapshot.empty) {
      throw new HttpError("User Already Exist", 403);
    }

    await db.collection("user").add({
      username,
      password,
    });

    await MailService.sendMail({
      from: '"ChatRoom" <chatroom.noreply@gmail.com>',
      to: username,
      subject: "[ChatRoom] 註冊成功通知",
      html: MailService.compileTemplate("register-success.html", {
        name: username.split("@")[0],
        email: username,
      }),
    });

    res.send(req.body);
  }

  @ErrorHandler
  @Schema("login")
  async login(req, res) {
    const { username, password } = new LoginDto(req.body);
    const snapshot = await db
      .collection("user")
      .where("username", "==", username)
      .get();

    if (snapshot.empty) {
      throw new HttpError("Invalid account or password", 401);
    }

    let existUser = null;
    snapshot.forEach((doc) => {
      existUser = doc.data();
    });

    if (existUser.password !== password) {
      throw new HttpError("Invalid account or password", 401);
    }

    req.session.username = existUser.username;
    req.session.cookie.maxAge = 1000 * 60 * 60 * 24;

    res.send(req.body);
  }

  @ErrorHandler
  async profile(req, res) {
    if (!req.session.username) {
      throw new HttpError("Session Expired", 498);
    }

    const user = await this.#userService.getUser(req.session.username);

    res.status(200).send({
      username: user.username,
    });
  }
}

export default AuthController;
