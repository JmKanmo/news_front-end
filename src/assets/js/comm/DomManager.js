/**
 * @filename : DomManager.js
 * @author gplee@moundmedia.co.kr <gplee@moundmedia.co.kr>
 * @version 1.0.0
 */
/**
 * @class DomManager
 * @classdesc HTML Element와 Dom의 전반적인 조작을 위한 유틸
 */
 export default class DomManager{
  static getInstance(){
    if(!this.instance){
      this.instance = new DomManager();
    }
    return this.instance;
  }

  /**
   * HTML 파일로 선언된 템플릿을 로드 한다.
   * @param {HTMLElement} targetElmement 해당 템플릿이 추가될 엘리먼트
   * @param {string} templateHtmlPath 템플릿 파일의 경로
   * @param {function} loadCompleteFunction 템플릿이 추가된 이후 실행될 콜백함수
   * @example
   * // #main에 tpl템플릿 추가
   * var targetElment = document.getquerySelector('#main');
   * loadTemplate(targetElment, '../view/tpl.html', myCallBack );
   */
  loadTemplate(targetElmement, templateHtmlPath , loadCompleteFunction){
    fetch(templateHtmlPath+`?preventcache=${new Date().getTime()}`)
    .then(response=> response.text())
    .then(templateHtml=>{
      targetElmement.innerHTML = templateHtml;
      const templateList = targetElmement.querySelectorAll('[type="text/x-handlebars-template"]');
      //handlebars 템플릿을 조회 한다.
      if(templateList){
        //handlebars 템플릿이 조회 되고 해당 ID의 템플릿이 하나만 있다면 
        //신규로 추가된 템플릿으로 판단하고 해당 엘리먼트를 appendChild 시킨다.
        templateList.forEach(elment=>{
          if(document.querySelectorAll(`#${elment.id}`).length === 1){
            document.body.appendChild(elment);
          }
        });
      }

      if(loadCompleteFunction) loadCompleteFunction();
    })
  }

  

  getHtmlTemplate(tplId){
    return document.body.querySelector(tplId).innerHTML;
  }

  getButton(innerTitle , linkUrl){
    return `<a href="${linkUrl}" class=>${innerTitle}</a>`
  }
}