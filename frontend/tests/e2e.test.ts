import { test, expect } from "@playwright/test";

let analysisUrl: string = "http://localhost:5173/analysis/267d0d19-77fc-4041-a797-17eb7e086cf7";
let characterAnalysisOverviewUrl: string;
let characterAnalysisUrl: string;
let plotAnalysisOverviewUrl: string;
let plotAnalysisChapterUrl: string;
let novelID: string;

test.describe("End-to-end tests", () => {
    test("should load the app and display the home page", async ({ page }) => {
        await page.goto("http://localhost:5173");
        await page.waitForSelector("h1");
        const title = await page.textContent("h1");
        expect(title).toBe("What Did I Just Read?");
    });

    test("should navigate to the contact page", async ({ page }) => {
        await page.goto("http://localhost:5173");
        await page.click('#root > div > div > nav > ul > li:nth-child(2)');
        await page.waitForSelector("h1");
        const title = await page.textContent("h1");
        expect(title).toBe("Contact");
    });

    test("should open file dialog when clicking 'Upload a Book", async ({ page }) => {
        await page.goto("http://localhost:5173");
        const [fileChooser] = await Promise.all([
            page.waitForEvent("filechooser"),
            page.click("#root > div > div > div > div.flex.gap-4 > button.bg-brand-cta.text-white.font-dewi.py-2.px-4.rounded-4xl.cursor-pointer.hover\\:bg-brand-cta-hover.disable.disabled\\:bg-gray-400.disabled\\:cursor-not-allowed.duration-300.transition-all")
        ]);
        expect(fileChooser).toBeTruthy();
    });

    test("should start processing a book and display the analysis results after processing is complete", async ({ page }) => {
        test.setTimeout(600000);

        await page.goto("http://localhost:5173");
        const [fileChooser] = await Promise.all([
            page.waitForEvent("filechooser"),
            page.click("#root > div > div > div > div.flex.gap-4 > button.bg-brand-cta.text-white.font-dewi.py-2.px-4.rounded-4xl.cursor-pointer.hover\\:bg-brand-cta-hover.disable.disabled\\:bg-gray-400.disabled\\:cursor-not-allowed.duration-300.transition-all")
        ]);
        await fileChooser.setFiles("../../backend/app/temp/aaiw.epub");
        await page.waitForSelector("#root > div > div");
        await page.waitForSelector("h1");
        const title = await page.textContent("h1");
        expect(title).toBe("Alice's Adventures in Wonderland");
        analysisUrl = await page.url();
    });

    test("should display the analysis results when navigating directly to the analysis page", async ({ page }) => {
        test.setTimeout(600000);
        
        await page.goto(analysisUrl);
        await page.waitForSelector("#root > div > div");
        await page.waitForSelector("h1");
        const title = await page.textContent("h1");
        expect(title).toBe("Alice's Adventures in Wonderland");
    });

    test("character conversational network should be visible and populated with nodes and edges", async ({ page }) => {
        novelID = analysisUrl.split("/").pop() || "";
        characterAnalysisOverviewUrl = `http://localhost:5173/character-analysis/${novelID}`;

        await page.goto(characterAnalysisOverviewUrl);
        await page.waitForSelector("#network-graph-1");
        const nodes = await page.$$eval("#network-graph-1 > svg > g:nth-child(1) > g.links", (elements) => elements.length);
        const edges = await page.$$eval("#network-graph-1 > svg > g:nth-child(1) > g.nodes", (elements) => elements.length);
        expect(nodes).toBeGreaterThan(0);
        expect(edges).toBeGreaterThan(0);
    });

    test("character profile should be visible and populated with character information", async ({ page }) => {
        await page.goto(characterAnalysisOverviewUrl);
        await page.waitForSelector("#root > div > div.py-18 > div.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.gap-6 > div:nth-child(1)");
        await page.click("#root > div > div.py-18 > div.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.gap-6 > div:nth-child(1)");
        const characterName = await page.textContent("#root > div > div > div.font-serif.text-center.justify-between.flex.flex-row.items-center > div:nth-child(2) > h1");
        const characterDescription = await page.textContent("#root > div > div > div.flex.flex-row.gap-24.mt-8 > div.flex.flex-col.gap-4.flex-\\[2\\] > div.font-serif.text-gray-900.whitespace-pre-wrap");
        characterAnalysisUrl = await page.url();
        expect(characterName).toBeTruthy();
        expect(characterDescription).toBeTruthy();
    });

    test("closely related characters section has at least one entry", async ({ page }) => {
        await page.goto(characterAnalysisUrl);
        await page.waitForSelector("#root > div > div > div.flex.flex-row.gap-24.mt-8 > div.flex-1.flex-col.min-w-\\[280px\\] > div:nth-child(1) > div:nth-child(3)");
        const relatedCharacterText =  await page.textContent("#root > div > div > div.flex.flex-row.gap-24.mt-8 > div.flex-1.flex-col.min-w-\\[280px\\] > div:nth-child(1) > div:nth-child(3) > div > div.flex-1 > h2");
        expect(relatedCharacterText?.length).toBeGreaterThan(0);
    });

    test("character top quotes section has at least one quote", async ({ page }) => {
        await page.goto(characterAnalysisUrl);
        await page.waitForSelector("#root > div > div > div.flex.flex-row.gap-24.mt-8 > div.flex-1.flex-col.min-w-\\[280px\\] > div.mt-16.border.border-gray-300.rounded-lg.p-4.shadow-md > div.max-h-\\[400px\\].overflow-y-auto.pr-2 > div:nth-child(1) > p.italic.text-sm.text-gray-800");
        const topQuotesText =  await page.textContent("#root > div > div > div.flex.flex-row.gap-24.mt-8 > div.flex-1.flex-col.min-w-\\[280px\\] > div.mt-16.border.border-gray-300.rounded-lg.p-4.shadow-md > div.max-h-\\[400px\\].overflow-y-auto.pr-2 > div:nth-child(1) > p.italic.text-sm.text-gray-800");
        expect(topQuotesText?.length).toBeGreaterThan(0);
    });

    test("plot analysis overview should display populated plot sentiment graph", async ({ page }) => {
        plotAnalysisOverviewUrl = `http://localhost:5173/plot-analysis/${novelID}`;
        await page.goto(plotAnalysisOverviewUrl);
        const areaChartSelector = await page.waitForSelector("#areaChartContainer > svg > g:nth-child(2) > g");
        expect(areaChartSelector).toBeTruthy();
        const children = await areaChartSelector.$$('line');
        expect(children.length).toBeGreaterThan(0);
    });

    test("chapter grid should be populated with chapter cards", async ({ page }) => {
        await page.goto(plotAnalysisOverviewUrl);
        await page.waitForSelector("#root > div > div.flex.flex-col.gap-4.mt-4 > div.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.gap-4");
        const chapterCards = await page.$$("#root > div > div.flex.flex-col.gap-4.mt-4 > div.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.gap-4 > div");
        expect(chapterCards.length).toBeGreaterThan(0);
    });

    test("chapter detail page should display chapter information and sentiment graph", async ({ page }) => {
        await page.goto(plotAnalysisOverviewUrl);
        await page.waitForSelector("#root > div > div.flex.flex-col.gap-4.mt-4 > div.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.gap-4 > div:nth-child(1)");
        await page.click("#root > div > div.flex.flex-col.gap-4.mt-4 > div.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.gap-4 > div:nth-child(1)");
        const chapterTitle = await page.textContent("#root > div > div:nth-child(2) > div:nth-child(2) > div.font-serif.text-center.justify-between.flex.flex-row.items-center > h1");
        expect(chapterTitle).toBeTruthy();
        plotAnalysisChapterUrl = await page.url();
    });

    test("key characters section should have at least one character listed", async ({ page }) => {
        await page.goto(plotAnalysisChapterUrl);
        await page.waitForSelector("#root > div > div:nth-child(2) > div:nth-child(2) > div.flex.flex-col.md\\:flex-row.font-dewi.text-md.mt-6.gap-6 > div.flex-3.md\\:flex-1 > div.border.border-gray-300.rounded-lg.p-4.w-full.h-fit.shadow-md");
        const firstCharacter = await page.waitForSelector("#root > div > div:nth-child(2) > div:nth-child(2) > div.flex.flex-col.md\\:flex-row.font-dewi.text-md.mt-6.gap-6 > div.flex-3.md\\:flex-1 > div.border.border-gray-300.rounded-lg.p-4.w-full.h-fit.shadow-md > ul > div:nth-child(1)");
        expect(firstCharacter).toBeTruthy();
        const firstCharacterText = await page.textContent("#root > div > div:nth-child(2) > div:nth-child(2) > div.flex.flex-col.md\\:flex-row.font-dewi.text-md.mt-6.gap-6 > div.flex-3.md\\:flex-1 > div.border.border-gray-300.rounded-lg.p-4.w-full.h-fit.shadow-md > ul > div:nth-child(1) > div > div.flex-1 > h2");
        expect(firstCharacterText).toBeTruthy();
        expect(firstCharacterText?.length).toBeGreaterThan(0);
    });

    test("themes and motif heatmap should be visible and have at least one theme/motif listed", async ({ page }) => {
        let motifAndThemesUrl = `http://localhost:5173/themes-and-motifs/${novelID}`;
        await page.goto(motifAndThemesUrl);
        await page.waitForSelector("#root > div > div.border.border-gray-300.rounded-md.mb-8.shadow-md > div.w-full.p-4");
        const firstMotifCategory = await page.waitForSelector("#root > div > div.border.border-gray-300.rounded-md.mb-8.shadow-md > div.w-full.p-4 > svg > g > g:nth-child(1)");
        expect(firstMotifCategory).toBeTruthy();
        const firstMotifCategoryText = await page.textContent("#root > div > div.border.border-gray-300.rounded-md.mb-8.shadow-md > div.w-full.p-4 > svg > g > g:nth-child(1) > title");
        expect(firstMotifCategoryText).toBeTruthy();
        expect(firstMotifCategoryText?.length).toBeGreaterThan(0);
    });

    test("vocabulary richness section should display a populated bar chart", async ({ page }) => {
        let vocabularyRichnessUrl = `http://localhost:5173/vocabulary/${novelID}`;
        await page.goto(vocabularyRichnessUrl);
        await page.waitForSelector("#root > div > div.border.border-gray-300.rounded-lg.p-4 > div.recharts-responsive-container");
        const firstBar = await page.waitForSelector("#recharts-bar-_r_1_ > g > g > g:nth-child(1) > path");
        expect(firstBar).toBeTruthy();
    });

    test("character interactions should show a line chart with at least one line", async ({ page }) => {
        let characterInteractionsUrl = `http://localhost:5173/character-interactions/${novelID}`;
        await page.goto(characterInteractionsUrl);
        await page.waitForSelector("#root > div > div.flex.flex-col.gap-6 > div > div.recharts-responsive-container > div > div > svg");
        const firstLine = await page.waitForSelector("#root > div > div.flex.flex-col.gap-6 > div > div.recharts-responsive-container > div > div > svg > g:nth-child(7) > g > g");
        expect(firstLine).toBeTruthy();
    });

    test("character occurences shows heatmap with at least one character listed", async ({ page }) => {
        let characterOccurencesUrl = `http://localhost:5173/character-occurences/${novelID}`;
        await page.goto(characterOccurencesUrl);
        await page.waitForSelector("#root > div > div.border.rounded-lg.p-4 > div:nth-child(3) > svg");
        const firstCharacter = await page.waitForSelector("#root > div > div.border.rounded-lg.p-4 > div:nth-child(3) > svg > g > g:nth-child(2) > g:nth-child(1) > text");
        expect(firstCharacter).toBeTruthy();
        const firstCharacterText = await page.textContent("#root > div > div.border.rounded-lg.p-4 > div:nth-child(3) > svg > g > g:nth-child(2) > g:nth-child(1) > text");
        expect(firstCharacterText).toBeTruthy();
        expect(firstCharacterText?.length).toBeGreaterThan(0);
    });

    test("about the author should display author name and description", async ({ page }) => {
        await page.goto(`http://localhost:5173/author/${novelID}`);
        const container = page.locator("#root > div > div:nth-child(4) > div > div").first();
        await expect(container).toBeVisible({ timeout: 5000 });

        const authorName = container.locator("h2");
        await expect.soft(authorName).not.toBeEmpty();

        const authorDescription = container.locator("p").first();
        await expect.soft(authorDescription).not.toBeEmpty();

        const otherWorks = container.locator("p").nth(1);
        if (await otherWorks.count() > 0) {
            await expect.soft(otherWorks).not.toBeEmpty();
        }
    });
});

    