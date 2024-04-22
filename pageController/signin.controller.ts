import { Page } from "playwright";
import { delay } from "../utils.js";

async function signin(page: Page, kaggleEmail: string, kagglePassword: string) {
  // Redirecting to the Kaggle website
  await page.goto("https://kaggle.com", { waitUntil: "load" });

  // Clicking the sign in button
  await page.waitForSelector("div.sc-eXzmLu");
  const signinClick = await page.$("div.sc-eXzmLu");

  // Clicking the sign in with email button
  await signinClick?.click();

  // Waiting for the sign in with email button to appear
  await delay(2000);
  await page.waitForSelector('button[role="button"]');
  const signinWithEmailClick = await page.$$('button[role="button"]');

  // Clicking the sign in with email button
  await signinWithEmailClick[1].click();

  // Waiting for the email and password fields to appear
  await delay(2000);
  const email = await page.$('input[name="email"]');
  const password = await page.$('input[name="password"]');
  const button = await page.$('button[type="submit"]');

  // Filling the email and password fields
  await email?.fill(kaggleEmail);
  await password?.fill(kagglePassword);

  // Clicking the sign in button
  await button?.click();
}

export default signin;
