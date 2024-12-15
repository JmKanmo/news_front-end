import {ViewModel} from "../ViewModel.js";

export default class NewsModel extends ViewModel {
    constructor() {
        super();
        this.templateIdList = [];
        this.pageTemplateList = [];
    }

    readPageTemplate(newsData, templateIdList) {
        this.pageTemplateList = [];
        templateIdList.forEach(templateId => {
            const templateStr = this.getReplaceStringDom(templateId, newsData);
            this.pageTemplateList.push(templateStr);
        });
    }

    getSalesMatchPage() {
        return this.pageTemplateList.join('');
    }

    registViewHelpers(newsData) {
        this.checkIsNullOrUndefined();
        this.arithmeticNumber();
        this.isDisplayNone();
        this.setValueByType();
        this.setInputAttribute();
        this.setPlainTextByType();
        this.checkViewYn();
        this.readPageTemplate(newsData, this.templateIdList);
    }

    checkIsNullOrUndefined() {
        Handlebars.registerHelper('checkIsNullOrUndefined', (obj) => {
            return (obj == null && !obj) ? true : false;
        });
    }


    /**
     * 화면상의 버그(?) 때문에 추가
     * @param rightId
     * @returns {string}
     */
    isDisplayNone() {
        Handlebars.registerHelper('isDisplayNone', (rightId) => {
            return (rightId != null && rightId) ? '' : 'd-none';
        });
    }

    checkViewYn() {
        Handlebars.registerHelper('checkViewYn', (viewYn) => {
            let isChecked = '';
            if (viewYn || viewYn === 'Y') isChecked = 'checked';

            return isChecked;
        });
    }

    arithmeticNumber() {
        Handlebars.registerHelper('arithmeticNumber', function (value, number, sign) {
            switch (sign) {
                case '+':
                    return (value == null || !value) ? number : value + (number == null || !number ? 0 : parseInt(number));
                case '-':
                    return (value == null || !value) ? number : value - (number == null || !number ? 0 : parseInt(number));
                default:
                    return value;
            }
        });
    }
}