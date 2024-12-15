import {HASH_CODE} from "../constant/HashEnums.js";
import IndexView from "../view/IndexView.js";
import RightsHolderView from "../view/rightsHolder/RightsHolderView.js";
import RecoupmentView from "../view/Contract/RecoupmentView.js";
import CatalogDigitalView from "../view/catalog/digital/CatalogDigitalView.js";
import ContractDspView from "../view/Contract/ContractDspView.js";
import SharedAssetView from "../view/catalog/digital/SharedAssetView.js";
import SharedRecordView from "../view/catalog/physical/SharedRecordView.js";
import SalesFileView from "../view/Sales/SalesFlieView.js";
import SalesCalcView from "../view/Sales/SalesCalcView.js";
import { SalesDetailView } from "../view/Sales/SalesDetailView.js";
import {API_PATH} from "../constant/ApiConstant.js";
import CatalogPhysicalView from "../view/catalog/physical/CatalogPhysicalView.js";
import NoticeView from "../view/notice/NoticeView.js";
import SalesMatchView from "../view/Sales/SalesMatchView.js";
import SalesReportView from "../view/Sales/SalesReportView.js";

export default class Router {
  constructor() {
    this.HashCodes = null;
    this.SubActions = null;
    this.views = {};
  }

  init() {
    this.HashCodes = HASH_CODE.MAIN_HASH;
    this.SubActions = HASH_CODE.SUB_ACTION;

    this.views = {
      indexView: new IndexView(),
      rightsHolderView: null,
      recoupmentView: null,
      contractDspView: null,
      catalogDigitalView: null,
      catalogPhysicalView: null,
      sharedAssetView: null,
      sharedRecordView: null,
      salesFileView: null,
      salesCalcView: null,
      salesDetailView: null,
      salesMatchView: null,
      salesReportView: null
    };
    
    this.views.indexView.renderCallBack = () => {
      this.views.indexView.getCommEnums(()=>{
        this.views.indexView.getPrincipal(() => {
          this.setRoute();
        });
      })
    };
    this.views.indexView.renderView();
    window.addEventListener('popstate', () => {
      this.setRoute();
    });

    window.addEventListener('hashchange', (evt) => {
      this.saveUrlParam(evt);
    });

  }

  saveUrlParam(evt) {
    const currentPageHash = this.getCurrentHash();
    const oldPageHash = this.getCurrentHash(evt.oldURL.replace(location.origin + location.pathname, ''));
    if (currentPageHash === oldPageHash) {
      const paramString = evt.oldURL.split('?');
      if (paramString.length > 1) {
        localStorage.setItem(oldPageHash, paramString[paramString.length - 1]);
      }
    } else {
      localStorage.removeItem(oldPageHash);
    }
  }

  getCurrentHash(urlString) {
    return urlString ? urlString.split('/')[0] : location.hash.split('/')[0];
  }

  getSubAction() {
    return location.hash.split('/')[1] || null;
  }

  getParameterPath() {
    const uriList = location.hash.split('/');
    return uriList[uriList.length - 1];
  }

  getSaleIDParam() {
    const uriList = location.hash.split('/');
    return uriList[uriList.length - 2];
  }

  setRoute() {
    switch(this.getCurrentHash()){
      case this.HashCodes.INDEX:
      case this.HashCodes.INDEX_HASH:
        break;
      
      case this.HashCodes.RIGHTS_HOLDER://권리자 관리
        if(!this.rightsHolderView ){
          this.rightsHolderView  = new RightsHolderView();
        }
        this.rightsHolderView.renderView(this.getSubAction(), this.getParameterPath(), API_PATH.PAGINATION.SERVER_SIDE);
        break;

      case this.HashCodes.CONTRACT_RECOUPMENT://계약 관리 - 선급계약
        if(!this.recoupmentView){
          this.recoupmentView = new RecoupmentView();
        }
        this.recoupmentView.renderView(this.getSubAction(), this.getParameterPath(), API_PATH.PAGINATION.SERVER_SIDE);
        break
      
      case this.HashCodes.CONTRACT_DSP://계약 관리 - DSP계약
        if(!this.contractDspView){
          this.contractDspView = new ContractDspView();
        }
        this.contractDspView.renderView(this.getSubAction(), this.getParameterPath(), API_PATH.PAGINATION.SERVER_SIDE);
        break;

      case this.HashCodes.CATALOG_DIGITAL:// 카탈로그 DIGITAL
        if(!this.catalogDigitalView){
          this.catalogDigitalView = new CatalogDigitalView();
        }
        this.catalogDigitalView.renderView(this.getSubAction(), this.getParameterPath(), API_PATH.PAGINATION.SERVER_SIDE);
        break;

      case this.HashCodes.CATALOG_PHYSICAL: // 카탈로그 PHYSICAL
        if(!this.catalogPhysicalView){
          this.catalogPhysicalView = new CatalogPhysicalView();
        }
        this.catalogPhysicalView.renderView(this.getSubAction(), this.getParameterPath(), API_PATH.PAGINATION.SERVER_SIDE);
        break;

      case this.HashCodes.SHARED_ASSET: // 앨범 수익분배 관리
        if(!this.sharedAssetView){
          this.sharedAssetView = new SharedAssetView();
        }
        this.sharedAssetView.renderView(this.getSubAction(), this.getParameterPath(), API_PATH.PAGINATION.SERVER_SIDE);
        break;

      case this.HashCodes.SHARED_RECORD: // 음반 수익분배 관리
        if(!this.sharedRecordView){
          this.sharedRecordView = new SharedRecordView();
        }
        this.sharedRecordView.renderView(this.getSubAction(), this.getParameterPath(), API_PATH.PAGINATION.SERVER_SIDE);
        break;

      case this.HashCodes.SALES_FILE:// 정산자료 등록
        if(!this.salesFileView){
          this.salesFileView =new SalesFileView();
        }
        this.salesFileView.renderView(this.getSubAction(), this.getSaleIDParam(), API_PATH.PAGINATION.CLIENT_SIDE);
      break;

      case this.HashCodes.SALES_CALC:// 분배 처리
      if(!this.salesCalcView){
        this.salesCalcView = new SalesCalcView();
      }
      this.salesCalcView.renderView(this.getSubAction(), this.getParameterPath(), API_PATH.PAGINATION.CLIENT_SIDE);
      break;

      case this.HashCodes.SALES_MATCH: // 이월/마감/조정 처리
        if(!this.salesMatchView) {
          this.salesMatchView = new SalesMatchView();
        }
        this.salesMatchView.renderView(this.getSubAction(), this.getParameterPath(), API_PATH.PAGINATION.SERVER_SIDE);
        break;

      case this.HashCodes.SALES_DETAIL:// 분배내역
        if(!this.salesDetailView){
          this.salesDetailView = new SalesDetailView();
        }
        this.salesDetailView.renderView(this.getSubAction(), this.getParameterPath(), API_PATH.PAGINATION.CLIENT_SIDE);
      break;

      case this.HashCodes.SALES_REPORT: // 정산 레포트
        if(!this.salesReportView) {
          this.salesReportView = new SalesReportView();
        }
        this.salesReportView.renderView(this.getSubAction(), this.getParameterPath(), API_PATH.PAGINATION.SERVER_SIDE);
        break;

      case this.HashCodes.NOTICE: // 공지사항
        if(!this.noticeView){
          this.noticeView = new NoticeView();
        }
        this.noticeView.renderView(this.getSubAction(), this.getParameterPath(), API_PATH.PAGINATION.SERVER_SIDE);
        break;

      case this.HashCodes.LOGIN:
        break;
        
      case this.HashCodes.LOGOUT:
        this.views.indexView.logout();
        break;

      case this.HashCodes.USERINFO:
        this.views.indexView.setUserInfo();
        break;

      default:
        break;
    }

    setTimeout(() => {
      if (!this.getSubAction() || (this.getSubAction().indexOf('list') > -1 )){
        $.app.menu.expand();
      } else {
        $.app.menu.collapse();
      }
    }, 1000);
  }
}