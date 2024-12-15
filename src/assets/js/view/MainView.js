import DomManager from "../comm/DomManager.js";
import {HASH_CODE, MENU_TITLE} from "../constant/HashEnums.js";
import {TEMPLATAE_INFO} from "../constant/TemplateEnums.js";
import {PAGE_CONSTANTS, TABLE_CATEGORY} from "../constant/CommonConstants.js";
import DataTablesManager from "../comm/DataTablesManager.js";
import {ExceptionData} from "../model/data/ExceptionData.js";
import {AuthController} from "../controller/util/AuthController.js";

/**
 * 화면을 구현하기 위한 MainView 클래스
 * @module MainView
 * @requires ../comm/DomManager.js
 * @requires ../constant/HashEnums.js
 */
export default class MainView {

    /**
     * HashEnums.js에 정의된 Hash 값 변수
     * @type {object}
     */
    hashCode = HASH_CODE;
    /**
     * 템플릿 파일 정보 오브젝트 변수
     * @type {object}
     * @default null
     */
    templateFileInfo = null;
    /**
     * Controller 클래스 변수
     * @type {class}
     * @default null
     */
    controller = null;
    /**
     * View가 그려진 이후 실행될 함수
     * 별도로 해당 변수에 함수를 할당하여 실행되도록 처리 한다.
     * @type {function}
     * @default null
     */
    renderCallBack = null;

    /**
     * 로드할 템플릿을 카운트 하기 위한 변수
     * @type {number}
     * @default 0
     */
    templateCount = 0;
    /**
     * 로드할 템플릿의 전체 갯수
     * @type {number}
     * @default 0
     */
    totalTemplate = 0;

    /**
     * 메뉴 화면의 타이틀
     * @type {string}
     * @default null
     */
    menuTitle = null;
    /**
     * HTML 템플릿이 적용될 엘리먼트
     * @type {HTMLElement object}
     * @default null
     */

        //최대 허용 크기 10MB
    MAX_FILE_SIZE_RIGHTSHOLDER = 10;
    MAX_FILE_SIZE_CATALOG = 1000;
    MAX_API_REQ_LENGTH = 99999;
    targetPageElement = null;

    authController = new AuthController();

    HTTP_CODE_100_CONTINUE = 100;
    HTTP_CODE_200_OK = 200;
    HTTP_CODE_204_NO_CONTENT = 204; // Delete Response Status Code
    HTTP_CODE_300_MULTIPLE_CHOICES = 300;
    HTTP_CODE_400_BAD_REQUEST = 400;
    HTTP_CODE_401_UNAUTHIRIZED = 401;
    HTTP_CODE_403_FORBIDDEN = 403;
    HTTP_CODE_500_INTERNAL_SERVER_ERR = 500;

    constructor() {
        this.domManager = DomManager.getInstance();
        this.hashCodeMain = HASH_CODE.MAIN_HASH;
        this.hashCodeSub = HASH_CODE.SUB_PATH;
        this.menuTitle = MENU_TITLE;

        this.templateFileInfo = TEMPLATAE_INFO;//템플릿 경로가 담겨진 오브젝트
        this.templateIdList = [];//templateId 배열

        this.reapeaterTemplate = '';
        this.pageAction = null;
        this.controller = null;
        this.renderCallBack = null;
        this.targetPageElement = null;

        this.contentPage = null;// 현재 화면의 엘리먼트

        this.currentHashCode = null;
        this.currentContentElement = null;// 화면이 구현될 엘리먼트

        this.ExceptionData = new ExceptionData();

        this.dataTable = new DataTablesManager();

        this.viewModel = null// 뷰모델을 정의

        this.completePopupConfig = {
            title: '',
            msg: '',
            icon: ''
        }

        this.keyupDebouncing = null;

        this.popupObj = null;
        this.init();
    }

    /**
     * init 함수 생성후 바로 실행 됨
     */
    init() {
    }

    /**
     * View를 그리는 작업을 진행
     */
    renderView(subPath, paramPath, pagination) {
        this.hidePage();
        this.targetPageElement = document.querySelector(`.content-wrapper  >  .content-body-wrap > #${subPath}`);
        this.loadDeafultTemplate(subPath, () => {
            this.callBackLoadTemplate(subPath, paramPath, pagination);
        });
    }

    /**
     * 기본으로 정의되어 있는 템플릿을 로드한다.
     * @param {string} subAction
     * @param {function} loadCallback
     */
    loadDeafultTemplate(subPath, loadCallback) {
        let templatePath = null;
        this.pageAction = subPath;

        this.setMenuPageTitle();
        this.setBreadcrumb(subPath);

        if (subPath === this.hashCodeSub.LIST) {
            templatePath = this.templateFileInfo.LIST;
        }

        if (subPath === this.hashCodeSub.VIEW) {
            templatePath = this.templateFileInfo.VIEW;
        }

        if (subPath === this.hashCodeSub.REGIST) {
            templatePath = this.templateFileInfo.REGIST;
        }
        this.domManager.loadTemplate(this.targetPageElement, templatePath, () => {
            if (loadCallback) {
                loadCallback();
            }
        });
    }

    /**
     * 상세화면들이 구현되어 있는 엘리먼트들을 모두 숨김처리한다.
     */
    hidePage() {
        this.pageElements = document.querySelectorAll('div[data-role="page"]');
        this.pageElements.forEach(page => {
            page.classList.remove('d-block');
            page.classList.add('d-none');
        })
    }

    /**
     * 특정 엘리먼트 화면만 보여줌
     * @param {string} subPath hashtag 이후의 subpath를 참조하여 보여준다.
     */
    showPage(subPath) {
        this.setMenuPageTitle();
        this.setBreadcrumb(subPath);
        let targetPage = document.querySelector(`div#${subPath}[data-role="page"]`);
        targetPage.classList.remove('d-none');
        targetPage.classList.add('d-block');
    }

    movePage(pageUri) {
        history.pushState(null, null, pageUri);
        window.dispatchEvent(new Event('popstate'));
    }

    moveToListBySegment(actionName, segmentString) {
        const frontMsg = (actionName === 'list') ? '작성중인' : '변경된';
        this.confirm(null, `${frontMsg} 내용은 저장되지 않습니다.<br>목록으로 돌아갈까요?`, 'warning', () => {
            let targetUriString = `${this.hashCodeSub.LIST}`;
            if (segmentString?.length) {
                targetUriString += `/${segmentString}`;
            }
            this.movePage(`${this.currentHashCode}/${targetUriString}`);
        });
    }

    moveToListPage(actionName) {
        const frontMsg = (actionName === 'list') ? '작성중인' : '변경된';
        this.confirm(null, `${frontMsg} 내용은 저장되지 않습니다.<br>목록으로 돌아갈까요?`, 'warning', () => {
            this.movePage(`${this.currentHashCode}/${this.hashCodeSub.LIST}`);
        });
    }

    reqCompletePopup(popupConfig, movePageCallback) {
        this.completePopup(
            popupConfig.title,
            popupConfig.msg,
            popupConfig.icon,
            (movePageCallback == null || !movePageCallback) ? () => {
                this.movePage(`${this.currentHashCode}/${this.hashCodeSub.LIST}`);
            } : movePageCallback);
    }

    getInputValue(searchElement, selectror) {
        const selectedElement = searchElement.querySelector(selectror);
        let elementValue = null;
        if (selectedElement) {
            const element = selectedElement;
            if (element.type === 'checkbox') {
                elementValue = element.checked;
            } else {
                elementValue = element.value;
            }
        }
        return elementValue;
    }

    setMenuPageTitle() {
        // 상단 페이지 타이틀 변경하기
        if (this.pageTitle != null) {
            if (this.targetPageElement.querySelector('span.pageTitle')) {
                this.targetPageElement.querySelector('span.pageTitle').innerHTML = this.pageTitle;
            }
        }
    }

    /* 변경 이력/ 판매 현황 기능 구현 된 페이지에서만 선택적 호출 */
    setUpdateHistoryButton() {
        this.targetPageElement.querySelector('#updateHistoryButton').style.visibility = 'visible';
    }

    setSaleStatusButton() {
        this.targetPageElement.querySelector('#saleStatusButton').style.visibility = 'visible';
    }

    /**
     * 변경 이력 이벤트 처리
     * **/
    setUpdateHistoryButtonEvent(callback) {
        const updateHistoryButton = document.getElementById("updateHistoryButton");

        if (this.checkIsNullOrUndefined(updateHistoryButton) && this.checkIsNullOrUndefined(callback)) {
            updateHistoryButton.addEventListener("click", callback);
        }
    }

    /**
     * 판매 현황 이벤트 처리
     */
    setSaleBoardButtonEvent(callback) {
        const saleStatusButton = document.getElementById("saleStatusButton");

        if (this.checkIsNullOrUndefined(saleStatusButton) && this.checkIsNullOrUndefined(callback)) {
            saleStatusButton.addEventListener("click", callback);
        }
    }

    /**
     * 파일 업로드 이벤트를 등록한다.
     */
    addFileUploaderEvent(maxFileSize) {
        const fileUploaderElements = this.contentPage.querySelectorAll('[data-event=upload]');
        if (fileUploaderElements && fileUploaderElements.length) {
            fileUploaderElements.forEach(element => {
                element.addEventListener('change', (uploadEvent) => {
                    this.fileUploadEventListener(uploadEvent, maxFileSize);
                });
            });
        }
    }

    addPreviewButton(img) {
        const buttonDom = document.createElement('span');
        buttonDom.id = "preview";
        buttonDom.style.cssText = 'border-radius: 6px;background: #1E9FF2;color:white;margin-left:1rem;'
        buttonDom.innerHTML = `&nbsp;<i class="la la-image" style="font-size: 1.5rem;vertical-align: bottom;"></i>선택한 파일보기&nbsp;`;
        buttonDom.dataset.img = img;
        return buttonDom;
    }

    getFileSize(fileSize) {
        return parseFloat(((fileSize / 1024) / 1024).toFixed(4))
    }

    previewWindow(clickEvent, fileInfo) {
        try {
            const eventTarget = clickEvent.target;
            let w = window.open();
            let image = new Image();
            image.src = eventTarget.dataset.img;
            const writeString = `<h3>${fileInfo.name}</h3><hr>`;
            setTimeout(function () {
                w.document.write(writeString + image.outerHTML);
            }, 0);
        } catch (excp) {
            console.error(excp);
        }

        clickEvent.preventDefault();
    }

    getHashParam() {
        return location.hash.split('/');
    }

    fileUploadEventListener(event, maxFileSize) {
        if (event.target.files) {
            const inputElement = event.target;
            let labelName = inputElement.placeholder;
            const fileInfo = event.target.files[0];
            const rootEle = event.target.closest('span');
            const label = rootEle?.querySelector('label');
            const previewElement = label?.querySelector('span#preview');

            if (fileInfo) {
                const fileSize = this.getFileSize(fileInfo.size);
                if (fileSize > maxFileSize) {
                    alert(`첨부파일은 ${maxFileSize}MB를 초과할 수 없습니다.`);
                    return;
                } else {
                    labelName = fileInfo.name;
                }

                if (fileInfo.type.indexOf('image/') > -1) {
                    const imageReader = new FileReader();
                    imageReader.onload = e => {
                        if (previewElement) {
                            previewElement.remove();
                        }
                        const previewButton = this.addPreviewButton(e.target.result);
                        label.append(previewButton);
                        previewButton.addEventListener('click', (clickEvent) => {
                            this.previewWindow(clickEvent, fileInfo);
                        })
                    }
                    imageReader.readAsDataURL(fileInfo);
                }
            } else {
                if (previewElement) {
                    previewElement.remove();
                }
            }
            const inputNodeParent = event.target.closest('div');
            inputNodeParent.querySelector('label').innerHTML = labelName;
        }
    }

    getEnumName(enumKey, code) {
        /**
         * CommEnum 값은 전역번수로 선언되어 있고 API를 통해 받아온 상태
         */
        const targetEnum = CommEnum[enumKey];
        return targetEnum.filter(enumData => enumData.code === code)[0].enumName;
    }

    setToggleButton() {
        const toggleButtons = this.targetPageElement.querySelectorAll('input[data-toggle="toggle"]');
        if (toggleButtons && toggleButtons.length) {
            toggleButtons.forEach(toggleButton => {
                $(toggleButton).bootstrapToggle();
            })
        }
    }

    /**
     * 타겟 엘리먼트에 리피터 엘리먼트를 조회하고 모두 리피터 이벤트를 설정한다.
     */
    setRepeater(targetElement = this.targetPageElement) {
        let searchElement = targetElement;
        let repeaterList = searchElement.querySelectorAll('div[data-role="repeater"]');
        repeaterList.forEach(repeaterElment => {
            $(repeaterElment).repeater();
        });
    }

    getInnerTemplate(targetElement, templateId) {
        const templateElement = targetElement.querySelector(`#${templateId}[type="text/template"]`);
        return (templateElement) ? templateElement.innerHTML : null;
    }

    addInputedRepeater(repeaterTemplate, referDataArray) {
        let repeaterString = '';
        if (repeaterTemplate && referDataArray) {
            if (referDataArray.length) {
                referDataArray.forEach(referData => {
                    repeaterString += this.getReplaceStringDom(repeaterTemplate, referData);
                });
            } else {
                repeaterString = this.getReplaceStringDom(repeaterTemplate, referDataArray);
            }
        }
        return repeaterString;
    }

    getMainTitle(subPath) {
        let menuTitle = null;
        switch (this.currentHashCode) {
            case this.hashCodeMain.NEWS:
                menuTitle = MENU_TITLE.MAIN.NEWS;
        }

        if (subPath && subPath !== this.hashCodeSub.LIST) {
            menuTitle = `<a href="${this.currentHashCode}/${this.hashCodeSub.LIST}" class="text-dark">${menuTitle}</a>`;
        }
        return menuTitle;
    }

    getSubMenuTitle(subPath) {
        let subTitle = null;
        switch (subPath) {
            case this.hashCodeSub.LIST:
                subTitle = MENU_TITLE.SUB.LIST;
                break;

            case this.hashCodeSub.REGIST:
                subTitle = MENU_TITLE.SUB.REGIST;
                break;

            case this.hashCodeSub.VIEW:
                subTitle = MENU_TITLE.SUB.VIEW;
                break;

            case this.hashCodeSub.MODIFY:
                subTitle = MENU_TITLE.SUB.MODIFY;
                break;
        }
        return subTitle;
    }

    /**
     * 해당 메뉴 명과 페이지 인디게이터를 표시 (EX 권리자 관리 > 리스트)
     * @param {*} HashCode
     * @param {*} SubPath
     */
    setBreadcrumb(SubPath) {
        const menuTitleElement = document.querySelector(`.content-wrapper h3#menuTitle`);
        menuTitleElement.innerHTML = this.getMainTitle(SubPath);

        const mainBreadcrumb = document.querySelector(`.content-wrapper ol.breadcrumb li#mainHash`);
        mainBreadcrumb.innerHTML = this.getMainTitle(SubPath);

        const subBreadcrumb = document.querySelector(`.content-wrapper ol.breadcrumb li#SubTitle`);
        subBreadcrumb.innerHTML = this.getSubMenuTitle(SubPath);
    }

    setRegistButton(uriPath, buttonTitle) {
        this.targetPageElement.querySelector("#btnRegist").href = uriPath;
        this.targetPageElement.querySelector("#btnRegist > span").innerHTML = buttonTitle;
    }

    setExcelDownloadButton(buttonTitle, callback) {
        const btnExcelDownload = this.targetPageElement.querySelector("#btnExcelDownload");

        if (btnExcelDownload != null && btnExcelDownload) {
            btnExcelDownload.style.display = 'block';
            this.targetPageElement.querySelector("#btnExcelDownload > span").innerHTML = buttonTitle;
        }
        btnExcelDownload.addEventListener('click', callback);
    }

    /**
     * 템플릿의 내용을 오브젝트 값으로 치환한다.
     * @param {*} stringDom
     * @param {*} replaceData
     * @returns
     */
    getReplaceStringDom(stringDom, replaceData) {
        const keyList = Object.keys(replaceData);
        let replaceHtml = stringDom;
        keyList.forEach((currentKey, index) => {
            replaceHtml = replaceHtml.replaceAll(`@{${currentKey}}`, replaceData[currentKey]);
        });
        return replaceHtml;
    }

    setButtonEventAll(targetElement = this.contentPage) {
        const buttonElements = targetElement.querySelectorAll('[data-event=click]');
        buttonElements.forEach(button => {
            button.addEventListener('click', (buttonEvent) => {
                this.runButtonEvent(buttonEvent);
            });
        });
    }

    setInputEventAll(targetElement = this.contentPage) {
        const inputElement = targetElement.querySelectorAll('[data-event=input]');
        inputElement.forEach(button => {
            button.addEventListener('input', (inputEvent) => {
                this.runInputEvent(inputEvent);
            });
        });
    }

    vaildateEmail(email) {
        console.error("🚀 ~ file: MainView.js:483 ~ MainView ~ vaildateEmail ~ email:", email);
        const splitEmail = email.split(',');//정산서 수신 메일이 복수일시 콤마로 구분하기 때문에 split 처리 후 전부 체크
        let isVaildEmail = true;
        var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
        for (let idx = 0; idx < splitEmail.length; idx++) {
            if (!re.test(email)) {
                isVaildEmail = false;
                break;
            }
        }

        return isVaildEmail;
    }

    getAttachedFile(inputFileSelector) {
        const targetFileInput = this.contentPage.querySelector(inputFileSelector);
        let attachedFile = null;
        try {
            if (targetFileInput) {
                attachedFile = targetFileInput.files[0];
            }
        } catch (excp) {
            console.error(excp);
        }

        return attachedFile;

    }

    /**
     * view가 그려진 이후 실행할 함수
     */
    completeRender() {
    }

    drawTableCategorySelect(version) {
        const tableSearchBoxDOM = this.targetPageElement.querySelector('#dataTableControl');

        if (version && version === 'V2') {
            // V2의 경우에, V1 제거 후, V2 Template HTML 로드
            const tableSearchV1DOM = document.getElementById("tableSearchV1");
            if (tableSearchV1DOM) {
                tableSearchV1DOM.parentNode.removeChild(tableSearchV1DOM);
            }
            const tableSearchV2DOMHTML = document.getElementById("searchTableMenuV2").innerHTML;
            tableSearchBoxDOM.innerHTML += tableSearchV2DOMHTML;
        }
    }

    drawTableListOrderDirectionSelectBox() {
        const tableListOrderDirectionSelectBox = this.targetPageElement.querySelector('#dateOrderDirectionSelectBox');
        if (tableListOrderDirectionSelectBox) {
            tableListOrderDirectionSelectBox.style.display = 'inline-block';
        }
    }

    setTableSearchPlaceHolder(placeHolder) {
        if (placeHolder) {
            this.dataTable.initTableComplete = (evt) => {
                const tHeadFirst = evt.nTable.querySelector('thead tr th:first-child');
                tHeadFirst.innerHTML = `<input type="checkbox" data-role="selectChecker">`;
                this.targetPageElement.querySelector('input#tableSearchInput').setAttribute('placeHolder', placeHolder);
                this.targetPageElement.querySelector('input#tableSearchInput').setAttribute('title', placeHolder);
            };
        }
    }

    addSelectCheckEvent() {
        const selectChecker = this.targetPageElement.querySelector('input[data-role=selectChecker]');
        /**
         * 리스트의 '선택 삭제' 버튼 클릭 이벤트
         */
        selectChecker.addEventListener('change', (evt) => {
            const checkboxList = this.targetPageElement.querySelectorAll('input[data-role=delete]');
            checkboxList.forEach(checkboxEle => {
                checkboxEle.checked = evt.target.checked;
            });
        })
    }


    /** 삭제 버튼 숨기기 여부 수행 **/
    hideDeleteButton(deleteBtn, flag) {
        if (deleteBtn != null && deleteBtn) {
            if (flag) {
                deleteBtn.classList.add('d-none');
            } else {
                deleteBtn.classList.remove('d-none');
            }
        }
    }

    getApiErrorMessage(errResponse) {
        console.log("errResponse >>>", errResponse);
        let errorMsg = '';
        if (errResponse?.data && errResponse.data?.errors) {
            const errorList = errResponse.data.errors;
            if (errorList?.length) {
                errorList.forEach((errorInfo, index) => {
                    const fieldInfo = (errorInfo?.field && errorInfo.field?.length) ? `<b>${errorInfo.field}</b>` : '';
                    errorMsg += `<br>(${index + 1}) ${fieldInfo} ${errorInfo.defaultMessage}`;
                });
            }
        } else {
            if (errResponse?.data && errResponse.data?.detail) {
                errorMsg = errResponse.data.detail;
            }
        }
        return errorMsg;
    }

    getInputDataByKey(ObjectKey, modelName) {
        return this.getInputData(this.contentPage, ObjectKey, modelName);
    }

    getInputData(element, ObjectKey, modelName) {
        let userInputData = {};
        ObjectKey.forEach(keyName => {
            userInputData[keyName] = this.getInputValue(element, `#${keyName}[data-model=${modelName}]`);
        });
        return userInputData;
    }

    loginPopup(successCallBack) {
        Swal.fire({
            title: 'Login',
            icon: 'info',
            html: `<input type="text" id="login" class="swal2-input" placeholder="ID">
      <input type="password" id="password" class="swal2-input" placeholder="Password">`,
            confirmButtonText: 'Sign in',
            focusConfirm: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
            preConfirm: () => {
                const login = Swal.getPopup().querySelector('#login').value
                const password = Swal.getPopup().querySelector('#password').value

                let vaildationMessage = null;

                if (!password) {
                    vaildationMessage = '패스워드를 입력해 주세요'
                }

                if (!login) {
                    vaildationMessage = '아이디를 입력해 주세요.'
                }

                if (vaildationMessage) {
                    Swal.showValidationMessage(`${vaildationMessage}`)
                }
                return {id: login, password: password}
            }
        }).then((result) => {
            console.error("result", result);
            this.authController.reqPostLogin(result.value, (response) => {
                if (response && response.status === 200) {
                    if (successCallBack) {
                        successCallBack()
                    } else {
                        location.reload();
                    }
                } else {
                    this.alert('로그인 오류', '로그인이 실패 했습니다.', 'error', () => {
                        this.authController.reqPostLogout(() => {
                            location.href = '/';
                        });
                    });
                }
            });
        })
    }

    alert(titleStr = null, msgStr = '', iconName, callBack) {
        Swal.fire({
            title: titleStr,
            html: msgStr,
            icon: (!iconName || iconName === '') ? 'info' : iconName,
            allowEscapeKey: false,
            allowOutsideClick: false,
        }).then((result) => {
            if (callBack) {
                callBack();
            }
        });
    }

    completePopup(titleStr = null, msgStr = '', iconName = 'success', callBack) {
        Swal.fire({
            title: titleStr,
            html: msgStr,
            icon: iconName,
            allowEscapeKey: false,
            allowOutsideClick: false,
            confirmButtonText: 'OK',
        }).then((result) => {
            if (result.isConfirmed) {
                if (callBack) {
                    callBack();
                }
            }
        })
    }

    confirm(titleStr = null, msgStr = '', iconName = 'question', callBack) {
        Swal.fire({
            title: titleStr,
            html: msgStr,
            icon: (!iconName) ? 'question' : iconName,
            allowEscapeKey: false,
            allowOutsideClick: false,
            showCancelButton: true,
            confirmButtonText: "확인",
            cancelButtonText: "취소",
        }).then((success) => {
            if (success.isConfirmed) {
                if (callBack) {
                    callBack();
                }
            }
        });
    }

    confirmWithCustomButton(titleStr = null, msgStr = '', buttonTitle, confirmCallBack, cancleCallBack) {
        Swal.fire({
            title: titleStr,
            html: msgStr,
            icon: 'question',
            allowEscapeKey: false,
            allowOutsideClick: false,
            showCancelButton: true,
            confirmButtonText: buttonTitle.confirm,
            cancelButtonText: buttonTitle.cancel,
        }).then((success) => {
            if (success.isConfirmed) {
                if (confirmCallBack) {
                    confirmCallBack();
                }
            } else {
                if (cancleCallBack) {
                    cancleCallBack();
                }
            }
        });
    }

    isloading(loadingComple) {
        if (loadingComple) {
            Swal.close();
        } else {
            Swal.fire({
                title: '로딩중',
                timerProgressBar: true,
                allowEscapeKey: false,
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading()
                }
            })
        }
    }

    numberSeparator(num) {
        let commaCounter = 10;

        const Separator = ',';
        const DecimalSeparator = '.';

        for (let i = 0; i < commaCounter; i++) {
            num = num.replace(Separator, "");
        }

        let x = num.split(DecimalSeparator);
        let y = x[0];
        let z = x.length > 1 ? DecimalSeparator + x[1] : "";
        let rgx = /(\d+)(\d{3})/;

        while (rgx.test(y)) {
            y = y.replace(rgx, "$1" + Separator + "$2");
        }
        commaCounter++;
        return y + z;
    }

    setNumberSeparator(inputElement) {
        const Separator = ',';
        const DecimalSeparator = '.';
        inputElement.addEventListener("input", (inputEvent) => {
            const reg = new RegExp(`^-?\\d*[${Separator}${DecimalSeparator}]?(\\d{0,3}${Separator})*(\\d{3}${Separator})?\\d{0,3}$`);
            const key = inputEvent.data || inputEvent.target.value.substr(-1)
            if (reg.test(key)) {
                inputEvent.target.value = this.numberSeparator(inputEvent.target.value);
            } else {
                inputEvent.target.value = inputEvent.target.value.substring(0, inputEvent.target.value.length - 1);
                inputEvent.preventDefault();
                return false;
            }
        });
        inputElement.value = this.numberSeparator(inputElement.value);
    }

    inputSetNumberFormat(inputEvent) {
        const rawValue = inputEvent.target.value;
        const numericValue = rawValue.replace(/[^0-9.]/g, '');
        const formattedValue = new Intl.NumberFormat('ko-KR', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 100,
            roundingMode: 'floor',
            useGrouping: true
        }).format(numericValue);
        inputEvent.target.value = formattedValue;
    }

    setLimitRateInput(inputElement, callBack) {
        if (this.keyupDebouncing) {
            clearTimeout(this.keyupDebouncing);
        }

        this.keyupDebouncing = setTimeout(() => {
            const tarRate = Number(inputElement.value);
            if (!isNaN(tarRate)) {
                if (tarRate > 100) {
                    inputElement.value = 100;
                } else {
                    let targetRate = (parseFloat(tarRate) < 0) ? 0 : parseFloat(tarRate).toFixed(2);
                    inputElement.value = targetRate;
                }
            }

            if (callBack) {
                callBack();
            }

            try {
                clearTimeout(this.keyupDebouncing);
            } catch (excp) {
                console.error(excp);
            } finally {
                this.keyupDebouncing = null;
            }
        }, 800);
    }

    isValidEmail(email) {
        if (email == null || !email) {
            return false;
        }
        // 이메일 형식을 검증하기 위한 정규 표현식
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    checkIsNullOrUndefined(obj) {
        return obj != null && obj ? true : false;
    }

    addOneDay(dateString) {
        const date = new Date(dateString);
        date.setDate(date.getDate() + 1); // 현재 날짜에 1일 추가
        // 날짜를 YYYY-MM-DD 형식의 문자열로 변환
        const year = date.getFullYear();
        let month = date.getMonth() + 1; // getMonth()는 0부터 시작하므로 1을 더함
        let day = date.getDate();
        // 월과 일이 10보다 작으면 앞에 0을 붙여 두 자리로 만듦
        month = month < 10 ? '0' + month : month;
        day = day < 10 ? '0' + day : day;
        return `${year}-${month}-${day}`;
    }

    /**
     * JSON 형태의 객체를 QueryParam 형태의 문자열로 변환 및 반환
     * @param json
     * @returns {string}
     */
    queryStr(json) {
        return Object.keys(json).map(function (key) {
            return encodeURIComponent(key) + '=' + encodeURIComponent(json[key]);
        }).join('&');
    }
}