import Env from "@/config";
import authRouter from "@/router/authRouter";
import userRouter from "@/router/userRouter";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import busboy from "busboy";

const client = new S3Client({ region: "ap-east-1" });

const use = (app) => {
  app.use("/auth", authRouter);
  app.use("/user", userRouter);

  app.post("/upload", (req, res) => {
    const bb = busboy({ headers: req.headers });

    bb.on("file", async (_name, file, info) => {
      const { filename } = info;
      try {
        const upload = new Upload({
          client,
          params: {
            Bucket: Env.AWS_S3_BUCKET_NAME,
            Key: filename,
            Body: file,
          },
        });

        upload.on("httpUploadProgress", (progress) => {
          console.log(progress);
        });

        const resp = await upload.done();
        res.send({
          file_url: resp.Location,
        });
      } catch (e) {
        console.log(e);
      }
    });
    req.pipe(bb);
  });
};

export { use };
