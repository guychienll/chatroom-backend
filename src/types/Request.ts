export interface Request<T> extends Express.Request {
  body: T;
  session: any;
}
