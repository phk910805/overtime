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

  // === 1. 로그인 ===
  console.log('\n=== 1. 로그인 ===');
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(2000);
  await page.fill('input[type="email"]', 'test@overtime.dev');
  await page.fill('input[type="password"]', 'Test1234!');
  await page.getByRole('button', { name: '로그인' }).click();
  await page.waitForTimeout(5000);

  // 회사 설정 필요 시 자동 등록
  const needsCompany = await page.getByText('새 회사 등록').isVisible().catch(() => false);
  if (needsCompany) {
    console.log('  회사 설정 필요 - 새 회사 등록 진행...');
    await page.getByText('새 회사 등록').click();
    await page.waitForTimeout(1000);
    await page.locator('input[placeholder="123-45-67890"]').fill('123-45-67890');
    await page.locator('input[placeholder="(주)테크스타트"]').fill('QA테스트회사');
    await page.waitForTimeout(500);
    const registerBtn = page.getByRole('button', { name: /등록|완료|다음/ });
    if (await registerBtn.count() > 0) {
      await registerBtn.first().click();
    } else {
      await page.locator('button[type="submit"]').first().click();
    }
    await page.waitForTimeout(5000);
    console.log('  회사 등록 완료');
  }

  // 메인 앱 확인 (폰트 미렌더링 대비: 구조적 요소로 판단)
  const mainAppVisible = await page.locator('button[aria-label="설정"]').isVisible().catch(() => false) ||
    await page.getByText('초과 근무시간 관리!').isVisible().catch(() => false);
  check('로그인 후 메인 앱 표시', mainAppVisible);

  if (!mainAppVisible) {
    console.log('\n  메인 앱이 표시되지 않아 QA 중단');
    await page.screenshot({ path: `${SCREENSHOT_DIR}/ERROR-no-main-app.png`, fullPage: true });
    const bodyHtml = await page.locator('body').innerHTML().catch(() => 'unable to read');
    console.log('  현재 페이지 HTML (300자):', bodyHtml.substring(0, 300));
    await browser.close();
    console.log(`\n결과: PASS=${passed}, FAIL=${failed}`);
    process.exit(1);
  }

  await page.screenshot({ path: `${SCREENSHOT_DIR}/01-header.png`, fullPage: false });

  // === 2. 헤더 변경 확인 ===
  console.log('\n=== 2. 헤더 변경 확인 ===');
  const avatarBtn = page.locator('button[aria-label="설정"]');
  check('아바타 버튼 표시', await avatarBtn.isVisible());

  const gearBtn = page.locator('button[title="설정"]');
  check('기존 ⚙️ 버튼 제거됨', (await gearBtn.count()) === 0);

  // === 3. 설정 모달 열기 - 프로필 편집 ===
  console.log('\n=== 3. 설정 모달 - 프로필 편집 ===');
  await avatarBtn.click();
  await page.waitForTimeout(2000); // 프로필 로딩 대기

  await page.screenshot({ path: `${SCREENSHOT_DIR}/02-settings-profile.png`, fullPage: false });

  // 데스크톱 사이드바 메뉴 확인 (hidden sm:flex 영역에서 확인)
  const desktopSidebar = page.locator('.hidden.sm\\:flex');
  for (const item of ['프로필 편집', '회사 정보', '배수 설정', '팀원 초대', '로그아웃']) {
    const vis = await desktopSidebar.getByText(item, { exact: true }).isVisible().catch(() => false);
    check(`사이드바 메뉴 [${item}]`, vis);
  }

  // 프로필 편집 콘텐츠 확인 (프로필 로딩 완료 대기)
  const passwordSection = await page.getByText('비밀번호 변경하기').isVisible().catch(() => false);
  check('비밀번호 변경 섹션 표시', passwordSection);

  // === 4. 회사 정보 섹션 ===
  console.log('\n=== 4. 회사 정보 섹션 ===');
  await desktopSidebar.getByText('회사 정보', { exact: true }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/03-settings-company.png`, fullPage: false });
  check('회사명 필드', await page.getByText('회사명').isVisible().catch(() => false));
  check('사업자등록번호 필드', await page.getByText('사업자등록번호').isVisible().catch(() => false));

  // === 5. 배수 설정 섹션 ===
  console.log('\n=== 5. 배수 설정 섹션 ===');
  await desktopSidebar.getByText('배수 설정', { exact: true }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/04-settings-multiplier.png`, fullPage: false });
  check('배수 입력 필드', await page.getByText('잔여시간 계산 배수').isVisible().catch(() => false));
  check('프리셋 버튼 (1.5배)', await page.getByRole('button', { name: '1.5배' }).isVisible().catch(() => false));
  check('미리보기 영역', await page.getByText(/현재 설정:/).isVisible().catch(() => false));

  // === 6. 팀원 초대 섹션 ===
  console.log('\n=== 6. 팀원 초대 섹션 ===');
  await desktopSidebar.getByText('팀원 초대', { exact: true }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/05-settings-invite.png`, fullPage: false });
  check('초대 코드 생성 버튼', await page.getByText('초대 코드 생성').isVisible().catch(() => false));

  // === 7. ESC 키로 모달 닫기 ===
  console.log('\n=== 7. ESC 키로 모달 닫기 ===');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  check('ESC 후 아바타 버튼 표시', await avatarBtn.isVisible());
  const modalClosed = !(await desktopSidebar.isVisible().catch(() => false));
  check('모달 닫힘', modalClosed);

  // === 8. 로그아웃 확인 모달 ===
  console.log('\n=== 8. 로그아웃 확인 모달 ===');
  await avatarBtn.click();
  await page.waitForTimeout(1000);
  await desktopSidebar.getByText('로그아웃', { exact: true }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/06-logout-confirm.png`, fullPage: false });
  check('로그아웃 확인 메시지', await page.getByText('정말 로그아웃하시겠습니까?').isVisible().catch(() => false));
  // 취소
  await page.getByRole('button', { name: '취소' }).click();
  await page.waitForTimeout(500);
  // 설정 모달 닫기
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // === 9. 모바일 반응형 ===
  console.log('\n=== 9. 모바일 반응형 ===');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(500);
  await avatarBtn.click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/07-mobile-settings.png`, fullPage: false });

  // 모바일에서 sm:hidden 영역의 탭 확인
  const mobileNav = page.locator('.sm\\:hidden');
  const mobileTabVisible = await mobileNav.getByText('배수 설정', { exact: true }).isVisible().catch(() => false);
  check('모바일 탭 표시', mobileTabVisible);

  await mobileNav.getByText('배수 설정', { exact: true }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/08-mobile-multiplier.png`, fullPage: false });
  check('모바일 배수 설정 전환', await page.getByText('잔여시간 계산 배수').isVisible().catch(() => false));

  // 모바일 로그아웃
  await mobileNav.getByText('로그아웃', { exact: true }).click();
  await page.waitForTimeout(500);
  check('모바일 로그아웃 확인 모달', await page.getByText('정말 로그아웃하시겠습니까?').isVisible().catch(() => false));
  await page.getByRole('button', { name: '취소' }).click();
  await page.waitForTimeout(300);

  // 데스크탑 복원
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.waitForTimeout(500);

  // ============================
  // 회귀 테스트
  // ============================
  console.log('\n========================================');
  console.log('회귀 테스트');
  console.log('========================================');

  // === 10. 대시보드 ===
  console.log('\n=== 10. 대시보드 ===');
  const dashTab = page.getByRole('button', { name: /대시보드/ });
  if (await dashTab.isVisible().catch(() => false)) {
    await dashTab.click();
  }
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/09-dashboard.png`, fullPage: false });
  const dashboardOk = await page.locator('table').first().isVisible().catch(() => false) ||
    await page.getByText(/잔여/).isVisible().catch(() => false) ||
    await page.getByText(/대시보드/).isVisible().catch(() => false);
  check('대시보드 로드', dashboardOk);

  // === 11. 히스토리 탭 ===
  console.log('\n=== 11. 히스토리 탭 ===');
  const histTab = page.getByRole('button', { name: /히스토리/ });
  if (await histTab.isVisible().catch(() => false)) {
    await histTab.click();
  }
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/10-history.png`, fullPage: false });
  const historyOk = await page.locator('table').first().isVisible().catch(() => false) ||
    await page.getByText(/기록/).isVisible().catch(() => false) ||
    await page.getByText(/히스토리/).isVisible().catch(() => false);
  check('히스토리 탭 로드', historyOk);

  // === 12. 직원 관리 탭 ===
  console.log('\n=== 12. 직원 관리 탭 ===');
  const empTab = page.getByRole('button', { name: /직원 관리/ });
  if (await empTab.isVisible().catch(() => false)) {
    await empTab.click();
  }
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/11-employees.png`, fullPage: false });
  const employeeOk = await page.locator('table').first().isVisible().catch(() => false) ||
    await page.getByText(/직원/).isVisible().catch(() => false);
  check('직원 관리 탭 로드', employeeOk);

  // === 13. 탭 전환 후 설정 모달 재오픈 ===
  console.log('\n=== 13. 탭 전환 후 설정 모달 재오픈 ===');
  await avatarBtn.click();
  await page.waitForTimeout(1500);
  const reopenOk = await page.locator('.hidden.sm\\:flex').getByText('프로필 편집', { exact: true }).isVisible().catch(() => false);
  check('탭 전환 후 설정 모달 열림', reopenOk);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // === 14. 실제 로그아웃 동작 ===
  console.log('\n=== 14. 실제 로그아웃 동작 ===');
  await avatarBtn.click();
  await page.waitForTimeout(1000);
  await page.locator('.hidden.sm\\:flex').getByText('로그아웃', { exact: true }).click();
  await page.waitForTimeout(500);
  // ConfirmModal의 로그아웃 확인 버튼 클릭
  await page.getByRole('button', { name: '로그아웃' }).last().click();
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/12-after-logout.png`, fullPage: false });
  check('로그아웃 후 로그인 화면', await page.getByRole('button', { name: '로그인' }).isVisible().catch(() => false));

  // === 결과 ===
  console.log('\n========================================');
  console.log(`QA 결과: PASS=${passed}, FAIL=${failed}`);
  console.log('========================================');

  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
})().catch(async (e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
