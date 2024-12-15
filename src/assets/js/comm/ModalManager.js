/**
 * @filename : DomManager.js
 * @author gplee@moundmedia.co.kr <gplee@moundmedia.co.kr>
 */
/**
 * HTML Element와 Dom의 전반적인 조작을 위한 유틸
 * @class
 */
 export default class ModalManager{
  static getInstance(){
    if(!this.instance){
      this.instance = new ModalManager();
    }
    return this.instance;
  }
}