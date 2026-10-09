import { test, expect } from "@playwright/test";
const password = "ShopKartTest123!";
const email = `browser-${Date.now()}@example.com`;
test("complete customer journey: register, discover, wishlist, cart, COD, orders and logout", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/home");
  await expect(
    page.getByRole("heading", { name: /Less ordinary/ }),
  ).toBeVisible();
  await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0); });
  await page.screenshot({
    path: "../../.artifacts/home-desktop.png",
    fullPage: true,
  });
  await page.goto("/register");
  await page.getByLabel("Full name").fill("Browser Tester");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Mobile number").fill("9876543210");
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByText("Your account is ready.")).toBeVisible();
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/home/);
  await page.goto("/products");
  await expect(page.locator(".product-card").first()).toBeVisible();
  await page.getByRole("button", { name: "Electronics" }).click();
  await expect(page).toHaveURL(/category=Electronics/);
  await expect(page.locator(".product-badge").first()).toHaveText(
    "Electronics",
  );
  await page.getByLabel("Search products").fill("Keyboard");
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page.getByRole("heading", { name: "Wireless Mechanical Keyboard", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Wireless Mechanical Keyboard", exact: true })).toBeVisible();

  await page
    .getByRole("button", { name: "Add to wishlist", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Remove from wishlist", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page
    .getByRole("button", { name: "Remove from wishlist", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Add to wishlist", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  await page
    .getByRole("button", { name: "Add to wishlist", exact: true })
    .click();
  await page.goto("/wishlist");
  await expect(
    page.getByRole("heading", { name: "Wireless Mechanical Keyboard" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Add to bag", exact: true }).click();
  await expect(page.getByRole("button", { name: /Add another/ })).toBeVisible();
  await page.goto("/cart");
  await page
    .getByRole("button", {
      name: "Increase Wireless Mechanical Keyboard quantity",
    })
    .click();
  await expect(page.locator(".quantity-control span")).toHaveText("2");
  await page
    .getByRole("button", {
      name: "Decrease Wireless Mechanical Keyboard quantity",
    })
    .click();
  await expect(page.locator(".quantity-control span")).toHaveText("1");
  await page.getByRole("link", { name: "Proceed to checkout" }).click();
  await page.getByRole("button", { name: "Place order", exact: true }).click();
  await expect(page.getByText("Street address is required")).toBeVisible();
  await page.getByLabel("Street address").fill("12 Test Street");
  await page.getByLabel("City", { exact: true }).fill("New Delhi");
  await page.getByLabel("State", { exact: true }).fill("Delhi");
  await page.getByLabel("Pincode").fill("110001");
  await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0); });
  await page.screenshot({
    path: "../../.artifacts/checkout-desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Place order", exact: true }).click();
  await expect(page).toHaveURL(/\/orders\/[a-f0-9]+$/);
  await expect(
    page.getByRole("heading", { name: "Thank you for your order." }),
  ).toBeVisible();
  await expect(page.getByText("Due on delivery")).toBeVisible();
  await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0); });
  await page.screenshot({
    path: "../../.artifacts/order-desktop.png",
    fullPage: true,
  });
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Thank you for your order." }),
  ).toBeVisible();
  await page.goto("/cart");
  await expect(
    page.getByRole("heading", { name: "Your bag is empty." }),
  ).toBeVisible();
  await page.goto("/orders");
  await expect(page.locator(".order-card")).toHaveCount(1);
  await page.goto("/wishlist");
  await page.getByRole("button", { name: "Remove Wireless Mechanical Keyboard from wishlist" }).click();
  await expect(page.getByRole("heading", { name: "Your wishlist is waiting." })).toBeVisible();

  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "Sign in", exact: true }),
  ).toBeVisible();
  await page.goto("/orders");
  await expect(page).toHaveURL(/\/login/);
  expect(errors).toEqual([]);
});
test("catalog sort, empty results, theme persistence and responsive navigation", async ({
  page,
}) => {
  await page.goto("/products");
  await expect(page.locator(".product-card").first()).toBeVisible();
  await page.getByLabel("Sort products").selectOption("price-asc");
  await expect(page).toHaveURL(/sort=price-asc/);
  await expect
    .poll(async () => {
      const prices = await page
        .locator(".product-bottom strong")
        .allTextContents();
      const numbers = prices.map((price) =>
        Number(price.replace(/[^0-9.]/g, "")),
      );
      return (
        numbers.length > 0 &&
        JSON.stringify(numbers) ===
          JSON.stringify([...numbers].sort((a, b) => a - b))
      );
    })
    .toBe(true);
  await page.getByLabel("Search products").fill("NoProductMatchesThis");
  await expect(
    page.getByRole("heading", { name: "No finds this time." }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();
  await expect(page.locator(".product-card").first()).toBeVisible();
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0); });
  await page.screenshot({
    path: "../../.artifacts/catalog-dark.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open menu" }).click();
  await page
    .getByRole("navigation", { name: "Main navigation" })
    .getByRole("link", { name: "Home", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: /Less ordinary/ }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Open menu" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0); });
  await page.screenshot({
    path: "../../.artifacts/home-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await page.goto("/products");
  await expect(page.locator(".product-card").first()).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0); });
  await page.screenshot({
    path: "../../.artifacts/catalog-mobile.png",
    fullPage: true,
  });
});
