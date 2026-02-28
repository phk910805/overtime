/**
 * TermsPage.js
 * 이용약관 전문 페이지 (정적)
 */

import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';

const TermsPage = memo(() => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 -ml-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">오버타임</span>
          </div>
        </div>
      </header>

      {/* 본문 */}
      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">이용약관</h1>
          <p className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg mb-8">
            검토용 초안입니다. 법률 전문가 검토 후 확정하세요.
          </p>

          <div className="prose prose-sm max-w-none text-gray-700 space-y-8">
            {/* 제1조 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">제1조 (목적)</h2>
              <p>이 약관은 오버타임(이하 "회사")이 제공하는 초과근무시간 관리 서비스 "오버타임"(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.</p>
            </section>

            {/* 제2조 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">제2조 (정의)</h2>
              <ol className="list-decimal pl-5 space-y-1">
                <li><strong>"서비스"</strong>란 회사가 overtime.pages.dev 및 관련 도메인을 통해 제공하는 초과근무시간 기록·관리·승인·통계 서비스를 말합니다.</li>
                <li><strong>"이용자"</strong>란 이 약관에 따라 회사가 제공하는 서비스를 이용하는 자를 말합니다.</li>
                <li><strong>"회원"</strong>이란 서비스에 가입하여 계정을 생성한 이용자를 말합니다.</li>
                <li><strong>"조직"</strong>이란 회원이 서비스 내에서 생성하거나 소속된 회사(사업장) 단위를 말합니다.</li>
                <li><strong>"소유자"</strong>란 조직을 최초 생성한 회원으로, 해당 조직의 최고 관리 권한을 가진 자를 말합니다.</li>
                <li><strong>"구성원"</strong>이란 소유자의 초대 또는 가입 승인을 통해 조직에 소속된 회원을 말합니다.</li>
              </ol>
            </section>

            {/* 제3조 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">제3조 (약관의 효력 및 변경)</h2>
              <ol className="list-decimal pl-5 space-y-1">
                <li>이 약관은 서비스 화면에 게시하거나 이메일 등 기타 방법으로 이용자에게 공지함으로써 효력이 발생합니다.</li>
                <li>회사는 관련 법령에 위배되지 않는 범위에서 약관을 변경할 수 있으며, 변경 시 적용일 7일 전(이용자에게 불리한 변경은 30일 전)에 공지합니다.</li>
                <li>변경된 약관에 동의하지 않는 회원은 서비스 이용을 중단하고 탈퇴할 수 있습니다. 공지 후 적용일까지 별도의 거부 의사를 표시하지 않으면 변경에 동의한 것으로 간주합니다.</li>
              </ol>
            </section>

            {/* 제4조 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">제4조 (회원가입 및 계정)</h2>
              <ol className="list-decimal pl-5 space-y-1">
                <li>이용자는 회사가 정한 가입 절차에 따라 이메일, 비밀번호, 이름을 입력하고 약관에 동의함으로써 회원가입을 신청합니다.</li>
                <li>회사는 다음 각 호에 해당하는 경우 가입을 거부하거나 사후에 이용계약을 해지할 수 있습니다.
                  <ul className="list-disc pl-5 mt-1 space-y-0.5">
                    <li>타인의 정보를 도용한 경우</li>
                    <li>허위 정보를 기재한 경우</li>
                    <li>이전에 약관 위반으로 이용이 제한된 자가 재가입을 시도하는 경우</li>
                  </ul>
                </li>
                <li>회원은 자신의 계정 정보를 안전하게 관리할 책임이 있으며, 계정의 무단 사용을 인지한 경우 즉시 회사에 통보하여야 합니다.</li>
              </ol>
            </section>

            {/* 제5조 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">제5조 (서비스의 내용)</h2>
              <p className="mb-2">회사가 제공하는 서비스의 주요 기능은 다음과 같습니다.</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>직원 초과근무시간 기록 및 관리</li>
                <li>초과근무 신청·승인·반려 워크플로우</li>
                <li>부서별·직원별 초과근무 통계 및 대시보드</li>
                <li>직원 정보 관리 (이름, 부서, 입사일 등)</li>
                <li>조직 관리 (구성원 초대, 역할·권한 설정)</li>
                <li>알림 기능 (근무시간 제출·승인·반려 알림)</li>
                <li>기타 회사가 추가로 제공하는 부가 기능</li>
              </ol>
            </section>

            {/* 제6조 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">제6조 (서비스의 제공 및 중단)</h2>
              <ol className="list-decimal pl-5 space-y-1">
                <li>서비스는 연중무휴, 1일 24시간 제공을 원칙으로 합니다. 다만, 시스템 점검·업데이트 등 운영상 필요한 경우 일시적으로 중단할 수 있습니다.</li>
                <li>회사는 다음 각 호의 사유로 서비스 제공이 일시적으로 중단되는 경우 그 책임을 지지 않습니다.
                  <ul className="list-disc pl-5 mt-1 space-y-0.5">
                    <li>서버 장비의 보수, 교체, 고장, 통신 두절</li>
                    <li>천재지변, 국가비상사태, 정전 등 불가항력적 사유</li>
                    <li>외부 인프라(Supabase, Cloudflare 등) 장애</li>
                  </ul>
                </li>
              </ol>
            </section>

            {/* 제7조 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">제7조 (이용자의 의무)</h2>
              <ol className="list-decimal pl-5 space-y-1">
                <li>이용자는 서비스 이용 시 다음 행위를 하여서는 안 됩니다.
                  <ul className="list-disc pl-5 mt-1 space-y-0.5">
                    <li>허위 정보의 등록 또는 타인 정보의 도용</li>
                    <li>서비스의 정상적인 운영을 방해하는 행위</li>
                    <li>서비스를 이용한 영리 목적의 정보 수집(크롤링 등)</li>
                    <li>다른 이용자의 개인정보를 무단으로 수집·저장·공개하는 행위</li>
                    <li>관련 법령에 위반되는 행위</li>
                  </ul>
                </li>
                <li>소유자는 자신의 조직에 등록된 직원 정보(개인정보 포함)에 대해 해당 직원의 동의를 받고 관련 법령을 준수할 책임이 있습니다.</li>
              </ol>
            </section>

            {/* 제8조 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">제8조 (조직 및 데이터 관리)</h2>
              <ol className="list-decimal pl-5 space-y-1">
                <li>소유자는 조직 내 구성원에게 역할(관리자/일반)과 권한(편집/조회)을 부여할 수 있습니다.</li>
                <li>소유자가 등록한 직원 데이터(이름, 부서, 근무시간 기록 등)는 해당 조직 내에서만 접근 가능하며, 다른 조직과 공유되지 않습니다.</li>
                <li>직원 삭제 시 해당 데이터는 서비스 내에서 비활성화(soft delete)되며, 완전 삭제를 원하는 경우 회사에 별도 요청할 수 있습니다.</li>
              </ol>
            </section>

            {/* 제9조 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">제9조 (회원 탈퇴 및 이용 제한)</h2>
              <ol className="list-decimal pl-5 space-y-1">
                <li>회원은 서비스 내 설정 메뉴 또는 고객센터를 통해 언제든지 탈퇴를 요청할 수 있습니다.</li>
                <li>조직의 소유자가 탈퇴하는 경우, 해당 조직의 데이터 처리에 대해 회사가 별도 안내합니다.</li>
                <li>회사는 회원이 제7조의 의무를 위반한 경우 사전 통보 없이 이용을 제한하거나 계약을 해지할 수 있습니다.</li>
              </ol>
            </section>

            {/* 제10조 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">제10조 (요금 및 결제)</h2>
              <ol className="list-decimal pl-5 space-y-1">
                <li>서비스는 무료 플랜과 유료 플랜으로 구분되며, 각 플랜의 내용과 요금은 서비스 내에 별도 안내합니다.</li>
                <li>유료 서비스의 결제, 환불, 자동 갱신에 관한 세부 사항은 유료 서비스 이용 시 별도로 안내합니다.</li>
              </ol>
            </section>

            {/* 제11조 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">제11조 (지적재산권)</h2>
              <ol className="list-decimal pl-5 space-y-1">
                <li>서비스에 포함된 소프트웨어, 디자인, 콘텐츠에 대한 지적재산권은 회사에 귀속됩니다.</li>
                <li>이용자가 서비스에 입력·등록한 데이터(직원 정보, 근무 기록 등)에 대한 권리는 해당 이용자(또는 소속 조직)에 귀속됩니다.</li>
              </ol>
            </section>

            {/* 제12조 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">제12조 (면책 조항)</h2>
              <ol className="list-decimal pl-5 space-y-1">
                <li>회사는 천재지변, 불가항력 또는 이에 준하는 사유로 서비스를 제공할 수 없는 경우 책임을 지지 않습니다.</li>
                <li>회사는 이용자의 귀책 사유로 인한 서비스 이용 장애에 대해 책임을 지지 않습니다.</li>
                <li>회사는 이용자가 서비스에 입력한 정보의 정확성, 적법성에 대해 보증하지 않으며, 이로 인한 분쟁에 대해 책임을 지지 않습니다.</li>
                <li>서비스에서 제공하는 근무시간 계산·통계는 참고용이며, 법적 효력을 갖는 근로시간 산정의 공식 기록으로 대체할 수 없습니다.</li>
              </ol>
            </section>

            {/* 제13조 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">제13조 (손해배상)</h2>
              <ol className="list-decimal pl-5 space-y-1">
                <li>회사 또는 이용자가 이 약관을 위반하여 상대방에게 손해를 입힌 경우 그 손해를 배상할 책임이 있습니다.</li>
                <li>다만, 회사의 배상 책임은 유료 서비스의 경우 해당 이용자가 최근 12개월간 납부한 서비스 이용료를 상한으로 합니다.</li>
              </ol>
            </section>

            {/* 제14조 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">제14조 (분쟁 해결)</h2>
              <ol className="list-decimal pl-5 space-y-1">
                <li>이 약관과 관련한 분쟁은 대한민국 법률을 적용합니다.</li>
                <li>서비스 이용 관련 분쟁에 대한 소송은 오버타임의 소재지를 관할하는 법원을 제1심 관할법원으로 합니다.</li>
              </ol>
            </section>

            {/* 부칙 */}
            <section className="pt-4 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">부칙</h2>
              <p>이 약관은 2026년 3월 1일부터 시행합니다.</p>
            </section>

            <p className="text-sm text-gray-500 italic pt-4">
              이 문서는 초안이며 법률 전문가의 검토를 거쳐 확정해야 합니다.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
});

TermsPage.displayName = 'TermsPage';

export default TermsPage;
