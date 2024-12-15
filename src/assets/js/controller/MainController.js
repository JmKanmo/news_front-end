import AxiosClient from '../comm/AxiosClient.js'
import { API_PATH } from '../constant/ApiConstant.js';
export default class MainController{
  constructor(){
    this.indexKorWord =['첫', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열'];
    this.view = null;
    this.isDummyMode = false;
    this.REQ_PATH = API_PATH;
    this.apiCaller = new AxiosClient(this.REQ_PATH.URL);
  }
  getInputValue(searchElement, selectror){
    let elementValue = null;
    const selectedElement = searchElement.querySelectorAll(selectror);
    if(selectedElement && selectedElement.length > 0){
      
      if(selectedElement.length > 1){
        if(selectedElement[0].type === 'radio'){
          const selectedRadio = searchElement.querySelectorAll(`${selectror}:checked`);
          if(selectedRadio && selectedRadio.length){
            elementValue = selectedRadio[0].value;
          }
        }
      }else{
        const targetElement = selectedElement[0];
        if(targetElement.type === 'checkbox'){
          elementValue = targetElement.checked;
        }else{
          elementValue = targetElement.value;
        }
      }
    }
    return elementValue;
  }


  getInputDataByKey(searchElement, ObjectKey, modelName){
    return this.getInputData(searchElement, ObjectKey, modelName);
  }

  getInputData(element, ObjectKey, modelName){
    let userInputData = {};
    ObjectKey.forEach(keyName=>{
      userInputData[keyName] = this.getInputValue(element, `#${keyName}[data-model=${modelName}]`);
    });
    return userInputData;
  }

  getEnumName(enumKey, code){
    /**
     * CommEnum 값은 전역번수로 선언되어 있고 API를 통해 받아온 상태
     */
    const targetEnum = CommEnum[enumKey];
    return targetEnum.filter(enumData=>enumData.code === code)[0].enumName;
  }
  
  vaildateEmail(email){
    const splitEmail = email.split(',');//정산서 수신 메일이 복수일시 콤마로 구분하기 때문에 split 처리 후 전부 체크 
    let isVaildEmail = true;
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    if(splitEmail?.length){
      for(let idx = 0; idx < splitEmail.length ; idx++){
        if(!re.test(splitEmail[idx])){
          isVaildEmail = false;
          break;
        }
      }
    }else{
      if(!re.test(email)){
        isVaildEmail = false;
      }
    }
    return isVaildEmail;
  }

  validatePhone(phoneNumber){
    const cleanedPhoneNumber = phoneNumber.replace(/\D/g, ""); // 숫자 이외의 모든 문자 제거
    const patternNum = /01[016789][^0][0-9]{2,3}[0-9]{3,4}/;
    return patternNum.test(cleanedPhoneNumber)
  }

  validateBusinessNumber(businessNumber) {
    if (/^[0-9]{3}-[0-9]{2}-[0-9]{5}$/.test(businessNumber)) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * 암호화 된 데이터 여부를 체크한다.
   * 암호화 데이터 판별 기준: *******
   * **/
  isEncryptData(strData) {
    if (strData != null && strData && /^[\*]+$/.test(strData)) {
      return true;
    } else {
      return false;
    }
  }

  isVaildUrl(strUrl) {
    let expUrl = /^http[s]?:\/\/([\S]{3,})/i;
    return expUrl.test(strUrl);
  }  
}