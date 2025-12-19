import { auth, toNextJsHandler } from "@gladia-app/auth/server";

export const { POST, GET } = toNextJsHandler(auth);