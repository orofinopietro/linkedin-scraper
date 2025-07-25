const express = require("express");
const chromium = require("chrome-aws-lambda");
const puppeteer = require("puppeteer-core");

const app = express();

app.get("/linkedin-scrape", async (req, res) => {
  const profileUrl = req.query.url;

  if (!profileUrl) {
    return res.status(400).json({ error: "Missing LinkedIn URL" });
  }

  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto(profileUrl, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    // 🔁 Teste básico: obter título da página
    const pageTitle = await page.title();
    await browser.close();

    res.json({
      status: "Browser funcionou!",
      title: pageTitle,
    });

  } catch (error) {
    console.error("Scraping failed", error);
    res.status(500).json({
      error: "Failed to scrape LinkedIn profile",
      details: error.toString(),
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
