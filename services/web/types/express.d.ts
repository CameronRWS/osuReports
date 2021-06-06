import { Response as OrigResponse } from "express";
import { MinimalUser } from "~/src/server/api/twitter";

declare global {
  namespace Express {
    interface User extends MinimalUser {}
    interface Response {
      flashes: string[];
      flash: (msg: string) => Response & OrigResponse;
      clearFlashes: () => Response & OrigResponse;
    }

    interface Request {
      flashes: string[];
    }
  }
}

declare module "connect" {
  interface IncomingMessage extends Express.Request {}
}

declare module "http" {
  interface ServerResponse extends Express.Response {}
}
