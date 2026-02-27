/**
 * PrivacyPage.js
 * 개인정보 처리방침 전문 페이지 (정적)
 */

import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';

const PrivacyPage = memo(() => {
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">개인정보 처리방침</h1>
          <p className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg mb-8">
            검토용 초안입니다. 법률 전문가 검토 후 확정하세요.
          </p>

          <p className="text-gray-700 mb-8">
            [회사명](이하 "회사")은 「개인정보 보호법」 등 관련 법령에 따라 이용자의 개인정보를 보호하고, 이와 관련한 고충을 원활하게 처리하기 위하여 다음과 같이 개인정보 처리방침을 수립·공개합니다.
          </p>

          <div className="prose prose-sm max-w-none text-gray-700 space-y-8">
            {/* 제1조 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">제1조 (개인정보의 수집 항목 및 수집 방법)</h2>

              <h3 className="text-base font-medium text-gray-800 mb-2">1. 수집 항목</h3>

              <h4 className="text-sm font-medium text-gray-700 mb-2">가. 회원가입 시 (필수)</h4>
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-3 py-2 text-left font-medium">항목</th>
                      <th className="border border-gray-200 px-3 py-2 text-left font-medium">수집 목적</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border border-gray-200 px-3 py-2">이메일 주소</td><td className="border border-gray-200 px-3 py-2">계정 식별, 로그인, 서비스 관련 안내</td></tr>
                    <tr><td className="border border-gray-200 px-3 py-2">비밀번호</td><td className="border border-gray-200 px-3 py-2">계정 인증 (암호화 저장)</td></tr>
                    <tr><td className="border border-gray-200 px-3 py-2">이름</td><td className="border border-gray-200 px-3 py-2">서비스 내 표시명, 본인 식별</td></tr>
                  </tbody>
                </table>
              </div>

              <h4 className="text-sm font-medium text-gray-700 mb-2">나. 조직(회사) 등록 시 (필수)</h4>
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-3 py-2 text-left font-medium">항목</th>
                      <th className="border border-gray-200 px-3 py-2 text-left font-medium">수집 목적</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border border-gray-200 px-3 py-2">회사명</td><td className="border border-gray-200 px-3 py-2">조직 식별 및 서비스 제공</td></tr>
                    <tr><td className="border border-gray-200 px-3 py-2">사업자등록번호</td><td className="border border-gray-200 px-3 py-2">조직 인증 및 고유 식별</td></tr>
                  </tbody>
                </table>
              </div>

              <h4 className="text-sm font-medium text-gray-700 mb-2">다. 직원 정보 등록 시 (소유자/관리자가 입력)</h4>
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-3 py-2 text-left font-medium">항목</th>
                      <th className="border border-gray-200 px-3 py-2 text-left font-medium">필수/선택</th>
                      <th className="border border-gray-200 px-3 py-2 text-left font-medium">수집 목적</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border border-gray-200 px-3 py-2">이름</td><td className="border border-gray-200 px-3 py-2">필수</td><td className="border border-gray-200 px-3 py-2">직원 식별, 근무기록 관리</td></tr>
                    <tr><td className="border border-gray-200 px-3 py-2">부서</td><td className="border border-gray-200 px-3 py-2">필수</td><td className="border border-gray-200 px-3 py-2">조직 내 소속 구분</td></tr>
                    <tr><td className="border border-gray-200 px-3 py-2">입사일</td><td className="border border-gray-200 px-3 py-2">필수</td><td className="border border-gray-200 px-3 py-2">근무 기간 관리</td></tr>
                    <tr><td className="border border-gray-200 px-3 py-2">생년월일</td><td className="border border-gray-200 px-3 py-2 font-medium">선택</td><td className="border border-gray-200 px-3 py-2">직원 식별 보조</td></tr>
                    <tr><td className="border border-gray-200 px-3 py-2">메모</td><td className="border border-gray-200 px-3 py-2">선택</td><td className="border border-gray-200 px-3 py-2">관리자 참고용</td></tr>
                  </tbody>
                </table>
              </div>

              <h4 className="text-sm font-medium text-gray-700 mb-2">라. 서비스 이용 과정에서 자동 생성되는 정보</h4>
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-3 py-2 text-left font-medium">항목</th>
                      <th className="border border-gray-200 px-3 py-2 text-left font-medium">수집 목적</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border border-gray-200 px-3 py-2">초과근무 기록 (일시, 시간, 사유, 검토의견)</td><td className="border border-gray-200 px-3 py-2">핵심 서비스 기능</td></tr>
                    <tr><td className="border border-gray-200 px-3 py-2">승인·반려 이력 (처리자, 일시)</td><td className="border border-gray-200 px-3 py-2">워크플로우 관리</td></tr>
                    <tr><td className="border border-gray-200 px-3 py-2">알림 기록 (발신·수신자, 유형, 내용)</td><td className="border border-gray-200 px-3 py-2">서비스 내 알림 기능</td></tr>
                    <tr><td className="border border-gray-200 px-3 py-2">직원 정보 변경 이력</td><td className="border border-gray-200 px-3 py-2">데이터 무결성·감사 추적</td></tr>
                    <tr><td className="border border-gray-200 px-3 py-2">이월 기록 (기간, 잔여시간)</td><td className="border border-gray-200 px-3 py-2">근무시간 정산</td></tr>
                  </tbody>
                </table>
              </div>

              <h4 className="text-sm font-medium text-gray-700 mb-2">마. 브라우저 저장 (서버 미전송)</h4>
              <p className="mb-2">서비스는 이용자의 브라우저에 다음 정보를 저장합니다. 이 정보는 서버로 전송되지 않으며 이용자의 기기에만 보관됩니다.</p>
              <ul className="list-disc pl-5 space-y-0.5">
                <li>알림 설정 (알림 유형별 표시 여부)</li>
                <li>화면 정렬/표시 설정</li>
                <li>최근 방문 월 정보</li>
              </ul>

              <h3 className="text-base font-medium text-gray-800 mt-4 mb-2">2. 수집 방법</h3>
              <ul className="list-disc pl-5 space-y-0.5">
                <li>회원가입, 조직 등록, 직원 정보 등록 시 이용자가 직접 입력</li>
                <li>서비스 이용 과정에서 자동 생성 및 수집</li>
              </ul>
            </section>

            {/* 제2조 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">제2조 (개인정보의 수집·이용 목적)</h2>
              <p className="mb-2">회사는 수집한 개인정보를 다음 목적으로만 이용합니다.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-3 py-2 text-left font-medium">목적 구분</th>
                      <th className="border border-gray-200 px-3 py-2 text-left font-medium">세부 내용</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border border-gray-200 px-3 py-2">회원 관리</td><td className="border border-gray-200 px-3 py-2">가입·탈퇴 처리, 본인 확인, 부정 이용 방지</td></tr>
                    <tr><td className="border border-gray-200 px-3 py-2">서비스 제공</td><td className="border border-gray-200 px-3 py-2">초과근무 기록·관리·승인, 통계 제공, 알림 발송</td></tr>
                    <tr><td className="border border-gray-200 px-3 py-2">조직 관리</td><td className="border border-gray-200 px-3 py-2">구성원 초대·승인, 역할·권한 관리</td></tr>
                    <tr><td className="border border-gray-200 px-3 py-2">서비스 개선</td><td className="border border-gray-200 px-3 py-2">기능 개선, 오류 수정 (비식별 통계 활용)</td></tr>
                    <tr><td className="border border-gray-200 px-3 py-2">고객 지원</td><td className="border border-gray-200 px-3 py-2">문의 대응, 공지사항 전달</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 제3조 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">제3조 (개인정보의 보유 및 이용 기간)</h2>
              <p className="mb-3">회사는 개인정보 수집 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 다만, 다음의 경우 명시한 기간 동안 보관합니다.</p>

              <h3 className="text-base font-medium text-gray-800 mb-2">1. 회사 내부 방침에 의한 보관</h3>
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-3 py-2 text-left font-medium">항목</th>
                      <th className="border border-gray-200 px-3 py-2 text-left font-medium">보관 기간</th>
                      <th className="border border-gray-200 px-3 py-2 text-left font-medium">사유</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border border-gray-200 px-3 py-2">회원 탈퇴 기록</td><td className="border border-gray-200 px-3 py-2">탈퇴 후 30일</td><td className="border border-gray-200 px-3 py-2">부정 가입 방지, 재가입 제한</td></tr>
                    <tr><td className="border border-gray-200 px-3 py-2">삭제된 직원 데이터</td><td className="border border-gray-200 px-3 py-2">삭제 처리 후 1년</td><td className="border border-gray-200 px-3 py-2">데이터 복구 요청 대응</td></tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-base font-medium text-gray-800 mb-2">2. 관련 법령에 의한 보관</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-3 py-2 text-left font-medium">근거 법령</th>
                      <th className="border border-gray-200 px-3 py-2 text-left font-medium">보관 항목</th>
                      <th className="border border-gray-200 px-3 py-2 text-left font-medium">보관 기간</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border border-gray-200 px-3 py-2">전자상거래법</td><td className="border border-gray-200 px-3 py-2">계약 또는 청약 철회에 관한 기록</td><td className="border border-gray-200 px-3 py-2">5년</td></tr>
                    <tr><td className="border border-gray-200 px-3 py-2">전자상거래법</td><td className="border border-gray-200 px-3 py-2">대금 결제 및 재화 등의 공급에 관한 기록</td><td className="border border-gray-200 px-3 py-2">5년</td></tr>
                    <tr><td className="border border-gray-200 px-3 py-2">전자상거래법</td><td className="border border-gray-200 px-3 py-2">소비자 불만 또는 분쟁 처리에 관한 기록</td><td className="border border-gray-200 px-3 py-2">3년</td></tr>
                    <tr><td className="border border-gray-200 px-3 py-2">통신비밀보호법</td><td className="border border-gray-200 px-3 py-2">접속 로그 기록</td><td className="border border-gray-200 px-3 py-2">3개월</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 제4조 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">제4조 (개인정보의 제3자 제공)</h2>
              <p className="mb-2">회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다.</p>
              <ol className="list-decimal pl-5 space-y-1 mb-3">
                <li>이용자가 사전에 동의한 경우</li>
                <li>법령의 규정에 의하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
              </ol>
              <p className="font-medium text-gray-800 mb-1">조직 내 정보 공유에 관한 안내:</p>
              <p>소유자/관리자가 등록한 직원 정보 및 근무 기록은 동일 조직 내 권한이 부여된 구성원에게 표시됩니다. 이는 서비스의 본질적 기능이며, 조직 외부로 제공되지 않습니다.</p>
            </section>

            {/* 제5조 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">제5조 (개인정보 처리의 위탁)</h2>
              <p className="mb-2">회사는 서비스 제공을 위해 다음과 같이 개인정보 처리를 위탁하고 있습니다.</p>
              <div className="overflow-x-auto mb-3">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-3 py-2 text-left font-medium">수탁업체</th>
                      <th className="border border-gray-200 px-3 py-2 text-left font-medium">위탁 업무</th>
                      <th className="border border-gray-200 px-3 py-2 text-left font-medium">보관 장소</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border border-gray-200 px-3 py-2">Supabase Inc.</td><td className="border border-gray-200 px-3 py-2">데이터베이스 호스팅, 회원 인증 처리</td><td className="border border-gray-200 px-3 py-2">미국 (AWS 클라우드)</td></tr>
                    <tr><td className="border border-gray-200 px-3 py-2">Cloudflare Inc.</td><td className="border border-gray-200 px-3 py-2">웹 애플리케이션 호스팅, CDN</td><td className="border border-gray-200 px-3 py-2">글로벌 (엣지 서버)</td></tr>
                  </tbody>
                </table>
              </div>
              <p>회사는 위탁 계약 시 개인정보 보호 관련 법령 준수, 비밀 유지, 재위탁 제한, 사고 시 손해배상 등의 내용을 명시하고 있습니다.</p>
            </section>

            {/* 제6조 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">제6조 (개인정보의 국외 이전)</h2>
              <p className="mb-2">서비스 제공을 위해 이용자의 개인정보가 다음과 같이 국외로 이전됩니다.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-3 py-2 text-left font-medium">항목</th>
                      <th className="border border-gray-200 px-3 py-2 text-left font-medium">내용</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border border-gray-200 px-3 py-2">이전받는 자</td><td className="border border-gray-200 px-3 py-2">Supabase Inc.</td></tr>
                    <tr><td className="border border-gray-200 px-3 py-2">이전되는 국가</td><td className="border border-gray-200 px-3 py-2">미국</td></tr>
                    <tr><td className="border border-gray-200 px-3 py-2">이전 일시 및 방법</td><td className="border border-gray-200 px-3 py-2">서비스 이용 시 네트워크를 통해 실시간 전송</td></tr>
                    <tr><td className="border border-gray-200 px-3 py-2">이전되는 항목</td><td className="border border-gray-200 px-3 py-2">제1조에 명시된 수집 항목 전체</td></tr>
                    <tr><td className="border border-gray-200 px-3 py-2">이전받는 자의 이용 목적</td><td className="border border-gray-200 px-3 py-2">데이터베이스 저장·관리, 인증 처리</td></tr>
                    <tr><td className="border border-gray-200 px-3 py-2">보유 및 이용 기간</td><td className="border border-gray-200 px-3 py-2">위탁 계약 종료 또는 회원 탈퇴 시까지</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 제7조 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">제7조 (개인정보의 파기 절차 및 방법)</h2>
              <h3 className="text-base font-medium text-gray-800 mb-1">1. 파기 절차</h3>
              <p className="mb-3">수집 목적이 달성된 개인정보는 보유 기간 경과 후 내부 방침 및 관련 법령에 따라 파기합니다.</p>
              <h3 className="text-base font-medium text-gray-800 mb-1">2. 파기 방법</h3>
              <ul className="list-disc pl-5 space-y-0.5 mb-3">
                <li><strong>전자적 파일</strong>: 기술적 방법을 사용하여 복구할 수 없도록 영구 삭제</li>
                <li><strong>종이 문서</strong>: 분쇄기로 분쇄하거나 소각</li>
              </ul>
              <h3 className="text-base font-medium text-gray-800 mb-1">3. 서비스 내 삭제 처리</h3>
              <p>직원 정보 삭제 시 즉시 완전 파기되지 않고 비활성화(soft delete) 처리됩니다. 비활성화된 데이터는 보관 기간 경과 후 완전 파기되며, 이용자는 즉시 완전 파기를 별도 요청할 수 있습니다.</p>
            </section>

            {/* 제8조 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">제8조 (정보주체의 권리·의무 및 행사 방법)</h2>
              <p className="mb-2">이용자(정보주체)는 다음의 권리를 행사할 수 있습니다.</p>
              <ol className="list-decimal pl-5 space-y-1 mb-3">
                <li><strong>개인정보 열람 요구</strong>: 회사가 보유한 자신의 개인정보를 열람할 수 있습니다.</li>
                <li><strong>개인정보 정정·삭제 요구</strong>: 오류가 있는 경우 정정 또는 삭제를 요구할 수 있습니다.</li>
                <li><strong>개인정보 처리 정지 요구</strong>: 개인정보 처리의 정지를 요구할 수 있습니다.</li>
                <li><strong>동의 철회</strong>: 개인정보 수집·이용에 대한 동의를 철회할 수 있습니다.</li>
              </ol>

              <h3 className="text-base font-medium text-gray-800 mb-1">행사 방법</h3>
              <ul className="list-disc pl-5 space-y-0.5 mb-3">
                <li>서비스 내 설정 메뉴에서 직접 수정·삭제</li>
                <li>이메일([이메일]) 또는 고객센터를 통한 요청</li>
                <li>요청 접수 후 10일 이내 처리하며, 처리 결과를 통지합니다.</li>
              </ul>

              <h3 className="text-base font-medium text-gray-800 mb-1">주의 사항</h3>
              <ul className="list-disc pl-5 space-y-0.5">
                <li>조직의 소유자/관리자가 등록한 직원 정보에 대해서는 해당 조직의 소유자/관리자에게 권리 행사를 요청해야 합니다.</li>
                <li>서비스의 필수 정보(이메일, 이름)를 삭제하는 경우 서비스 이용이 제한될 수 있습니다.</li>
              </ul>
            </section>

            {/* 제9조 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">제9조 (개인정보의 안전성 확보 조치)</h2>
              <p className="mb-2">회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li><strong>접근 권한 관리</strong>: 개인정보 처리 시스템에 대한 접근 권한을 최소한의 인원으로 제한</li>
                <li><strong>비밀번호 암호화</strong>: 이용자의 비밀번호는 단방향 암호화(해시)하여 저장·관리</li>
                <li><strong>데이터 암호화</strong>: 네트워크를 통한 개인정보 전송 시 SSL/TLS 암호화 적용</li>
                <li><strong>접근 통제</strong>: 행 수준 보안(Row Level Security)을 통해 조직 간 데이터 격리</li>
                <li><strong>정기적 점검</strong>: 개인정보 처리 시스템의 접근 기록을 정기적으로 점검</li>
              </ol>
            </section>

            {/* 제10조 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">제10조 (자동 수집 장치의 설치·운영 및 거부)</h2>
              <h3 className="text-base font-medium text-gray-800 mb-1">1. 쿠키(Cookie)</h3>
              <p className="mb-3">현재 서비스는 이용자 식별을 위한 쿠키를 별도로 설치하지 않습니다. 다만, 인증 처리를 위해 Supabase에서 발급하는 인증 토큰이 브라우저의 로컬 스토리지에 저장됩니다.</p>
              <h3 className="text-base font-medium text-gray-800 mb-1">2. 로컬 스토리지</h3>
              <p className="mb-3">서비스는 이용자 편의를 위해 브라우저의 로컬 스토리지에 설정 정보(알림 설정, 화면 정렬 등)를 저장합니다. 이 정보는 서버로 전송되지 않습니다.</p>
              <h3 className="text-base font-medium text-gray-800 mb-1">3. 제3자 추적 도구</h3>
              <p>현재 서비스는 Google Analytics 등 제3자 분석·추적 도구를 사용하지 않습니다.</p>
            </section>

            {/* 제11조 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">제11조 (개인정보 보호책임자)</h2>
              <p className="mb-2">회사는 개인정보 처리에 관한 업무를 총괄하고, 이용자의 불만 처리 및 피해 구제를 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-3 py-2 text-left font-medium">구분</th>
                      <th className="border border-gray-200 px-3 py-2 text-left font-medium">내용</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border border-gray-200 px-3 py-2">성명</td><td className="border border-gray-200 px-3 py-2">[개인정보 보호책임자명]</td></tr>
                    <tr><td className="border border-gray-200 px-3 py-2">직위</td><td className="border border-gray-200 px-3 py-2">[직위]</td></tr>
                    <tr><td className="border border-gray-200 px-3 py-2">이메일</td><td className="border border-gray-200 px-3 py-2">[이메일]</td></tr>
                    <tr><td className="border border-gray-200 px-3 py-2">전화번호</td><td className="border border-gray-200 px-3 py-2">[전화번호]</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 제12조 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">제12조 (권익 침해 구제 방법)</h2>
              <p className="mb-2">개인정보 침해에 대한 신고·상담이 필요한 경우 아래 기관에 문의하실 수 있습니다.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 px-3 py-2 text-left font-medium">기관</th>
                      <th className="border border-gray-200 px-3 py-2 text-left font-medium">연락처</th>
                      <th className="border border-gray-200 px-3 py-2 text-left font-medium">홈페이지</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border border-gray-200 px-3 py-2">개인정보 침해신고센터 (KISA)</td><td className="border border-gray-200 px-3 py-2">국번없이 118</td><td className="border border-gray-200 px-3 py-2">privacy.kisa.or.kr</td></tr>
                    <tr><td className="border border-gray-200 px-3 py-2">개인정보 분쟁조정위원회</td><td className="border border-gray-200 px-3 py-2">국번없이 1833-6972</td><td className="border border-gray-200 px-3 py-2">www.kopico.go.kr</td></tr>
                    <tr><td className="border border-gray-200 px-3 py-2">대검찰청 사이버수사과</td><td className="border border-gray-200 px-3 py-2">국번없이 1301</td><td className="border border-gray-200 px-3 py-2">www.spo.go.kr</td></tr>
                    <tr><td className="border border-gray-200 px-3 py-2">경찰청 사이버수사국</td><td className="border border-gray-200 px-3 py-2">국번없이 182</td><td className="border border-gray-200 px-3 py-2">ecrm.police.go.kr</td></tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 제13조 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">제13조 (개인정보 처리방침의 변경)</h2>
              <p>이 개인정보 처리방침은 시행일로부터 적용되며, 관련 법령 및 회사 정책에 따라 변경될 수 있습니다. 변경 사항은 서비스 내 공지를 통해 안내합니다.</p>
            </section>

            {/* 시행일 */}
            <section className="pt-4 border-t border-gray-200">
              <p><strong>시행일</strong>: 20XX년 XX월 XX일</p>
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

PrivacyPage.displayName = 'PrivacyPage';

export default PrivacyPage;
