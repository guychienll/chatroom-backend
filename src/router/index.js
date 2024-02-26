import AuthController from "@/controller/AuthController";
import busboy from "busboy";
import AWS from "aws-sdk";
import UserService from "@/service/UserService";

AWS.config.getCredentials((err) => {
  if (err) console.error(err.stack);
});
AWS.config.update({ region: "ap-east-1" });
const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

const auth = new AuthController(new UserService());

const use = (app) => {
  app.post("/auth/send-validation-code", auth.sendValidationCode.bind(auth));
  app.post("/auth/validate-code", auth.validateCode.bind(auth));
  app.post("/auth/register", auth.register.bind(auth));
  app.post("/auth/login", auth.login.bind(auth));
  app.get("/auth/profile", auth.profile.bind(auth));
  app.post("/upload", (req, res) => {
    const bb = busboy({ headers: req.headers });

    bb.on("file", (name, file, info) => {
      const { filename, encoding, mimeType } = info;
      console.log(
        `File [${name}]: filename: %j, encoding: %j, mimeType: %j`,
        filename,
        encoding,
        mimeType
      );

      const uploadParams = {
        Bucket: "chatroom.guychienll.dev",
        Body: file,
        Key: filename,
      };
      console.log(uploadParams);

      s3.upload(uploadParams, function (err, data) {
        if (err) {
          console.log("Error", err);
        }
        if (data) {
          console.log("Upload Success", data.Location);
          res.send({
            file_url: data.Location,
          });
        }
      });
    });
    req.pipe(bb);
  });
};

export { use };
