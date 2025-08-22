import axios from "axios";
import { GITHUB_BG_API_CONFIG } from "../config.js";

const GITHUB_TOKEN = GITHUB_BG_API_CONFIG.GITHUB_TOKEN;

export const hasQuota = async () => {
  try {
    const { data } = await axios.get("https://api.github.com/rate_limit", {
      headers: { Authorization: `token ${GITHUB_TOKEN}` },
    });
    console.log(
      `Remaining: ${data.rate.remaining}/${
        data.rate.limit
      }, Reset at: ${new Date(data.rate.reset * 1000)}`
    );
    return data.rate.remaining > 50; // Safety buffer
  } catch (err) {
    console.error(
      "Rate limit check failed:",
      err.response?.data || err.message
    );
    return false;
  }
};
