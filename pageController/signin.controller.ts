import { Page } from "playwright";
import { delay } from "../utils.js";

async function signin(page: Page, kaggleEmail: string, kagglePassword: string) {
  // Redirecting to the Kaggle website
  await page.goto("https://kaggle.com", { waitUntil: "load" });

  // Clicking the sign in button
  const signinClick = await page.$(
    "div.sc-iqziPC.gJSBDX > div:nth-child(1) > a"
  );

  // Clicking the sign in with email button
  await signinClick?.click();

  // Waiting for the sign in with email button to appear
  await delay(2000);
  const signinWithEmailClick = await page.$(
    "#site-content > div:nth-child(2) > div > div > div:nth-child(1) > form > div > div > div:nth-child(1) > button:nth-child(2)"
  );

  // Clicking the sign in with email button
  await signinWithEmailClick?.click();

  // Waiting for the email and password fields to appear
  await delay(2000);
  await page.waitForSelector(
    "#site-content > div:nth-child(2) > div > div > div:nth-child(1) > form > div > label"
  );
  const email = await page.$(
    "#site-content > div:nth-child(2) > div > div > div:nth-child(1) > form > div > label:nth-child(2) > input"
  );
  const password = await page.$(
    "#site-content > div:nth-child(2) > div > div > div:nth-child(1) > form > div > label:nth-child(3) > input"
  );
  const button = await page.$(
    "#site-content > div:nth-child(2) > div > div > div:nth-child(1) > form > div > div:nth-child(5) > button:nth-child(2)"
  );

  // Filling the email and password fields
  await email?.fill(kaggleEmail);
  await password?.fill(kagglePassword);

  // Clicking the sign in button
  await button?.click();
}

export default signin;
