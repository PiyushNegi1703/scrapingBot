import { Page } from "playwright";

async function download(page: Page) {
  // Redirecting to the csv file page
  await page.goto(
    "https://www.kaggle.com/datasets/thedevastator/us-baby-names-by-year-of-birth?select=babyNamesUSYOB-full.csv",
    { waitUntil: "load" }
  );

  // Waiting for the download event to occur
  const downloadPromise = page.waitForEvent("download");

  // Waiting for the download button to appear
  await page.waitForSelector(
    "#site-content > div:nth-child(2) > div > div:nth-child(2) > div > div:nth-child(5) > div:nth-child(4) > div > div > div:nth-child(1) > div > div:nth-child(1) > div:nth-child(2)"
  );

  // Clicking the download button
  const downloadButton = await page.$(
    "#site-content > div:nth-child(2) > div > div:nth-child(2) > div > div:nth-child(5) > div:nth-child(4) > div > div > div:nth-child(1) > div > div:nth-child(1) > div:nth-child(2)"
  );
  await downloadButton?.click();

  // Waiting for the download to complete
  const download = await downloadPromise;

  // Saving the file to the csv folder
  await download.saveAs("./csv/" + download.suggestedFilename());
}

export default download;
