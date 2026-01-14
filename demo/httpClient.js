import axios from "axios";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";

export function createClient() {
  const jar = new CookieJar();

  const client = wrapper(
    axios.create({
      baseURL: "https://www.htmnbk.site/api",
      withCredentials: true,
      jar,
      headers: {
        "Content-Type": "application/json",
      },
    })
  );

  return { client, jar };
}
