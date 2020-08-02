import { Profile } from "passport-twitter";
import { Response as OrigResponse } from "express";

declare global {
  namespace Express {
    interface User extends Profile {}
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
