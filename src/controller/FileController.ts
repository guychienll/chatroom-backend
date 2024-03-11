import Env from "@/config";
import ErrorHandler from "@/decorator/ErrorHandler";
import { Request, Response } from "@/types/Http";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import busboy from "busboy";

class FileController {
  private client: S3Client;

  constructor() {
    this.client = new S3Client({ region: "ap-east-1" });
    this.upload = this.upload.bind(this);
  }

  @ErrorHandler()
  async upload(req: Request, res: Response) {
    const { headers } = req;
    const bb = busboy({ headers });

    bb.on("file", async (_name, file, info) => {
      const uploadEvent = new Upload({
        client: this.client,
        params: {
          Bucket: Env.AWS_S3_BUCKET_NAME,
          Key: info.filename,
          Body: file,
        },
      });

      await uploadEvent.done();

      res.status(201).json({
        file_url: `https://chatroom-cdn.guychienll.dev/${info.filename}`,
      });
    });

    req.pipe(bb);
  }
}

export default FileController;
