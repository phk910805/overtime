// 시간 테스트용 임시 파일
import { TimeUtils } from './src/utils/timeUtils.js';

console.log('=== 한국시간 UTC 변환 테스트 ===');
TimeUtils.debugTimeInfo();

const koreanTime = TimeUtils.getKoreanTimeAsUTC();
console.log('한국시간 기준 UTC:', koreanTime);

const formatted = TimeUtils.formatKoreanTime(koreanTime);
console.log('표시용 한국시간:', formatted);
