import AxiosClient from "./comm/AxiosClient.js";

const axiosClient = new AxiosClient(API_URL);
console.error(" axiosClient >", axiosClient);
document.addEventListener('readystatechange', (event) => {
  console.log(axiosClient);
  AppInit();
/**
* ${document.readyState}
* loading: 문서가 로딩 중
* interactive: 문서는 파싱되었지만 이미지, 스타일, 프레임은 여전히 로딩 중
* complete: 모든 리소스가 로딩된 상태
*/
});

const AppInit =()=>{
  const buttonNodeArray = document.body.querySelectorAll('button');
  buttonNodeArray.forEach(buttonNode=>{
    buttonNode.addEventListener('click',buttonEventListener);
  });
}

const apiSessionCheck = (response)=>{
  console.log("response ", response);
  if(response?.status){
    if(typeof response.data !== 'object'){
      loginPopup();
    }else{
      switch(response.status){
        case 200: 
          console.log(">>>>>>>>>> ");
        break;
  
        case 401:
          loginPopup();
        break;
  
        default:
          if(typeof response !== 'object'){
            loginPopup();
          }else{
            alert("오류!!!!");
          }
        
        break;
      }
    }

  }
}

const buttonEventListener = (clickEvent)=>{
  const targetElement = clickEvent.target;
  console.error(`${targetElement.id}`,targetElement);
  switch(targetElement.id){
    case 'apiCall1':
      axiosClient.getRequest('',null,(ApiResponse)=>{
        console.error("ApiResponse >>>>>>>", ApiResponse);
        apiSessionCheck(ApiResponse.response);
      });
    break;

    case 'apiCall2':
      $.ajax({
        url :`${API_URL}`,
        method : 'GET',
        contentType : 'application/json;',
        crossDomain: true,
        xhrFields: {
          withCredentials: true
        },
        beforeSend : (e)=>{
          console.log(e);
        },
        success : (data, status, xhr)=>{
          console.log("data, status, xhr", data, status, xhr);
        },
        error :(xhrData, status, error)=>{
          console.error(xhrData, status, error);
        },
        complete : (xhr, status)=>{
          console.log(xhr, status);
        }
      })
    break;
    
    case 'apiCall3':
      fetch(`${API_URL}`,{
        method : 'GET',
        credentials: "include",
        headers : {
          'Content-Type' : 'application/json;charset=utf-8'
        },
        bodyUsed : true
      })
      .then((response) => {console.log(response.status); return response.json()})
      .then(response=>{console.log("reponse" ,response)})
      .catch((data) => console.log(data));
    break;

    case 'apiCall4':
      let xhr = new XMLHttpRequest();
      xhr.open('GET', `${API_URL}`);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.withCredentials = true;
      try{
        xhr.send();
      }catch(excp){
        console.error('-----------------------------');
        console.error(excp);
        console.error('-----------------------------');
      }
      

// 4. This will be called after the response is received
      xhr.onload = function() {
        if (xhr.status != 200) { // analyze HTTP status of the response
          console.error("xhr.status", xhr)
          console.log(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
        } else { // show the result
          console.error("xhr.status", xhr)
          console.log(`Done, got ${xhr.response.length} bytes`); // response is the server
        }
      };

      xhr.onprogress = function(event) {
        console.error("xhr.onprogress", event)
        if (event.lengthComputable) {
          console.log(`Received ${event.loaded} of ${event.total} bytes`);
        } else {
          console.log(`Received ${event.loaded} bytes`); // no Content-Length
        }
      };

      xhr.onerror = function(e) {
        console.error("xhr.onprogress", e)
        console.log("Request failed");
      };
    break;

    case 'apiLogin':
      loginPopup();
    break;

    case 'apiLogout':
      axiosClient.postRequest('/logout', null, (response)=>{
        console.log("response >>>>>>>>>>>", response);
      });
    break;
  }
}



const loginPopup =()=>{
  Swal.fire({
    title: 'Login',
    icon :'info',
    html: `<input type="text" id="login" class="swal2-input" placeholder="ID">
    <input type="password" id="password" class="swal2-input" placeholder="Password">`,
    confirmButtonText: 'Sign in',
    focusConfirm: false,
    allowEscapeKey: false,
    allowOutsideClick: true,
    preConfirm: () => {
      const login = Swal.getPopup().querySelector('#login').value
      const password = Swal.getPopup().querySelector('#password').value

      let vaildationMessage = null;

      if ( !password) {
        vaildationMessage = '패스워드를 입력해 주세요'
      }

      if(!login){
        vaildationMessage = '아이디를 입력해 주세요.'
      } 

      if(vaildationMessage){
        Swal.showValidationMessage(`${vaildationMessage}`)
      }
      return { id: login, password: password }
    }
  }).then((result) => {
    console.error("result", result);
    const userCredential = result.value;
    const userFormData = new FormData();
    userFormData.append('username', userCredential.id);
    userFormData.append('password', userCredential.password);
    axiosClient.postRequest('/auth/login', userFormData, (response)=>{
      console.log("response >>>>>>>>>>>", response);
    });
  })
}