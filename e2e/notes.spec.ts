import { test, expect } from '@playwright/test'

test('can be created', async ({ page }) => {
  await page.goto('http://localhost:3000/')
  await page.click('text=Create')
  await page.click('text=Create Note Locally')
  await page.fill('textarea[name=note]', 'hello')
  await page.click('text=Notes')
  const text = await page.innerText('body')
  await page.waitForSelector('text=Create')
  expect(text).toEqual(expect.stringContaining('hello'))
})
