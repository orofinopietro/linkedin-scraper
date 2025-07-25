const express = require('express');
const puppeteer = require('puppeteer-core');
const chromium = require('chrome-aws-lambda');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', async (req, res) => {
  const profileUrl = req.query.url;

  if (!profileUrl) {
    return res.status(400).json({ error: 'Missing LinkedIn profile URL in "url" query param.' });
  }

  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto(profileUrl, { waitUntil: 'networkidle2' });

    // Ajuste conforme os dados que quer extrair
    const name = await page.$eval('.text-heading-xlarge', el => el.innerText);

    await browser.close();

    res.json({ name });
  } catch (error) {
    res.status(500).json({ error: 'Failed to scrape LinkedIn profile', details: error.toString() });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
