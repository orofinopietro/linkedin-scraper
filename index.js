const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
app.use(express.json());

app.post("/scrape", async (req, res) => {
  const { url } = req.body;

  if (!url) return res.status(400).json({ error: "URL é obrigatória." });

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });

    const data = await page.evaluate(() => {
      const name = document.querySelector("h1")?.innerText || "";
      const title = document.querySelector(".text-body-medium")?.innerText || "";
      const location = document.querySelector(".text-body-small")?.innerText || "";
      const about = document.querySelector('section[aria-label="Sobre"]')?.innerText || "";

      return { name, title, location, about };
    });

    await browser.close();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (_, res) => res.send("Scraper ativo"));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
