import {
  Response as ExpressResponse,
  Request as ExpressRequest,
} from "express";
import { OtpType } from "./Auth";
import session from "express-session";

export type Request<Body = any, Query = any> = {
  query: Query;
  body: Body;
  session: {
    username?: string;
    otp?: string;
    otpType?: OtpType;
    profile?: {
      username: string;
    };
    [key: string]: any;
  } & session.Session;
} & ExpressRequest;

export type Response = {} & ExpressResponse;
