import {
  Response as ExpressResponse,
  Request as ExpressRequest,
} from "express";

export type Request<Body = any, Query = any> = {
  query: Query;
  body: Body;
  session: any;
} & ExpressRequest;

export type Response = {} & ExpressResponse;
