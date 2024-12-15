/**
 * DateUtil 클래스
 */
export default class DateUtil {
    /**
     * 브라우저 GMT(Greenwich Mean Time) 타임존 오프셋 - ex) -12:00 ~ 00:00 ~ +12:00
     */
    createBrowserTimezoneOffset() {
        const offsetMinutes = new Date().getTimezoneOffset();
        const offsetHours = offsetMinutes / 60;

        // 시간대를 시와 분으로 분리합니다.
        const offsetHoursPart = Math.floor(Math.abs(offsetHours));
        const offsetMinutesPart = Math.abs(offsetMinutes % 60);

        // 시간대의 부호를 판단합니다.
        const offsetSign = offsetHours > 0 ? '-' : '+';

        /*
            // 양수 또는 음수인 시간대를 2자리 숫자로 포맷합니다.
            const formattedOffsetHours = offsetHoursPart.toString().padStart(2, '0');
            const formattedOffsetMinutes = offsetMinutesPart.toString().padStart(2, '0');

            return `${offsetSign}${formattedOffsetHours}:${formattedOffsetMinutes}`;
         */
        return (offsetSign == '+' ? 1 : -1) * ((offsetHoursPart * 60) + offsetMinutesPart);
    }

    /**
     * 브라우저 타임존 기반 시간 변환 함수
     * @param serverTime: 서버에서 반환 된 시간 (UTC,GMT)
     * @param pattern: 반환 시간 패턴 ex) 'YYYY-MM-DD HH:mm' , 'YYYY-MM-DD HH:mm:ss'
     */
    convertTimeByBrowserTimezone(serverTime, pattern) {
        const browserTimezoneOffset = this.createBrowserTimezoneOffset(); // 브라우저 타임존 오프셋
        const convertedTime = moment.utc(serverTime).utcOffset(browserTimezoneOffset).format(pattern);
        return convertedTime;
    }

    /**
     * 현재 시간대 기준 YYYY-MM-DD-HH-MM-SS 형태의 문자열 반환
     * @return {string}
     */
    getCurrentDate() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}_${hours}${minutes}${seconds}`;
    }
}