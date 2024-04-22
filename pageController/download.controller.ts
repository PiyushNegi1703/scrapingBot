import { Page } from "playwright";
import { delay } from "../utils.js";

async function download(page: Page) {
  // Redirecting to the csv file page
  await page.goto(
    "https://www.kaggle.com/datasets/thedevastator/us-baby-names-by-year-of-birth?select=babyNamesUSYOB-full.csv",
    { waitUntil: "load" }
  );

  // Waiting for the download event to occur
  const downloadPromise = page.waitForEvent("download");

  // Waiting for the page to load
  await delay(2000);

  // Clicking the download button
  const downloadButton = await page.$("div.sc-dmXMPJ");
  await downloadButton?.click();

  // Waiting for the download to complete
  const download = await downloadPromise;

  // Saving the file to the csv folder
  await download.saveAs("./csv/" + download.suggestedFilename());
}

export default download;
