import asyncio
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        try:
            await page.goto("http://localhost:3000")

            # Wait for the main heading of the company list
            await expect(page.get_by_role("heading", name="Mina Företag")).to_be_visible(timeout=10000)

            # Check if there are any companies listed
            # The list is a `ul` element inside a div with class "bg-white"
            company_list = page.locator('div.bg-white ul li')

            # Take a screenshot
            await page.screenshot(path="jules-scratch/verification/verification.png")

        except Exception as e:
            print(f"An error occurred: {e}")
            # Still take a screenshot to see the state of the page on error
            await page.screenshot(path="jules-scratch/verification/error.png")

        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
