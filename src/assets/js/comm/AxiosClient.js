/**
 * Sample 
 * Instance 생성
 * const axiosClient = new AxiosClient('http://api.test.com');
 * 
 * (GET-http://api.test.com/car 요청 , 요청 성공시 readCarInfo 함수로 처리시)
 * axiosClient.getRequest('car', readCarInfo) 
 * or
 * axiosClient.getRequest('car', (response)=>{
 *  readCarInfo(response);
 * });
 * 
 * (POST-http://api.test.com/order/car 요청 , 전달 파라미터 carInfo ,요청 성공시  readCarInfo 함수로 처리시)
 * axiosClient.postRequest('order/car',carInfo, readCarInfo) 
 * or
 * axiosClient.postRequest('order/car',carInfo ,(response)=>{
 *  readCarInfo(response);
 * });
 */
/**
 * Releas Note
 * 1.00.00 : 
 *  1. 정산유틸리티 API 기반으로 제작되어 Content-type이나 설정이 변경되어야 할 경우가 있음
 */
export default class AxiosClient{
  //라이브러리 버전
  /** @type {Integer} */
  #VER = '1.00.00';
  //axios instance용 변수
  /** @type {InstanceType} */
  #axio = null; 

  //request timeout (ms)
  /** @type {Integer} */
  #timeout = ((1000 * 60) * 60) * 10;

  //logger 출력 구분을 위한 boolean 변수
  /** @type {Boolean} */
  #IS_DEV_MODE = false;

  //status code 구분용 상수
  /** @type {Integer} */
  #STATUS_CODE_100 = 100; // Continue
  /** @type {Integer} */
  #STATUS_CODE_200 = 200; // OK
  /** @type {Integer} */
  #STATUS_CODE_300 = 300; // Multiple Choice (en-US)
  /** @type {Integer} */
  #STATUS_CODE_400 = 400; // Bad Request
  /** @type {Integer} */
  #STATUS_CODE_500 = 500; // Internal Server Error

  //axios defalut config용 변수
  /** @type {Object} */
  #AxioConfig = null;

  //header용 content-type 상수
   /** @type {String} */
  #CONTENT_TYPE_MFD = 'multipart/form-data';
  /** @type {String} */
  #CONTENT_TYPE_JSON = 'application/json;charset=UTF-8';

  //요청 서브경로 도메인은 생성시 파라미터로 받으며 defaults.baseURL로 설정됨
  /** @type {String} */
  #SUB_PATH = '';
  
  //요청시 Method 상수 
  /** @type {String} */
  #METHOD_GET = 'GET';
  /** @type {String} */
  #METHOD_POST = 'POST';
  /** @type {String} */
  #METHOD_DELETE = 'DELETE';
  /** @type {String} */
  #METHOD_PUT = 'PUT';
  /** @type {String} */
  #METHOD_PATCH = 'PATCH';
  /** @type {String} */
  #REQ_METHOD = '';

  #LoadingPopuup = null;

  /**
   * @param {String} reqBaseURL 
   */
  constructor(reqBaseURL){
    try{
      if(!reqBaseURL) throw 'need api url';
      this.logger('constructor', 'initialize AxiosClient');
      this.#AxioConfig = {
        // headers : {reqAccountId : '1212112121'}
      };
      this.#axio = axios.create();
      this.#axio.defaults.baseURL = reqBaseURL;
      this.#axio.defaults.timeout = this.#timeout;
      this.#axio.defaults.withCredentials = true;
    }catch(exception){
      console.error(exception);
    }

  }

  /**
   * 로그 출력을 위한 메소드 
   * @param {*} marker 
   * @param {*} msg 
   */
  logger(marker, msg){
    if(this.#IS_DEV_MODE){
      if(msg){
        console.trace(`%c[AxiosClient-${marker}]`, "color:yellow; background-color:black", msg);
      }else{
        console.trace(`%c[AxiosClient-${marker}]`, "color:yellow; background-color:black");
      }
    }
  }

  /**
   * 파라미터 데이터와 콜백함수를 받고 REQUEST 
   * @param {*} sendData 
   * @param {*} successCallBack 
   */
  runAxioRequest( sendData, successCallBack, responseType){
    this.logger('runAxioRequest');
    this.#LoadingPopuup = Swal.fire({
      timerProgressBar: true,
      allowEscapeKey: false,
          allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      }
    })

    this.#axio.defaults.method = this.#REQ_METHOD;
    this.#axio.defaults.url = this.#SUB_PATH;

    if(responseType != null && responseType) {
      // responseType 인자가 넘어올 경우에, responseType 적용
      this.#axio.defaults.responseType = responseType;
    }

    switch(this.#REQ_METHOD){
      case this.#METHOD_GET:
        this.#axio.defaults.headers.get['Content-Type'] = this.#CONTENT_TYPE_JSON;
        break;
        
      case this.#METHOD_POST:
        this.#axio.defaults.headers.post['Content-Type'] = this.#CONTENT_TYPE_MFD;
        break;

      case this.#METHOD_PATCH:
        this.#axio.defaults.headers.patch['Content-Type'] = this.#CONTENT_TYPE_JSON;
        break;

      case this.#METHOD_DELETE:
        this.#axio.defaults.headers.delete['Content-Type'] = this.#CONTENT_TYPE_JSON;
        break;

      case this.#METHOD_PUT:
        this.#axio.defaults.headers.put['Content-Type'] = this.#CONTENT_TYPE_JSON;
        break;
    }

    if(sendData){
      this.#axio.defaults.data = sendData;
    }
   
    this.logger('runAxioRequest(config)' ,this.#axio.defaults);

    /**
     * 요청 인터셉터
     * 선언된 두개의 콜백에서 받은 값들은 return 처리 되어야 함
     */
    this.#axio.interceptors.request.use(
      (config)=>{
        this.logger('interceptors request(config)' ,config);
        this.requestInterceptor(config);
        return config;
      },
      (error)=>{
        this.logger('interceptors request(error)' ,error);
        return error;
      }
    );

    /**
     * 응답 인터셉터
     * 선언된 두개의 콜백에서 받은 값들은 return 처리 되어야 함
     */
    this.#axio.interceptors.response.use(
      (response)=>{
        this.logger('interceptors response(response)' ,response);
        this.responseInterceptor(response);
        return response;
      },
      (error)=>{
        this.logger('interceptors response(error)' ,error);
        return error;
      }
    );
    
    this.#axio(this.#axio.defaults)
    .then((response)=>{// 요청 성공
      this.logger('response' ,'success(S) =========');
      setTimeout(()=>{
        this.#LoadingPopuup.close();
        if(response?.name && response.name === 'AxiosError'){
          const errorResponse = response['response'];
          this.runSuccessCallBack(errorResponse, successCallBack);
        }else{
          this.runSuccessCallBack(response, successCallBack);
        }
       
      },500);
      
      this.logger('response' ,'success(E) =========');
    })
    .catch((error)=>{// 요청 오류
      this.logger('response' ,'error(S) =========');
      
      this.runFailureCallBack(error);
      this.logger('response' ,'error(E) =========');
    })
    .then(()=>{// 요청 후 항상 실행 
      this.logger('response' ,'done(S) ==========');
      this.runThenCallBack();
      this.logger('response' ,'done(E) ==========');
    });
  }


  /**
   * 팝업창을 띄우지 않고, 파라미터 데이터와 콜백함수를 받고 REQUEST
   * @param {*} sendData
   * @param {*} successCallBack
   * @param {*} responseType
   */
  runAxioRequestNoPopup(sendData, successCallBack, responseType) {
    this.logger('runAxioRequestNoPopup');

    this.#axio.defaults.method = this.#REQ_METHOD;
    this.#axio.defaults.url = this.#SUB_PATH;

    if(responseType != null && responseType) {
      // responseType 인자가 넘어올 경우에, responseType 적용
      this.#axio.defaults.responseType = responseType;
    }

    switch (this.#REQ_METHOD) {
      case this.#METHOD_GET:
        this.#axio.defaults.headers.get['Content-Type'] = this.#CONTENT_TYPE_JSON;
        break;

      case this.#METHOD_POST:
        this.#axio.defaults.headers.post['Content-Type'] = this.#CONTENT_TYPE_MFD;
        break;

      case this.#METHOD_PATCH:
        this.#axio.defaults.headers.patch['Content-Type'] = this.#CONTENT_TYPE_JSON;
        break;

      case this.#METHOD_DELETE:
        this.#axio.defaults.headers.delete['Content-Type'] = this.#CONTENT_TYPE_JSON;
        break;

      case this.#METHOD_PUT:
        this.#axio.defaults.headers.put['Content-Type'] = this.#CONTENT_TYPE_JSON;
        break;
    }

    if (sendData) {
      this.#axio.defaults.data = sendData;
    }

    this.logger('runAxioRequestNoPopup(config)', this.#axio.defaults);

    /**
     * 요청 인터셉터
     * 선언된 두개의 콜백에서 받은 값들은 return 처리 되어야 함
     */
    this.#axio.interceptors.request.use(
        (config) => {
          this.logger('interceptors request(config)', config);
          this.requestInterceptor(config);
          return config;
        },
        (error) => {
          this.logger('interceptors request(error)', error);
          return error;
        }
    );

    /**
     * 응답 인터셉터
     * 선언된 두개의 콜백에서 받은 값들은 return 처리 되어야 함
     */
    this.#axio.interceptors.response.use(
        (response) => {
          this.logger('interceptors response(response)', response);
          this.responseInterceptor(response);
          return response;
        },
        (error) => {
          this.logger('interceptors response(error)', error);
          return error;
        }
    );

    this.#axio(this.#axio.defaults)
        .then((response) => {// 요청 성공
          this.logger('response', 'success(S) =========');
          setTimeout(() => {
            if (response?.name && response.name === 'AxiosError') {
              const errorResponse = response['response'];
              this.runSuccessCallBack(errorResponse, successCallBack);
            } else {
              this.runSuccessCallBack(response, successCallBack);
            }

          }, 500);
          this.logger('response', 'success(E) =========');
        })
        .catch((error) => {// 요청 오류
          this.logger('response', 'error(S) =========');

          this.runFailureCallBack(error);
          this.logger('response', 'error(E) =========');
        })
        .then(() => {// 요청 후 항상 실행
          this.logger('response', 'done(S) ==========');
          this.runThenCallBack();
          this.logger('response', 'done(E) ==========');
        });
  }

  setHeader(methodType, headerObject){
    this.#axio.defaults.headers[methodType] = headerObject;
  }

  // Method GET 요청시
  getRequest(subPath, successCallBack, responseType){
    this.#SUB_PATH = subPath;
    this.#REQ_METHOD = this.#METHOD_GET;
    this.runAxioRequest(null, successCallBack, responseType);
  }

  //Method GET 요청시 (팝업을 띄우지 않고)
  getRequestNoPopUp(subPath, successCallBack, responseType) {
    this.#SUB_PATH = subPath;
    this.#REQ_METHOD = this.#METHOD_GET;
    this.runAxioRequestNoPopup(null, successCallBack, responseType);
  }

  //Method DELETE 요청시
  deleteRequest(subPath, sendParam, successCallBack){
    this.#SUB_PATH = subPath;
    this.#REQ_METHOD = this.#METHOD_DELETE;
    //this.#axio.defaults.withCredentials = true;
    this.runAxioRequest(sendParam, successCallBack);
  }

  //Method PATCh 요청시
  patchRequest(subPath, sendParam, successCallBack){
    this.#SUB_PATH = subPath;
    this.#REQ_METHOD = this.#METHOD_PATCH;
    //this.#axio.defaults.withCredentials = true;
    this.runAxioRequest(sendParam, successCallBack);
  }

  //Method POST 요청시
  postRequest(subPath, sendParam, successCallBack){
    this.#SUB_PATH = subPath;
    this.#REQ_METHOD = this.#METHOD_POST;
    //this.#axio.defaults.withCredentials = true;
    this.runAxioRequest(sendParam, successCallBack);
  }

  //Method POST 요청시 (팝업 X)
  postRequestNoPopUp(subPath, sendParam, successCallBack) {
    this.#SUB_PATH = subPath;
    this.#REQ_METHOD = this.#METHOD_POST;
    //this.#axio.defaults.withCredentials = true;
    this.runAxioRequestNoPopup(sendParam, successCallBack);
  }

  //Method PUT 요청시
  putRequest(subPath, sendParam, successCallBack){
    this.#SUB_PATH = subPath;
    this.#REQ_METHOD = this.#METHOD_PUT;
    //this.#axio.defaults.withCredentials = true;
    this.runAxioRequest(sendParam, successCallBack);
  }

  //요청 인터셉터 콜백
  requestInterceptor(config){

  }
  //응답 인터셉터 콜백
  responseInterceptor(config){

  }

  //요청 성공
  runSuccessCallBack(response, successCallBack){
    try{
      this.logger('runSuccessCallBack(response)' ,response);
      if((response != null && response) && response.status >= this.#STATUS_CODE_200){
        if(successCallBack){
          successCallBack(response);
        }
      }else{
        successCallBack(response);
      }
    }catch(excp){
      console.error(excp);
    }
  }

  //요청 오류
  runFailureCallBack(error){
    this.logger('runFailureCallBack(error)' ,error);
    const errorResponse = error.response;// Error Response Object
    const codeHttpStatus = errorResponse.status; // Status Code
    const messageError = error.message; //Error message
  }

  //요청 종료
  runThenCallBack(){
    /** Always run */
    this.logger('runThenCallBack');
  }
}