import { Request, RequestHandler, Response } from "express";
import {
  IResponse,
} from "../types/requestTypes";

export const createCart: RequestHandler = async (
  req: Request<object, object, unknown>,
  res: Response<IResponse>
) => {
    console.log(req.body)
  res.status(200).json({ message: "sent!", status: true });
};
