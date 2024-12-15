import {API_PATH} from "../../constant/ApiConstant.js";

export class ViewModel {
    constructor() {
        this.pageTemplateList = [];
    }

    nullCheck() {
        Handlebars.registerHelper('isNotNull', function (value, options) {
            return value !== null && value !== undefined ? options.fn(this) : options.inverse(this);
        });
    }


    // ex: 202404 => 2024-04
    YYYYMM() {
        Handlebars.registerHelper('YYYYMM', (dateStr, defaultValue) => {
            if (!this.checkIsNullOrUndefined(dateStr)) {
                return `9999-12`;
            }
            let year = dateStr.substring(0, 4);
            let month = dateStr.substring(4, 6);
            const formattedString = `${year}-${month}`;
            return formattedString;
        });
    }

    getFormateDateStr(paramDate, typeStr) {
        let dateObject;
        if (paramDate) {
            dateObject = (typeof paramDate === 'string') ? new Date(paramDate) : paramDate;

            const strYYYYY = dateObject.getFullYear();
            const strMM = (dateObject.getMonth() + 1 < 10) ? '0' + (dateObject.getMonth() + 1) : dateObject.getMonth() + 1;
            const strDD = (dateObject.getDate() < 10) ? '0' + dateObject.getDate() : dateObject.getDate();

            if (!typeStr || typeStr === 'YYYYMMDD') {
                return `${strYYYYY}-${strMM}-${strDD}`;
            }
            if (typeStr === 'YYYYMMDDHH') {
                return `${strYYYYY}-${strMM}-${strDD} ${dateObject.toLocaleTimeString()}`;
            }
        } else {
            return '';
        }
    }

    /** 판매 현황 / 팝업창 내 날짜 표기 **/
    getFormatedDateStr2(paramDate) {
        if (paramDate != null && paramDate) {
            return paramDate['monthFirstDate'];
        }
    }

    setDateFormat() {
        Handlebars.registerHelper('setDateFormat', (dateValue, defaultValue) => {
            if (dateValue) {
                const dateString = this.getStringByType(dateValue, 'dateStart');
                return dateString;
            } else {
                return '';
            }
        })
    }

    attachedFileCheck() {
        Handlebars.registerHelper('attachedFileCheck', (attachedFile, defaultValue) => {
            if (attachedFile) {
                const filePath = `${API_PATH.URL}${attachedFile.localUrl}`;
                const downLoadTag = `&nbsp;<a href="${filePath}" download target="_blank" style="border-radius: 6px;background: #FF1493;color:white;">&nbsp;<i class="la la-cloud-download" style="font-size: 1.5rem;vertical-align: bottom;"></i>${attachedFile.fileName}&nbsp;&nbsp;</a>`;
                return new Handlebars.SafeString(downLoadTag);
            }
        })
    }

    /**
     * {{needVisible rightId}}
     */
    checkNeedVisible() {
        Handlebars.registerHelper('needVisible', (checkValue) => {
            if (!checkValue) return new Handlebars.SafeString(`style="display:none!important;"`);
        })
    }

    isRequire() {
        Handlebars.registerHelper('isRequire', (labelText, defaultValue) => {
            return new Handlebars.SafeString(`<strong>${labelText}</strong><sup class="text-danger">*</sup>`);
        })
    }

    setLimitDate() {
        Handlebars.registerHelper('setLimitDate', (dateType, defaultValue) => {
            let limitMinDate = "2000-01-01";
            let limitMaxDate = "9999-12-31";

            if (dateType === 'month') {
                limitMinDate = "2000-01";
                limitMaxDate = "9999-12";
            }

            return new Handlebars.SafeString(`min=${limitMinDate} max=${limitMaxDate}`);
        })
    }

    setInputAttribute() {
        Handlebars.registerHelper('setInputAttribute', (title, dataType, optionString, optionClass, defaultValue) => {
            let inputClass = `form-control input-sm`;
            if (typeof optionClass === 'string') {
                inputClass += ` ${optionClass}`;
            }

            const optionStr = (optionString && optionString.length) ? optionString : '';
            return new Handlebars.SafeString(`id="${title}" class="${inputClass}" name="${title}" data-type="${dataType}" ${optionStr}`);
        })
    }

    getCurrencyString(locationTitle, number, currencySymbol) {
        const symbolOption = (currencySymbol) ? {style: 'currency', currency: currencySymbol} : {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 100,
            roundingMode: 'floor',
            useGrouping: true
        };
        return new Intl.NumberFormat(locationTitle, symbolOption).format(number)
    }

    getStringByType(inputValue, dataType) {
        let returnValue = null;

        switch (dataType) {
            case 'currency':
                if (!inputValue) {
                    returnValue = 0;
                } else {
                    if (!Number.isInteger(inputValue)) {
                        // 문자열 변환 ex: 559,179.27
                        const cleanedString = inputValue.toString().replace(/,/g, '');
                        returnValue = this.getCurrencyString('ko-KR', cleanedString);
                    } else {
                        returnValue = this.getCurrencyString('ko-KR', inputValue);
                    }
                }
                break;

            case 'month':
                let dateObject = inputValue;
                if (dateObject) {
                    if (typeof dateObject !== 'object') {
                        dateObject = new Date(inputValue);
                    }
                    const strYYYY = dateObject.getFullYear();
                    const strMM = ((dateObject.getMonth() + 1) < 10) ? '0' + (dateObject.getMonth() + 1) : dateObject.getMonth() + 1;
                    returnValue = `${strYYYY}-${strMM}`;
                } else {
                    return inputValue;
                }
                break;

            case 'number':
            case 'float':
                returnValue = (!inputValue) ? 0 : inputValue;
                break;

            case 'date' :
                returnValue = this.getFormateDateStr(inputValue, 'YYYYMMDD');
                break;

            case 'dateStart':
                let dateStirng = null;
                if (!inputValue) {
                    dateStirng = new Date();
                } else {
                    if (typeof inputValue === 'object') {
                        dateStirng = inputValue?.toISOString();
                    } else {
                        dateStirng = inputValue;
                    }
                }
                returnValue = this.getFormateDateStr(dateStirng, 'YYYYMMDD');
                break;

            case 'dateEnd':
                returnValue = (!inputValue) ? '9999-12-31' : this.getFormateDateStr(inputValue, 'YYYYMMDD');
                break;

            case 'dateFormated':
                returnValue = (!inputValue) ? '' : this.getFormateDateStr(inputValue, 'YYYYMMDD');
                break;

            case 'dateFormated2':
                returnValue = (!inputValue) ? '' : this.getFormatedDateStr2(inputValue);
                break;

            case 'dateLocale':
                returnValue = (!inputValue) ? '' : this.getFormateDateStr(inputValue, 'YYYYMMDDHH');
                break;

            case 'tag':
                returnValue = new Handlebars.SafeString((!inputValue) ? '' : inputValue);
                break;

            default:
                returnValue = (!inputValue) ? '' : inputValue;
        }
        return returnValue;
    }

    /**
     * 권리자 주요 정보 (암호화)에 대해 표시 여부를 결정
     * **/
    setEncryptText() {
        Handlebars.registerHelper('setEncryptText', (inputValue, dataType, defaultValue) => {
            if (inputValue === null || !inputValue) {
                return inputValue;
            }

            // Base64 정규 표현식 (URL-safe 포함)
            const base64Regex = /^(?:[A-Za-z0-9+/]{4})*?(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

            // 최소 하나 이상의 알파벳(대소문자)을 포함하는지 확인하는 정규 표현식
            const containsAlphabetRegex = /[A-Za-z]/;

            // 두 조건을 모두 만족하는지 확인
            const result = base64Regex.test(inputValue) || containsAlphabetRegex.test(inputValue);

            if (result === true) {
                if (dataType != null && dataType) {
                    switch (dataType) {
                        case "bankAccountNum" : // 계좌 번호
                            return "**********";

                        case "idNumber": // 주민등록번호 뒷자리 7자리
                            return "*******";

                        case "mobile": // 휴대폰 번호 (담당자)
                        case "managerMobile":
                            return "*************";

                        default:
                            return inputValue;
                    }
                }
                return inputValue;
            } else {
                return inputValue;
            }
        });
    }

    setPlainTextByType() {
        Handlebars.registerHelper('setPlainTextByType', (inputValue, dataType, defaultValue) => {
            return this.getStringByType(inputValue, dataType);
        })
    }

    encodeEntities(inputString) {
        if (typeof inputString === 'string') {
            return inputString.replace(/["&<>]/g, (match) => {
                switch (match) {
                    case '"':
                        return "&quot;";
                    case "&":
                        return "&amp;";
                    case "<":
                        return "&lt;";
                    case ">":
                        return "&gt;";
                    default:
                        return match;
                }
            });
        } else {
            return inputString
        }
    }

    setValuesByType() {
        Handlebars.registerHelper('setValuesByType', (inputValue1, inputValue2, dataType, template, defaultValue) => {
            let retunText1 = this.encodeEntities(this.getStringByType(inputValue1, dataType));
            let retunText2 = this.encodeEntities(this.getStringByType(inputValue2, dataType));

            if (!retunText1 && !retunText2) {
                return '';
            }
            let combinedText = this.formatString("{0} ({1})", [retunText1, retunText2]);
            return new Handlebars.SafeString(`value="${combinedText}" data-value="${combinedText}"`);
        })
    }

    setValuesByType2() {
        Handlebars.registerHelper('setValuesByType2', (inputValue1, inputValue2, dataType, template, defaultValue) => {
            let retunText1 = this.encodeEntities(this.getStringByType(inputValue1, dataType));
            let retunText2 = this.encodeEntities(this.getStringByType(inputValue2, dataType));

            if (!retunText1 && !retunText2) {
                return '';
            }

            const format = (template != null && template) ? template : "{0} ({1})";
            const combinedText = this.formatString(format, [retunText1, retunText2]);
            return new Handlebars.SafeString(`value="${combinedText}" data-value="${combinedText}"`);
        });
    }


    setValueByType() {
        Handlebars.registerHelper('setValueByType', (inputValue, dataType, defaultValue) => {
            let retunText = this.encodeEntities(this.getStringByType(inputValue, dataType));
            return new Handlebars.SafeString(`value="${retunText}" data-value="${retunText}"`);
        })
    }

    getWrapElement(tagName, htmlStr, className) {
        const wrapElement = document.createElement(tagName);
        if (className) {
            wrapElement.classList.add(className);
        }
        wrapElement.innerHTML = htmlStr;
        return wrapElement;
    }


    /**
     * 템플릿의 내용을 오브젝트 값으로 치환한다.
     * @param {*} htmlTpl
     * @param {*} replaceData
     * @returns replaceHtml
     */
    getReplaceStringDom(templateId, replaceData) {
        const handlebarsTpl = document.querySelector(`#${templateId}`).innerHTML;
        const handlerTpl = Handlebars.compile(handlebarsTpl);
        return handlerTpl(replaceData);
    }

    registerPartial(registerId, templateId, replaceData) {
        Handlebars.registerPartial(registerId, this.getReplaceStringDom(templateId, replaceData));
    }

    /**
     * ex) formatString("{0} ({1})", ["BTS","RG20331231"]) => "BTS (RG20331231)"
     * @param str
     * @param values
     * @returns {*}
     */
    formatString(str, values) {
        return str.replace(/\{(\d+)\}/g, function (match, index) {
            return values[index];
        });
    }

    checkIsNullOrUndefined(obj) {
        return obj != null && obj ? true : false;
    }

    checkStrEqual(str, target) {
        return (str != null && target != null) && (str === target);
    }

    abs() {
        Handlebars.registerHelper('abs', (value, defaultValue) => {
            if (value == null || !value || isNaN(Number(value))) {
                return value;
            }
            const numberValue = Math.abs(Number(value));

            if (numberValue == null || !numberValue) {
                return numberValue;
            } else {
                return numberValue;
            }
        });
    }

    /**
     * 1,825,240 => 1825240
     * @param value
     * @return {*|string}
     */
    convertCurrencyNumberFormat(value) {
        if (value != null && value) {
            // 입력 값에서 쉼표를 제거
            const numericValue = !isNaN(Number(value)) ? value : value.replace(/,/g, '');
            // 숫자로 변환 시도
            const floatNumericValue = parseFloat(numericValue);

            // 유효한 숫자인지 확인
            if (!isNaN(floatNumericValue)) {
                // 반올림 수행
                let roundedValue = Math.round(floatNumericValue);
                // 반올림된 숫자를 콤마 포맷으로 변환하여 반환
                return roundedValue;
            }
            // 숫자가 아니면 원래 값을 그대로 반환
            return value;
        } else {
            return value;
        }
    }
}