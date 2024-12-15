export class DataModel {

    #REF_OBJECT = null;

    constructor(referenceData) {
        this.#REF_OBJECT = referenceData;
        if (this.#REF_OBJECT) {
            this.dataKeys = Object.keys(this.#REF_OBJECT);
        }
    }

    setDateToStr(dateObject) {
        if (dateObject) {
            const userDate = (dateObject && typeof dateObject === 'object') ? dateObject : new Date(dateObject);
            const strYYYY = userDate.getFullYear();
            const strMM = ((userDate.getMonth() + 1) < 10) ? '0' + (userDate.getMonth() + 1) : userDate.getMonth() + 1;
            const strDD = (userDate.getDate() < 10) ? '0' + userDate.getDate() : userDate.getDate();
            return `${strYYYY}-${strMM}-${strDD}`;
        } else {
            return null;
        }
    }

    /**
     * YYYY-MM, ex)2024-08 형식의 데이터 반환
     * **/
    setYYYYMMByKey(objectKeyName) {
        const dateObj = (this.#REF_OBJECT && this.#REF_OBJECT[objectKeyName]) ? new Date(this.#REF_OBJECT[objectKeyName]) : null;
        // 연도와 월 추출
        if (dateObj == null || !dateObj) {
            return dateObj
        }
        const year = dateObj.getFullYear(); // 연도 추출
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0'); // 월 추출 (0부터 시작하므로 +1), 두 자리로 포맷팅

        // YYYY-MM 형식의 문자열 생성
        const formattedDate = `${year}-${month}`;
        return formattedDate;
    }

    setYYYYMMDDByKey(objectKeyName) {
        const dateObj = (this.#REF_OBJECT && this.#REF_OBJECT[objectKeyName]) ? new Date(this.#REF_OBJECT[objectKeyName]) : null;

        if (dateObj == null || !dateObj) {
            return dateObj;
        }

        const year = dateObj.getFullYear(); // 연도 추출
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0'); // 월 추출, 두 자리로 포맷팅
        const day = dateObj.getDate().toString().padStart(2, '0'); // 일 추출, 두 자리로 포맷팅

        // YYYY-MM-DD 형식의 문자열 생성
        const formattedDate = `${year}-${month}-${day}`;
        return formattedDate;
    }

    setYYYYMMDDHHMMSSByKey(objectKeyName) {
        const dateObj = (this.#REF_OBJECT && this.#REF_OBJECT[objectKeyName]) ? new Date(this.#REF_OBJECT[objectKeyName]) : null;

        if (dateObj == null || !dateObj) {
            return dateObj;
        }

        const year = dateObj.getFullYear(); // 연도 추출
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0'); // 월 추출, 두 자리로 포맷팅
        const day = dateObj.getDate().toString().padStart(2, '0'); // 일 추출, 두 자리로 포맷팅
        const hours = dateObj.getHours().toString().padStart(2, '0'); // 시 추출, 두 자리로 포맷팅
        const minutes = dateObj.getMinutes().toString().padStart(2, '0'); // 분 추출, 두 자리로 포맷팅
        const seconds = dateObj.getSeconds().toString().padStart(2, '0'); // 초 추출, 두 자리로 포맷팅

        // YYYY-MM-DD HH:MM:SS 형식의 문자열 생성
        const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        return formattedDate;
    }

    setDateByKey(objectKeyName) {
        return (this.#REF_OBJECT && this.#REF_OBJECT[objectKeyName]) ? new Date(this.#REF_OBJECT[objectKeyName]) : null;
    }

    setIntByKey(objectKeyName) {
        if (!this.#REF_OBJECT || isNaN(parseInt(this.#REF_OBJECT[objectKeyName]))) {
            return null;
        } else {
            return (this.#REF_OBJECT && this.#REF_OBJECT[objectKeyName]) ? parseInt(this.#REF_OBJECT[objectKeyName]) : 0;
        }
    }

    setStringByKey(objectKeyName) {
        return (this.#REF_OBJECT && this.#REF_OBJECT[objectKeyName]) ? String(this.#REF_OBJECT[objectKeyName]) : null;
    }

    setValueByKey(objectKeyName) {
        return (this.#REF_OBJECT && this.#REF_OBJECT[objectKeyName]) ? this.#REF_OBJECT[objectKeyName] : null;
    }

    setBoolByKey(objectKeyName) {
        return (this.#REF_OBJECT && this.#REF_OBJECT[objectKeyName]) ? this.#REF_OBJECT[objectKeyName] : false;
    }

    setFloatByKey(objectKeyName) {
        if (!this.#REF_OBJECT || isNaN(parseFloat(this.#REF_OBJECT[objectKeyName]))) {
            return null;
        } else {
            return (this.#REF_OBJECT && this.#REF_OBJECT[objectKeyName]) ? parseFloat(this.#REF_OBJECT[objectKeyName]) : 0;
        }
    }

    // 555,555 => 555555
    setIntByCommaStringKey(objectKeyName) {
        if (!this.#REF_OBJECT || !this.#REF_OBJECT[objectKeyName]) {
            return null;
        }
        const value = this.#REF_OBJECT[objectKeyName];

        if (Number.isInteger(value)) {
            return this.setIntByKey(objectKeyName);
        } else if (Number(value) === value && !Number.isInteger(value)) {
            // 문자열 변환 ex: 559,179.27
            const parts = value.toString().split('.');
            const integerPart = parts[0];
            const decimalPart = parts[1];

            // 정수 부분에 쉼표 추가
            const withCommas = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

            // 소수 부분이 있으면 결합
            if (decimalPart) {
                return withCommas + '.' + decimalPart;
            } else {
                return withCommas;
            }
        }

        const replacedValue = parseInt(value.replace(/,/g, ''), 10);

        if (isNaN(replacedValue)) {
            return null;
        } else {
            return (replacedValue) ? replacedValue : 0;
        }
    }

    setCurrencyByKey(objectKeyName) {
        let targetValue = 0;
        if (!this.#REF_OBJECT || isNaN(Number(this.#REF_OBJECT[objectKeyName]))) {
            targetValue = 0;
        } else {
            targetValue = this.#REF_OBJECT[objectKeyName];
            // targetValue = 123456.7891
        }

        let tempValue = '';
        if (typeof targetValue === 'number') {
            tempValue = String(targetValue);
        } else {
            tempValue = targetValue;
        }

        if (!tempValue) {
            return 0;
        }

        const splitSumData = tempValue?.split('.');
        let retunrValue = null;

        retunrValue = new Intl.NumberFormat('ko-KR', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
            useGrouping: true
        }).format(splitSumData[0]);
        if (splitSumData.length > 1) {
            retunrValue += `.${splitSumData[1].substring(0, 2)}`;
        }
        return retunrValue;
    }
}