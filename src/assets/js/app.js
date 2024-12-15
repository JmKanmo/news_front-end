import Router from './router/Router.js';
/**
 * App Init
 */
/**
 * DOMContentLoaded : 브라우저가 HTML을 전부 읽고 DOM 트리를 완성하는 즉시 발생합니다. 이미지 파일(<img>)이나 스타일시트 등의 기타 자원은 기다리지 않습니다.
 * load :  HTML로 DOM 트리를 만드는 게 완성되었을 뿐만 아니라 이미지, 스타일시트 같은 외부 자원도 모두 불러오는 것이 끝났을 때 발생합니다.
 * beforeunload/unload : 사용자가 페이지를 떠날 때 발생합니다.
 * DOMContentLoaded -> readystate (complete) -> load
 */
document.addEventListener('readystatechange', (event) => {
  /**
   * ${document.readyState}
   * loading: 문서가 로딩 중
   * interactive: 문서는 파싱되었지만 이미지, 스타일, 프레임은 여전히 로딩 중
   * complete: 모든 리소스가 로딩된 상태
   */
  });
document.addEventListener('DOMContentLoaded', (event) => {

});

window.addEventListener('load', (event) => {
  try{
    AppInfoPrint();
    const appRouter = new Router();
    appRouter.init();
  }catch(excp){
    console.log(excp);
  }
});