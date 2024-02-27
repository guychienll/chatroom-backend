import AWS from "aws-sdk";
import busboy from "busboy";
import authRouter from "./auth";

AWS.config.getCredentials((err) => {
  if (err) console.error(err.stack);
});
AWS.config.update({ region: "ap-east-1" });
const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

const use = (app) => {
  app.use("/auth", authRouter);
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

      s3.upload(
        {
          Bucket: "chatroom.guychienll.dev",
          Body: file,
          Key: filename,
        },
        (err, data) => {
          if (err) {
            console.log("Error", err);
          }

          if (data) {
            console.log("Upload Success", data.Location);
            res.send({
              file_url: data.Location,
            });
          }
        }
      );
    });
    req.pipe(bb);
  });
};

export { use };
