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

    const fields: {
      pathname: string;
    } & { [key: string]: unknown } = {
      pathname: "",
    };

    const buffers: Uint8Array[] = [];
    let fullFilePath = "";

    bb.on("field", async (name, value) => {
      fields[name] = value;
    });

    bb.on("file", async (_name, file, info) => {
      file
        .on("data", (data) => {
          buffers.push(data);
        })
        .on("end", async () => {
          fullFilePath = `${fields.pathname}${info.filename}`;

          const uploadEvent = new Upload({
            client: this.client,
            params: {
              Bucket: Env.AWS_S3_BUCKET_NAME,
              Key: fullFilePath,
              Body: Buffer.concat(buffers),
            },
          });

          await uploadEvent.done();

          res.json({
            file_url: `https://chatroom-cdn.guychienll.dev/${fullFilePath}`,
          });
        });
    });

    req.pipe(bb);
  }
}

export default FileController;
