import{test,expect}from"@playwright/test";
test("登录认领、管理员同步、生效与退款扣回",async({page,context})=>{
 await page.goto('/login');await page.getByRole('button',{name:'登录'}).click();await expect(page).toHaveURL(/member/);
 await page.goto('/member/claim-order');await page.getByLabel('淘宝订单号').fill('TB202606280006');await page.getByLabel('收件手机号后四位').fill('1234');await page.getByRole('button',{name:'核对并认领'}).click();await expect(page.getByText('认领成功')).toBeVisible();
 await context.clearCookies();await page.goto('/login');await page.getByLabel('手机号').fill('13800000000');await page.getByRole('button',{name:'登录'}).click();await expect(page).toHaveURL(/admin/);
 const row=page.getByRole('row').filter({hasText:'TB202606280006'});await row.getByRole('button',{name:'确认收货'}).click();await page.waitForTimeout(500);const row2=page.getByRole('row').filter({hasText:'TB202606280006'});await row2.getByRole('button',{name:'经过 7 天'}).click();await page.waitForTimeout(500);const row3=page.getByRole('row').filter({hasText:'TB202606280006'});await row3.getByRole('button',{name:'部分退款'}).click();
 await context.clearCookies();await page.goto('/login');await page.getByRole('button',{name:'登录'}).click();await page.goto('/member/points');await expect(page.getByText('部分退款积分扣回')).toBeVisible();await expect(page.getByText('订单积分已生效')).toBeVisible();
});
