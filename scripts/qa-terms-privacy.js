/**
 * QA: 약관/개인정보 페이지 + 동의 체크박스 + 푸터 링크
 */
const { chromium } = require('playwright-core');

const CHROMIUM_PATH = '/nix/store/lpdrfl6n16q5zdf8acp4bni7yczzcx3h-idx-builtins/bin/chromium';
const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = 'screenshots';

let passed = 0;
let failed = 0;

function check(label, result) {
  if (result) {
    console.log(`  [PASS] ${label}`);
    passed++;
  } else {
    console.log(`  [FAIL] ${label}`);
    failed++;
  }
}

(async () => {
  const browser = await chromium.launch({
    executablePath: CHROMIUM_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
    env: { ...process.env, FONTCONFIG_FILE: '/tmp/fontconfig/fonts.conf' }
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  try {
    // === 1. 이용약관 페이지 직접 접근 (비로그인) ===
    console.log('\n=== 1. 이용약관 페이지 (비로그인) ===');
    await page.goto(`${BASE_URL}/terms`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);

    const termsTitle = await page.getByText('이용약관').first().isVisible().catch(() => false);
    check('이용약관 페이지 렌더링', termsTitle);

    const article1 = await page.getByText('제1조 (목적)').isVisible().catch(() => false);
    check('제1조 (목적) 표시', article1);

    const article14 = await page.getByText('제14조 (분쟁 해결)').isVisible().catch(() => false);
    check('제14조 (분쟁 해결) 표시', article14);

    const appendix = await page.getByText('20XX년 XX월 XX일부터 시행').isVisible().catch(() => false);
    check('부칙 표시', appendix);

    const placeholder = await page.getByText('[회사명]').first().isVisible().catch(() => false);
    check('[회사명] 플레이스홀더 유지', placeholder);

    // 뒤로가기 버튼 존재
    const backBtn = await page.locator('button').filter({ has: page.locator('svg') }).first().isVisible().catch(() => false);
    check('뒤로가기 버튼 존재', backBtn);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/qa-terms-page.png`, fullPage: false });

    // === 2. 개인정보 처리방침 페이지 직접 접근 (비로그인) ===
    console.log('\n=== 2. 개인정보 처리방침 페이지 (비로그인) ===');
    await page.goto(`${BASE_URL}/privacy`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);

    const privacyTitle = await page.getByText('개인정보 처리방침').first().isVisible().catch(() => false);
    check('개인정보 처리방침 페이지 렌더링', privacyTitle);

    const privArticle1 = await page.getByText('제1조 (개인정보의 수집 항목 및 수집 방법)').isVisible().catch(() => false);
    check('제1조 표시', privArticle1);

    const privArticle13 = await page.getByText('제13조 (개인정보 처리방침의 변경)').isVisible().catch(() => false);
    check('제13조 표시', privArticle13);

    // 테이블 렌더링 확인
    const table = await page.locator('table').first().isVisible().catch(() => false);
    check('테이블 렌더링', table);

    const supabaseRef = await page.getByText('Supabase Inc.').first().isVisible().catch(() => false);
    check('위탁업체 정보 표시', supabaseRef);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/qa-privacy-page.png`, fullPage: false });

    // === 3. 회원가입 폼 — 동의 체크박스 ===
    console.log('\n=== 3. 회원가입 폼 동의 체크박스 ===');
    await page.goto(`${BASE_URL}/signup`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);

    // 체크박스 존재 확인
    const checkbox = page.locator('input[type="checkbox"]');
    const checkboxVisible = await checkbox.isVisible().catch(() => false);
    check('동의 체크박스 표시', checkboxVisible);

    // [필수] 라벨 확인
    const requiredLabel = await page.getByText('[필수]').isVisible().catch(() => false);
    check('[필수] 라벨 표시', requiredLabel);

    // 이용약관 링크 존재
    const termsLink = page.locator('a[href="/terms"]');
    const termsLinkVisible = await termsLink.isVisible().catch(() => false);
    check('이용약관 링크 존재', termsLinkVisible);

    // 개인정보 처리방침 링크 존재
    const privacyLink = page.locator('a[href="/privacy"]');
    const privacyLinkVisible = await privacyLink.isVisible().catch(() => false);
    check('개인정보 처리방침 링크 존재', privacyLinkVisible);

    // 체크 안 한 상태에서 submit 버튼 disabled 확인
    const submitBtn = page.getByRole('button', { name: '회원가입' });
    const isDisabled = await submitBtn.isDisabled().catch(() => false);
    check('미동의 시 제출 버튼 비활성화', isDisabled);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/qa-signup-unchecked.png`, fullPage: false });

    // 폼 채우고 체크 없이 제출 시도 (강제 enable 후 클릭)
    await page.fill('input[name="fullName"]', '테스트');
    await page.fill('input[type="email"]', 'qatest@test.com');
    await page.fill('input[name="password"]', 'Test1234!');
    await page.fill('input[name="confirmPassword"]', 'Test1234!');
    await page.waitForTimeout(300);

    // 체크박스 체크
    await checkbox.check();
    await page.waitForTimeout(300);
    const isEnabledAfterCheck = await submitBtn.isEnabled().catch(() => false);
    check('동의 체크 후 제출 버튼 활성화', isEnabledAfterCheck);

    // 체크 해제
    await checkbox.uncheck();
    await page.waitForTimeout(300);
    const isDisabledAgain = await submitBtn.isDisabled().catch(() => false);
    check('동의 해제 후 제출 버튼 비활성화', isDisabledAgain);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/qa-signup-checked.png`, fullPage: false });

    // === 4. 로그인 폼에는 체크박스 없음 ===
    console.log('\n=== 4. 로그인 폼에는 체크박스 없음 ===');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);

    const loginCheckbox = await page.locator('input[type="checkbox"]').isVisible().catch(() => false);
    check('로그인 폼에 체크박스 없음', !loginCheckbox);

    const loginSubmit = page.getByRole('button', { name: '로그인' });
    const loginBtnEnabled = await loginSubmit.isEnabled().catch(() => false);
    check('로그인 버튼은 항상 활성화', loginBtnEnabled);

    // === 5. 랜딩 페이지 푸터 링크 ===
    console.log('\n=== 5. 랜딩 페이지 푸터 링크 ===');
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);

    // 스크롤 맨 아래
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const footerTerms = page.locator('footer a[href="/terms"]');
    const footerTermsVisible = await footerTerms.isVisible().catch(() => false);
    check('푸터 이용약관 링크 존재', footerTermsVisible);

    const footerPrivacy = page.locator('footer a[href="/privacy"]');
    const footerPrivacyVisible = await footerPrivacy.isVisible().catch(() => false);
    check('푸터 개인정보 처리방침 링크 존재', footerPrivacyVisible);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/qa-footer-links.png`, fullPage: false });

    // 푸터 이용약관 링크 클릭 → 이동 확인
    await footerTerms.click();
    await page.waitForTimeout(2000);
    check('푸터 이용약관 링크 → /terms 이동', page.url().includes('/terms'));

    await page.goBack();
    await page.waitForTimeout(1000);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // 푸터 개인정보 링크 클릭 → 이동 확인
    await footerPrivacy.click();
    await page.waitForTimeout(2000);
    check('푸터 개인정보 링크 → /privacy 이동', page.url().includes('/privacy'));

    // === 6. 회원가입 폼 내 링크 클릭 (새 탭) ===
    console.log('\n=== 6. 회원가입 폼 약관 링크 (새 탭) ===');
    await page.goto(`${BASE_URL}/signup`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);

    // target="_blank" 이므로 새 탭으로 열림
    const [termsPopup] = await Promise.all([
      page.context().waitForEvent('page', { timeout: 5000 }),
      page.locator('a[href="/terms"]').click(),
    ]).catch(() => [null]);

    if (termsPopup) {
      await termsPopup.waitForTimeout(2000);
      check('이용약관 링크 → 새 탭 열림', termsPopup.url().includes('/terms'));
      const newTabTitle = await termsPopup.getByText('이용약관').first().isVisible().catch(() => false);
      check('새 탭에서 이용약관 페이지 렌더링', newTabTitle);
      await termsPopup.close();
    } else {
      check('이용약관 링크 → 새 탭 열림', false);
      check('새 탭에서 이용약관 페이지 렌더링', false);
    }

  } catch (err) {
    console.error('\n[ERROR]', err.message);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/qa-terms-error.png`, fullPage: true }).catch(() => {});
  } finally {
    await browser.close();
    console.log(`\n========================================`);
    console.log(`결과: PASS=${passed}, FAIL=${failed}`);
    console.log(`========================================`);
    process.exit(failed > 0 ? 1 : 0);
  }
})();
