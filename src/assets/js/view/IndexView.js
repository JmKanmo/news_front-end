import MainView from './MainView.js';
import { TEMPLATE_LAYOUT } from "../constant/TemplateEnums.js";
import IndexController from "../controller/util/IndexController.js";
import IndexVModel from "../model/view/common/IndexVModel.js";

 /**
  * Index화면을 구현하기 위한 View 
  * Header, Side Menu, Footer , Content-Page를 구현한다.
  * @module IndexView
  * @extends MainView
  * @requires ./MainView.js
  * @requires ../constant/TemplateEnums.js
  * @requires ../controller/IndexController.js
 */
export default class IndexView extends MainView{
  constructor(){
    super();
  }

  init(){
    this.templateCount = 0;
    this.totalTemplate = 4;
    this.templateFileInfo = TEMPLATE_LAYOUT;
    this.controller = new IndexController();
    this.vModel = new IndexVModel();
    this.currentUserPricipal = null;
  }
  
  renderView(){
    const navElement = document.getElementsByTagName('nav')[0];
    this.domManager.loadTemplate(navElement, this.templateFileInfo.NAV, ()=>{
      this.completeRender();
    });

    const menuElement = document.querySelector('div#mainMenu');
    this.domManager.loadTemplate(menuElement, this.templateFileInfo.MENU, ()=>{
      this.completeRender();
    });
    
    const footerElement = document.getElementsByTagName('footer')[0];
    this.domManager.loadTemplate(footerElement, this.templateFileInfo.FOOTER, ()=>{
      this.completeRender();
    });

    const contentElement = document.querySelector('div#appContent');
    this.domManager.loadTemplate(contentElement, this.templateFileInfo.CONTENT, ()=>{
      this.completeRender();
    });
  }

  getCommEnums(callback){
    this.controller.getCommEnums((responseEnum) => {
      if(responseEnum && responseEnum.status){
        // 상태 값에 따라, 팝업창을 보여준다.
        switch (responseEnum.status) {
          case this.HTTP_CODE_401_UNAUTHIRIZED:
          case this.HTTP_CODE_403_FORBIDDEN:
            this.loginPopup();
            break;
        }

        const responseData = responseEnum.data;
        const enumData = responseData.body;

        if(enumData == null || !enumData) {
          return;
        }

        Object.keys(enumData).forEach((keyName) => {
          CommEnum[keyName] = enumData[keyName];
        });
        
        if(callback){
          callback();
        }

        this.setTopBrandSelect(CommEnum['brandCode']);
      }else{
        this.alert('연결실패', 'Enum 데이터 로드에 실패했습니다<br>다시 시도해 주세요', 'error');
      }
    });
  }

  completeRender(){
    this.templateCount++;
    if(this.templateCount === this.totalTemplate){
      /** 모든 템플릿이 로드되었음 */
       this.initMenu(window,document,$);
       this.initApp(window,document,$);
      if(this.renderCallBack)this.renderCallBack();
    }
  }

  setUserPricipal(principal, userData) {
    const keyList = Object.keys(principal);
    keyList.forEach(keyName=>{
      if(userData[keyName]){
        principal[keyName] = userData[keyName];
      }
    });

    // if(principal['isSuper'] ){
    //   //brandCode.code가 'SU'일 경움 무조건 PO(포크라노스)로 세팅
    //   principal['brandCode'] = CommEnum?.brandCode.filter(brand=>brand.code === 'PO')[0];
    // }    
  }

  checkSuperUser(principalData){
    const currentMyBrand = document.body.querySelector(`span#currentMyBrand`);
    const brandSelect = currentMyBrand.querySelector('select');
    
    if(principalData.isSuper){
      if(localStorage){
        const storageData = JSON.parse(localStorage.getItem(btoa(principalData.adminAccountId)));

        if(storageData){
          principalData.brandCode = storageData;
          brandSelect.value = principalData.brandCode.enumName;
        }else{
          // principalData.brandCode = CommEnum.brandCode.filter(brand=>brand.code === 'PO')[0];
          localStorage.setItem(btoa(principalData.adminAccountId) ,JSON.stringify(principalData.brandCode));
        }

        brandSelect.addEventListener('change',(changeEvent)=>{
          try{
            const enumBrandCode = CommEnum.brandCode.filter(brand=> brand.enumName=== `${changeEvent.target.value}`);
            if(enumBrandCode?.length){
              localStorage.setItem(btoa(principalData.adminAccountId) ,JSON.stringify(enumBrandCode[0]));
            }

            location.href = `${location.origin}/${location.hash.split('/')[0]}/list`;
            location.reload();
            /**
             * 현재 페이지를 유지하는 방법으로는 reload가 맞겠지만
             * 상세화면이 브랜드에 따라 문맥이 맞지 않는 문제가 있어 
             * 리스트로 보냄
             */
          }catch(excp){ 
            console.error(excp);
          }
        });
      }
    }else{
      brandSelect.disabled = true;
    }

    Object.freeze(principalData);
  }

  setTopBrandSelect(brandDataList){
    if(brandDataList?.length){
      const inputSelectBrand = document.body.querySelector('span#currentMyBrand select#brandSelect');
      let inputOptionBrand = '';
      brandDataList.forEach(brandData=>{
        if(brandData){
          let brandName = (brandData?.enumName)? brandData.enumName : '';
          const brandEnumName = (brandData?.enumName)? brandData.enumName : '';
          if(brandEnumName === 'SuperUser'){
            brandName = '전체';
          }
          inputOptionBrand += `<option value="${brandEnumName}">${brandName}</option>`;
        }
      });
      inputSelectBrand.innerHTML = inputOptionBrand;
    }
  }

  setDisplayUser(principalData){
    const currentMyBrand = document.body.querySelector(`span#currentMyBrand`);
    const brandSelect = currentMyBrand.querySelector('select#brandSelect');
    let brandEnumName = principalData.brandCode.enumName;
    brandSelect.value = brandEnumName;
    currentMyBrand.style.opacity = 1;
    document.body.querySelector('span#principalName').innerHTML = (principalData.isSuper)? `${principalData.adminName}${'[SuperAdmin]'}` : principalData.adminName ;

    let brandImage = new Image();

    const imgPath = `./src/assets/img/logo/brands`;
    const brandImgPath = `${imgPath}/${brandEnumName}.png`;
    brandImage.onload = (onLoadEvt)=>{
      document.body.querySelector('span.avatar img').src = brandImgPath;
    }

    brandImage.onerror = (onErrEve)=>{
      const notFoundBrandImgPath = `${imgPath}/brand404.jpg`;
      document.body.querySelector('span.avatar img').src = notFoundBrandImgPath;
      console.error("onLoadEvt : ",onErrEve);
    }
    brandImage.src =  brandImgPath;
  }
  
  getPrincipal(successCallBack){
    this.controller.reqGetPrincipal((response)=>{
        switch(response.status){
          case this.HTTP_CODE_200_OK:
            if(response?.data && response.data?.body){
              const userData =  response.data.body;
              // userPrinciapl는 appConstant에 선언되어 있음
              this.setUserPricipal(userPrinciapl, userData);
              this.checkSuperUser(userPrinciapl);
              this.setDisplayUser(userPrinciapl);
            }
          if(successCallBack){
            successCallBack();
          }
          break;

          case this.HTTP_CODE_401_UNAUTHIRIZED:
          case this.HTTP_CODE_403_FORBIDDEN:
            this.loginPopup();
            break;

          default:
          break;
        }
    })
  }

  initMenu(window, document, $){
    
    $.app = $.app || {};

    var $body       = $('body');
    var $window     = $( window );
    var menuWrapper_el = $('div[data-menu="menu-wrapper"]').html();
    var menuWrapperClasses = $('div[data-menu="menu-wrapper"]').attr('class');

    $.app.menu = {
      expanded: null,
      collapsed: null,
      hidden : null,
      container: null,
      horizontalMenu: false,
  
      manualScroller: {
        obj: null,
  
        init: function() {
          this.obj = new PerfectScrollbar(".main-menu-content", {
            suppressScrollX: true,
            wheelPropagation: false,
          });
        },
  
        update: function() {
          if (this.obj) {
            // Scroll to currently active menu on page load if data-scroll-to-active is true
            if($('.main-menu').data('scroll-to-active') === true){
                var position;
                if( $(".main-menu-content").find('li.active').parents('li').length > 0 ){
                  position = $(".main-menu-content").find('li.active').parents('li').last().position();
                }
                else{
                  position = $(".main-menu-content").find('li.active').position();
                }
                setTimeout(function(){
                  if(position !== undefined){
                    $.app.menu.container.stop().animate({scrollTop:position.top}, 300);
                  }
                  $('.main-menu').data('scroll-to-active', 'false');
                },300);
            }
            this.obj.update();
  
          }
        },
  
        enable: function() {
          if(!$('.main-menu-content').hasClass('ps')){
            this.init();
          }
        },
  
        disable: function() {
          if (this.obj) {
            this.obj.destroy();
          }
        },
  
        updateHeight: function(){
          if( ($body.data('menu') == 'vertical-menu' || $body.data('menu') == 'vertical-menu-modern' || $body.data('menu') == 'vertical-overlay-menu' ) && $('.main-menu').hasClass('menu-fixed')){
            $('.main-menu-content').css('height', $(window).height() - $('.header-navbar').height() - $('.main-menu-header').outerHeight() - $('.main-menu-footer').outerHeight() );
            this.update();
          }
        }
      },
  
      init: function(compactMenu) {
        if($('.main-menu-content').length > 0){
          this.container = $('.main-menu-content');
  
          var menuObj = this;
          var defMenu = '';
  
          if(compactMenu === true){
            defMenu = 'collapsed';
          }
  
          if($body.data('menu') == 'vertical-menu-modern') {
            var menuToggle = '';
  
            if (typeof(Storage) !== "undefined") {
              menuToggle = localStorage.getItem("menuLocked");
            }
            if(menuToggle === "false"){
              this.change('collapsed');
            }
            else{
              this.change();
            }
          }
          else{
            this.change(defMenu);
          }
        }
        else{
          // For 1 column layout menu won't be initialized so initiate drill down for mega menu
  
          // Drill down menu
          // ------------------------------
          this.drillDownMenu();
        }
  
      },
  
      drillDownMenu: function(screenSize){
        if($('.drilldown-menu').length){
          if(screenSize == 'sm' || screenSize == 'xs'){
            if($('#navbar-mobile').attr('aria-expanded') == 'true'){
  
              $('.drilldown-menu').slidingMenu({
                backLabel:true
              });
            }
          }
          else{
            $('.drilldown-menu').slidingMenu({
              backLabel:true
            });
          }
        }
      },
  
      change: function(defMenu) {
        var currentBreakpoint = Unison.fetch.now(); // Current Breakpoint
  
        this.reset();
  
        var menuType = $body.data('menu');
  
        if (currentBreakpoint) {
          switch (currentBreakpoint.name) {
            case 'xl':
            case 'lg':
              if(menuType === 'vertical-overlay-menu'){
                this.hide();
              }
              else if(menuType === 'vertical-compact-menu'){
                this.open();
              }
              else if(menuType === 'horizontal-menu' && currentBreakpoint.name == 'lg'){
                this.collapse();
              }
              else{
                if(defMenu === 'collapsed')
                  this.collapse(defMenu);
                else
                  this.expand();
              }
              break;
            case 'md':
              if(menuType === 'vertical-overlay-menu' || menuType === 'vertical-menu-modern'){
                this.hide();
              }
              else if(menuType === 'vertical-compact-menu'){
                this.open();
              }
              else{
                this.collapse();
              }
              break;
            case 'sm':
              this.hide();
              break;
            case 'xs':
              this.hide();
              break;
          }
        }
  
        // On the small and extra small screen make them overlay menu
        if(menuType === 'vertical-menu' || menuType === 'vertical-compact-menu' || menuType === 'vertical-content-menu' || menuType === 'vertical-menu-modern'){
          this.toOverlayMenu(currentBreakpoint.name, menuType);
        }
  
        if($body.is('.horizontal-layout') && !$body.hasClass('.horizontal-menu-demo')){
          this.changeMenu(currentBreakpoint.name);
          $('.menu-toggle').removeClass('is-active');
        }
  
        // Initialize drill down menu for vertical layouts, for horizontal layouts drilldown menu is intitialized in changemenu function
        if(menuType != 'horizontal-menu'){
          // Drill down menu
          // ------------------------------
          this.drillDownMenu(currentBreakpoint.name);
        }
  
        // Dropdown submenu on large screen on hover For Large screen only
        // ---------------------------------------------------------------
        if(currentBreakpoint.name == 'xl'){
          $('body[data-open="hover"] .dropdown').off('mouseenter').on('mouseenter', function(e){
            if (!($(this).hasClass('show'))) {
              $(this).addClass('show');
            }else{
              $(this).removeClass('show');
            }
          }).off('mouseleave').on('mouseleave', function(event){
            $(this).removeClass('show');
          });
  
          $('body[data-open="hover"] .dropdown a').off('click').on('click', function(e){
            if(menuType == 'horizontal-menu'){
              var $this = $(this);
              if($this.hasClass('dropdown-toggle')){
                return false;
              }
            }
          });
        }
  
        // Added data attribute brand-center for navbar-brand-center
        // TODO:AJ: Shift this feature in PUG.
        if($('.header-navbar').hasClass('navbar-brand-center')){
          $('.header-navbar').attr('data-nav','brand-center');
        }
        if(currentBreakpoint.name == 'sm' || currentBreakpoint.name == 'xs'){
          $('.header-navbar[data-nav=brand-center]').removeClass('navbar-brand-center');
        }else{
          $('.header-navbar[data-nav=brand-center]').addClass('navbar-brand-center');
        }
  
        // Dropdown submenu on small screen on click
        // --------------------------------------------------
        $('ul.dropdown-menu [data-toggle=dropdown]').on('click', function(event) {
          if($(this).siblings('ul.dropdown-menu').length > 0){
            event.preventDefault();
          }
          event.stopPropagation();
          $(this).parent().siblings().removeClass('show');
          $(this).parent().toggleClass('show');
        });
  
        // Horizontal Fixed Nav Sticky hight issue on small screens
        if(menuType == 'horizontal-menu'){
          if(currentBreakpoint.name == 'sm' || currentBreakpoint.name == 'xs'){
            if($(".menu-fixed").length){
              $(".menu-fixed").unstick();
            }
          }
          else{
            if($(".navbar-fixed").length){
              $(".navbar-fixed").sticky();
            }
          }
        }
      },
  
      transit: function(callback1, callback2) {
        var menuObj = this;
        $body.addClass('changing-menu');
  
        callback1.call(menuObj);
  
        if($body.hasClass('vertical-layout')){
          if($body.hasClass('menu-open') || $body.hasClass('menu-expanded')){
            $('.menu-toggle').addClass('is-active');
  
            // Show menu header search when menu is normally visible
            if( $body.data('menu') === 'vertical-menu' || $body.data('menu') === 'vertical-content-menu'){
              if($('.main-menu-header')){
                $('.main-menu-header').show();
              }
            }
          }
          else{
            $('.menu-toggle').removeClass('is-active');
  
            // Hide menu header search when only menu icons are visible
            if( $body.data('menu') === 'vertical-menu' || $body.data('menu') === 'vertical-content-menu'){
              if($('.main-menu-header')){
                $('.main-menu-header').hide();
              }
            }
          }
        }
  
        setTimeout(function() {
          callback2.call(menuObj);
          $body.removeClass('changing-menu');
  
          menuObj.update();
        }, 500);
      },
  
      open: function() {
        this.transit(function() {
          $body.removeClass('menu-hide menu-collapsed').addClass('menu-open');
          this.hidden = false;
          this.expanded = true;
  
          if($body.hasClass('vertical-overlay-menu')){
            $('.sidenav-overlay').removeClass('d-none').addClass('d-block');
            $body.css('overflow', 'hidden');
          }
        }, function() {
          if(!$('.main-menu').hasClass('menu-native-scroll') && $('.main-menu').hasClass('menu-fixed') ){
              this.manualScroller.enable();
              $('.main-menu-content').css('height', $(window).height() - $('.header-navbar').height() - $('.main-menu-header').outerHeight() - $('.main-menu-footer').outerHeight() );
            // this.manualScroller.update();
          }
  
          if($body.data('menu') == 'vertical-compact-menu' && !$body.hasClass('vertical-overlay-menu')){
            $('.sidenav-overlay').removeClass('d-block d-none');
            $('body').css('overflow', 'auto');
          }
        });
      },
  
      hide: function() {
  
        this.transit(function() {
          $body.removeClass('menu-open menu-expanded').addClass('menu-hide');
          this.hidden = true;
          this.expanded = false;
  
          if($body.hasClass('vertical-overlay-menu')){
            $('.sidenav-overlay').removeClass('d-block').addClass('d-none');
            $('body').css('overflow', 'auto');
          }
        }, function() {
          if(!$('.main-menu').hasClass('menu-native-scroll') && $('.main-menu').hasClass('menu-fixed')){
            this.manualScroller.enable();
          }
  
          if($body.data('menu') == 'vertical-compact-menu' && !$body.hasClass('vertical-overlay-menu')){
            $('.sidenav-overlay').removeClass('d-block d-none');
            $('body').css('overflow', 'auto');
          }
        });
      },
  
      expand: function() {
        if (this.expanded === false) {
          if( $body.data('menu') == 'vertical-menu-modern' ){
            $('.modern-nav-toggle').find('.toggle-icon')
            .removeClass('ft-toggle-left').addClass('ft-toggle-right');
  
            // Code for localStorage
            if (typeof(Storage) !== "undefined") {
              localStorage.setItem("menuLocked", "true");
            }
          }
          this.transit(function() {
            $body.removeClass('menu-collapsed').addClass('menu-expanded');
            this.collapsed = false;
            this.expanded = true;
  
            $('.sidenav-overlay').removeClass('d-block d-none');
          }, function() {
  
            if( ($('.main-menu').hasClass('menu-native-scroll') || $body.data('menu') == 'horizontal-menu')){
              this.manualScroller.disable();
            }
            else{
              if($('.main-menu').hasClass('menu-fixed'))
                this.manualScroller.enable();
            }
  
            if( ($body.data('menu') == 'vertical-menu' || $body.data('menu') == 'vertical-menu-modern') && $('.main-menu').hasClass('menu-fixed')){
              $('.main-menu-content').css('height', $(window).height() - $('.header-navbar').height() - $('.main-menu-header').outerHeight() - $('.main-menu-footer').outerHeight() );
            }
  
          });
        }
      },
  
      collapse: function(defMenu) {
        if (this.collapsed === false) {
          if( $body.data('menu') == 'vertical-menu-modern' ){
            $('.modern-nav-toggle').find('.toggle-icon')
            .removeClass('ft-toggle-right').addClass('ft-toggle-left');
  
            // Code for localStorage
            if (typeof(Storage) !== "undefined") {
              localStorage.setItem("menuLocked", "false");
            }
          }
          this.transit(function() {
            $body.removeClass('menu-expanded').addClass('menu-collapsed');
            this.collapsed = true;
            this.expanded  = false;
  
            $('.content-overlay').removeClass('d-block d-none');
          }, function() {
  
            if($body.data('menu') == 'vertical-content-menu'){
              this.manualScroller.disable();
            }
  
            if( ($body.data('menu') == 'horizontal-menu') &&  $body.hasClass('vertical-overlay-menu')){
              if($('.main-menu').hasClass('menu-fixed'))
                this.manualScroller.enable();
            }
            if( ($body.data('menu') == 'vertical-menu' || $body.data('menu') == 'vertical-menu-modern') && $('.main-menu').hasClass('menu-fixed') ){
              $('.main-menu-content').css('height', $(window).height() - $('.header-navbar').height());
              // this.manualScroller.update();
            }
            if( $body.data('menu') == 'vertical-menu-modern'){
              if($('.main-menu').hasClass('menu-fixed'))
                this.manualScroller.enable();
            }
          });
        }
      },
  
      toOverlayMenu: function(screen, menuType){
        var menu = $body.data('menu');
        if(menuType == 'vertical-menu-modern'){
          if(screen == 'md' || screen == 'sm' || screen == 'xs'){
            if($body.hasClass(menu)){
              $body.removeClass(menu).addClass('vertical-overlay-menu');
            }
          }
          else{
            if($body.hasClass('vertical-overlay-menu')){
              $body.removeClass('vertical-overlay-menu').addClass(menu);
            }
          }
        }
        else{
          if(screen == 'sm' || screen == 'xs'){
            if($body.hasClass(menu)){
              $body.removeClass(menu).addClass('vertical-overlay-menu');
            }
            if(menu == 'vertical-content-menu'){
              $('.main-menu').addClass('menu-fixed');
            }
          }
          else{
            if($body.hasClass('vertical-overlay-menu')){
              $body.removeClass('vertical-overlay-menu').addClass(menu);
            }
            if(menu == 'vertical-content-menu'){
              $('.main-menu').removeClass('menu-fixed');
            }
          }
        }
      },
  
      changeMenu: function(screen){
        // Replace menu html
        $('div[data-menu="menu-wrapper"]').html('');
        $('div[data-menu="menu-wrapper"]').html(menuWrapper_el);
  
        var menuWrapper    = $('div[data-menu="menu-wrapper"]'),
        menuContainer      = $('div[data-menu="menu-container"]'),
        menuNavigation     = $('ul[data-menu="menu-navigation"]'),
        megaMenu           = $('li[data-menu="megamenu"]'),
        megaMenuCol        = $('li[data-mega-col]'),
        dropdownMenu       = $('li[data-menu="dropdown"]'),
        dropdownSubMenu    = $('li[data-menu="dropdown-submenu"]');
  
        if(screen == 'sm' || screen == 'xs'){
  
          // Change body classes
          $body.removeClass($body.data('menu')).addClass('vertical-layout vertical-overlay-menu fixed-navbar');
  
          // Add navbar-fix-top class on small screens
          $('nav.header-navbar').addClass('fixed-top');
  
          // Change menu wrapper, menu container, menu navigation classes
          menuWrapper.removeClass().addClass('main-menu menu-light menu-fixed menu-shadow');
          // menuContainer.removeClass().addClass('main-menu-content');
          menuNavigation.removeClass().addClass('navigation navigation-main');
  
          // If Mega Menu
          megaMenu.removeClass('dropdown mega-dropdown').addClass('has-sub');
          megaMenu.children('ul').removeClass();
          megaMenuCol.each(function(index, el) {
  
            // Remove drilldown-menu and menu list
            var megaMenuSub = $(el).find('.mega-menu-sub');
            megaMenuSub.find('li').has('ul').addClass('has-sub');
  
            // if mega menu title is given, remove title and make it list item with mega menu title's text
            var first_child = $(el).children().first(),
            first_child_text = '';
  
            if( first_child.is('h6') ){
              first_child_text = first_child.html();
              first_child.remove();
              $(el).prepend('<a href="#">'+first_child_text+'</a>').addClass('has-sub mega-menu-title');
            }
          });
          megaMenu.find('a').removeClass('dropdown-toggle');
          megaMenu.find('a').removeClass('dropdown-item');
  
          // If Dropdown Menu
          dropdownMenu.removeClass('dropdown').addClass('has-sub');
          dropdownMenu.find('a').removeClass('dropdown-toggle nav-link');
          dropdownMenu.children('ul').find('a').removeClass('dropdown-item');
          dropdownMenu.find('ul').removeClass('dropdown-menu');
          dropdownSubMenu.removeClass().addClass('has-sub');
  
          $.app.nav.init();
  
          // Dropdown submenu on small screen on click
          // --------------------------------------------------
          $('ul.dropdown-menu [data-toggle=dropdown]').on('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            $(this).parent().siblings().removeClass('open');
            $(this).parent().toggleClass('open');
          });
        }
        else{
          // Change body classes
          $body.removeClass('vertical-layout vertical-overlay-menu fixed-navbar').addClass($body.data('menu'));
  
          // Remove navbar-fix-top class on large screens
          $('nav.header-navbar').removeClass('fixed-top');
  
          // Change menu wrapper, menu container, menu navigation classes
          menuWrapper.removeClass().addClass(menuWrapperClasses);
  
          // Intitialize drill down menu for horizontal layouts
          // --------------------------------------------------
          this.drillDownMenu(screen);
  
          $('a.dropdown-item.nav-has-children').on('click',function(){
            event.preventDefault();
            event.stopPropagation();
          });
          $('a.dropdown-item.nav-has-parent').on('click',function(){
            event.preventDefault();
            event.stopPropagation();
          });
        }
      },
  
      toggle: function() {
        var currentBreakpoint = Unison.fetch.now(); // Current Breakpoint
        var collapsed = this.collapsed;
        var expanded = this.expanded;
        var hidden = this.hidden;
        var menu = $body.data('menu');
  
        switch (currentBreakpoint.name) {
          case 'xl':
          case 'lg':
            if(expanded === true){
              if(menu == 'vertical-compact-menu' || menu == 'vertical-overlay-menu'){
                this.hide();
              }
              else{
                this.collapse();
              }
            }
            else{
              if(menu == 'vertical-compact-menu' || menu == 'vertical-overlay-menu'){
                this.open();
              }
              else{
                this.expand();
              }
            }
            break;
          case 'md':
            if(expanded === true){
              if(menu == 'vertical-compact-menu' || menu == 'vertical-overlay-menu' || menu == 'vertical-menu-modern' ){
                this.hide();
              }
              else{
                this.collapse();
              }
            }
            else{
              if(menu == 'vertical-compact-menu' || menu == 'vertical-overlay-menu' || menu == 'vertical-menu-modern' ){
                this.open();
              }
              else{
                this.expand();
              }
            }
            break;
          case 'sm':
            if (hidden === true) {
              this.open();
            } else {
              this.hide();
            }
            break;
          case 'xs':
            if (hidden === true) {
              this.open();
            } else {
              this.hide();
            }
            break;
        }
  
        // Re-init sliding menu to update width
        this.drillDownMenu(currentBreakpoint.name);
      },
  
      update: function() {
        this.manualScroller.update();
      },
  
      reset: function() {
        this.expanded  = false;
        this.collapsed = false;
        this.hidden    = false;
        $body.removeClass('menu-hide menu-open menu-collapsed menu-expanded');
      },
    };
  
    $.app.nav = {
      container: $('.navigation-main'),
      initialized : false,
      navItem: $('.navigation-main').find('li').not('.navigation-category'),
    
      config: {
        speed: 300,
      },
    
      init: function(config) {
        this.initialized = true; // Set to true when initialized
        $.extend(this.config, config);
    
        this.bind_events();
      },
    
      // Detect IE 
      detectIE: function ( $menuItem ) {
        var ua = window.navigator.userAgent;
    
        // Test values; Uncomment to check result …
    
        // IE 10
        // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';
        
        // IE 11
        // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';
        
        // Edge 12 (Spartan)
        // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';
        
        // Edge 13
        // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';
    
        var msie = ua.indexOf('MSIE ');
        if (msie > 0) {
          // IE 10 or older => return version number
          return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
        }
    
        var trident = ua.indexOf('Trident/');
        if (trident > 0) {
          // IE 11 => return version number
          var rv = ua.indexOf('rv:');
          return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
        }
    
        var edge = ua.indexOf('Edge/');
        if (edge > 0) {
          // Edge (IE 12+) => return version number
          return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
        }
    
        // other browser
        return false;
      },
    
      bind_events: function() {
        var menuObj = this;
    
        $('.navigation-main').on('mouseenter.app.menu', 'li', function() {
          var $this = $(this);
          $('.hover', '.navigation-main').removeClass('hover');
          if( ($body.hasClass('menu-collapsed') && $body.data('menu') != 'vertical-menu-modern') || ($body.data('menu') == 'vertical-compact-menu' && !$body.hasClass('vertical-overlay-menu')) ){
            $('.main-menu-content').children('span.menu-title').remove();
            $('.main-menu-content').children('a.menu-title').remove();
            $('.main-menu-content').children('ul.menu-content').remove();
    
            // Title
            var menuTitle = $this.find('span.menu-title').clone(),
            tempTitle,
            tempLink;
            if(!$this.hasClass('has-sub') ){
              tempTitle = $this.find('span.menu-title').text();
              tempLink = $this.children('a').attr('href');
              if(tempTitle !== ''){
                menuTitle = $("<a>");
                menuTitle.attr("href", tempLink);
                menuTitle.attr("title", tempTitle);
                menuTitle.text(tempTitle);
                menuTitle.addClass("menu-title");
              }
            }
    
            var fromTop;
            if($this.css( "border-top" )){
              fromTop = $this.position().top + parseInt($this.css( "border-top" ), 10);
            }
            else{
              fromTop = $this.position().top;
            }
    
            if($body.hasClass('material-vertical-layout')){
              fromTop = $('.user-profile').height() + $this.position().top;
            }
    
            // Get IE or Edge browser version
            var version = menuObj.detectIE();
    
            if (version !== false) {
              if($body.hasClass('material-vertical-layout')){
                fromTop = $('.user-profile').height() + $this.position().top + $('.header-navbar').height();
              }
            }
    
            if($body.data('menu') !== 'vertical-compact-menu'){
              menuTitle.appendTo('.main-menu-content').css({
                position:'fixed',
                top : fromTop,
              });
            }
    
            // Content
            if($this.hasClass('has-sub') && $this.hasClass('nav-item')) {
              var menuContent = $this.children('ul:first');
              if($body.data('menu') !== 'vertical-compact-menu'){
                menuObj.adjustSubmenu($this);
              }
              else{
                menuObj.fullSubmenu($this); 
              }
            }
          }
          $this.addClass('hover');
        }).on('mouseleave.app.menu', 'li', function() {
          // $(this).removeClass('hover');
        }).on('active.app.menu', 'li', function(e) {
          $(this).addClass('active');
          e.stopPropagation();
        }).on('deactive.app.menu', 'li.active', function(e) {
          $(this).removeClass('active');
          e.stopPropagation();
        }).on('open.app.menu', 'li', function(e) {
    
          var $listItem = $(this);
          $listItem.addClass('open');
    
          menuObj.expand($listItem);
    
          // If menu collapsible then do not take any action
          if ($('.main-menu').hasClass('menu-collapsible')) {
            return false;
          }
          // If menu accordion then close all except clicked once
          else{
            $listItem.siblings('.open').find('li.open').trigger('close.app.menu');
            $listItem.siblings('.open').trigger('close.app.menu');
          }
    
          e.stopPropagation();
        }).on('close.app.menu', 'li.open', function(e) {
          var $listItem = $(this);
    
          $listItem.removeClass('open');
          menuObj.collapse($listItem);
    
          e.stopPropagation();
        }).on('click.app.menu', 'li', function(e) {
          var $listItem = $(this);
          if($listItem.is('.disabled')){
            e.preventDefault();
          }
          else{
            if( ($body.hasClass('menu-collapsed') && $body.data('menu') != 'vertical-menu-modern')  || ($body.data('menu') == 'vertical-compact-menu' && $listItem.is('.has-sub') && !$body.hasClass('vertical-overlay-menu'))){
              e.preventDefault();
            }
            else{
              if ($listItem.has('ul')) {
                if ($listItem.is('.open')) {
                  $listItem.trigger('close.app.menu');
                } else {
                  $listItem.trigger('open.app.menu');
                }
              } else {
                if (!$listItem.is('.active')) {
                  $listItem.siblings('.active').trigger('deactive.app.menu');
                  $listItem.trigger('active.app.menu');
                }
              }
            }
          }
    
          e.stopPropagation();
        });
    
    
        $('.navbar-header, .main-menu').on('mouseenter',modernMenuExpand).on('mouseleave',modernMenuCollapse);
    
        function modernMenuExpand(){
          if( $body.data('menu') == 'vertical-menu-modern'){
            $('.main-menu, .navbar-header').addClass('expanded');
            if($body.hasClass('menu-collapsed')){
              var $listItem = $('.main-menu li.menu-collapsed-open'),
              $subList = $listItem.children('ul');
    
              $subList.hide().slideDown(200, function() {
                  $(this).css('display', '');
              });
    
              $listItem.addClass('open').removeClass('menu-collapsed-open');
            }
          }
        }
    
        function modernMenuCollapse(){
          if($body.hasClass('menu-collapsed') && $body.data('menu') == 'vertical-menu-modern'){
            setTimeout(function(){
              if($('.main-menu:hover').length === 0 && $('.navbar-header:hover').length === 0){
    
                $('.main-menu, .navbar-header').removeClass('expanded');
                // Hide dropdown of user profile section for material templates
                if($('.user-profile .user-info .dropdown').hasClass('show')){
                    $('.user-profile .user-info .dropdown').removeClass('show');
                    $('.user-profile .user-info .dropdown .dropdown-menu').removeClass('show');
                }
                if($body.hasClass('menu-collapsed')){
                  var $listItem = $('.main-menu li.open'),
                  $subList = $listItem.children('ul');
                  $listItem.addClass('menu-collapsed-open');
    
                  $subList.show().slideUp(200, function() {
                      $(this).css('display', '');
                  });
    
                  $listItem.removeClass('open');
                }
              }
            },1);
          }
        }
    
        $('.main-menu-content').on('mouseleave', function(){
          if( $body.hasClass('menu-collapsed') || $body.data('menu') == 'vertical-compact-menu' ){
            $('.main-menu-content').children('span.menu-title').remove();
            $('.main-menu-content').children('a.menu-title').remove();
            $('.main-menu-content').children('ul.menu-content').remove();
          }
          $('.hover', '.navigation-main').removeClass('hover');
        });
    
        // If list item has sub menu items then prevent redirection.
        $('.navigation-main li.has-sub > a').on('click',function(e){
          e.preventDefault();
        });
    
        $('ul.menu-content').on('click', 'li', function(e) {
          var $listItem = $(this);
          if($listItem.is('.disabled')){
            e.preventDefault();
          }
          else{
            if ($listItem.has('ul')) {
              if ($listItem.is('.open')) {
                $listItem.removeClass('open');
                menuObj.collapse($listItem);
              } else {
                $listItem.addClass('open');
    
                menuObj.expand($listItem);
    
                // If menu collapsible then do not take any action
                if ($('.main-menu').hasClass('menu-collapsible')) {
                  return false;
                }
                // If menu accordion then close all except clicked once
                else{
                  $listItem.siblings('.open').find('li.open').trigger('close.app.menu');
                  $listItem.siblings('.open').trigger('close.app.menu');
                }
    
                e.stopPropagation();
              }
            } else {
              if (!$listItem.is('.active')) {
                $listItem.siblings('.active').trigger('deactive.app.menu');
                $listItem.trigger('active.app.menu');
              }
            }
          }
    
          e.stopPropagation();
        });
      },
    
      /**
       * Ensure an admin submenu is within the visual viewport.
       * @param {jQuery} $menuItem The parent menu item containing the submenu.
       */
      adjustSubmenu: function ( $menuItem ) {
        var menuHeaderHeight, menutop, topPos, winHeight,
        bottomOffset, subMenuHeight, popOutMenuHeight, borderWidth, scroll_theme,
        $submenu = $menuItem.children('ul:first'),
        ul = $submenu.clone(true);
    
        menuHeaderHeight = $('.main-menu-header').height();
        menutop          = $menuItem.position().top;
        winHeight        = $window.height() - $('.header-navbar').height();
        borderWidth      = 0;
        subMenuHeight    = $submenu.height();
    
        if(parseInt($menuItem.css( "border-top" ),10) > 0){
          borderWidth = parseInt($menuItem.css( "border-top" ),10);
        }
    
        popOutMenuHeight = winHeight - menutop - $menuItem.height() - 30;
        scroll_theme     = ($('.main-menu').hasClass('menu-dark')) ? 'light' : 'dark';
    
        if($body.data('menu') === 'vertical-compact-menu'){
          topPos = menutop + borderWidth;
          popOutMenuHeight = winHeight - menutop - 30;
        }
        else if($body.data('menu') === 'vertical-content-menu'){
          topPos = menutop + $menuItem.height() + borderWidth - 5;
          popOutMenuHeight = winHeight - $('.content-header').height() -$menuItem.height() - menutop - 60;
          if($body.hasClass('material-vertical-layout')){
            topPos = menutop + $menuItem.height() + $('.user-profile').height() + borderWidth;
          }
        }
        else if($body.hasClass('material-vertical-layout')){
          topPos = menutop + $menuItem.height() + $('.user-profile').height() + borderWidth;
        }
        else{
          topPos = menutop + $menuItem.height() + borderWidth;
        }
    
        // Get IE or Edge browser version
        var version = this.detectIE();
    
        if (version !== false) {
          if($body.hasClass('material-vertical-layout')){
            topPos = menutop + $menuItem.height() + $('.user-profile').height() + borderWidth + $('.header-navbar').height();
          }
        }
        
        if($body.data('menu') == 'vertical-content-menu'){
          ul.addClass('menu-popout').appendTo('.main-menu-content').css({
            'top' : topPos,
            'position' : 'fixed',
          });
        }
        else{
          ul.addClass('menu-popout').appendTo('.main-menu-content').css({
            'top' : topPos,
            'position' : 'fixed',
            'max-height': popOutMenuHeight,
          });
                          
          var menu_content = new PerfectScrollbar('.main-menu-content > ul.menu-content');
        }
      },
    
      fullSubmenu: function ( $menuItem ) {
        var $submenu = $menuItem.children('ul:first'),
        ul = $submenu.clone(true);
    
        
          ul.addClass('menu-popout').appendTo('.main-menu-content').css({
            'top' : 0,
            'position' : 'fixed',
            'height': '100%',
          });
                          
          var menu_content = new PerfectScrollbar('.main-menu-content > ul.menu-content');
        
      },
    
      collapse: function($listItem, callback) {
        var $subList = $listItem.children('ul');
    
        $subList.show().slideUp($.app.nav.config.speed, function() {
          $(this).css('display', '');
    
          $(this).find('> li').removeClass('is-shown');
          $(this).find('> li').removeClass('active');
    
          if (callback) {
            callback();
          }
    
          $.app.nav.container.trigger('collapsed.app.menu');
        });
      },
    
      expand: function($listItem, callback) {
        var $subList  = $listItem.children('ul');
        var $children = $subList.children('li').addClass('is-hidden');
    
        $subList.hide().slideDown($.app.nav.config.speed, function() {
          $(this).css('display', '');
    
          if (callback) {
            callback();
          }
    
          $.app.nav.container.trigger('expanded.app.menu');
        });
    
        setTimeout(function() {
          $children.addClass('is-shown');
          $children.removeClass('is-hidden');
        }, 0);
      },
    
      refresh: function() {
        $.app.nav.container.find('.open').removeClass('open');
      },
    };
  }

  initApp(window, document, $){
    var $html = $('html');
    var $body = $('body');
    var rtl;
    var compactMenu = false; // Set it to true, if you want default menu to be compact

    if($('html').data('textdirection') == 'rtl'){
        rtl = true;
    }

    setTimeout(function(){
        $html.removeClass('loading').addClass('loaded');
    }, 1200);

    $.app.menu.init(compactMenu);

    // Navigation configurations
    var config = {
        speed: 300 // set speed to expand / collpase menu
    };
    if($.app.nav.initialized === false){
        $.app.nav.init(config);
    }

    Unison.on('change', function(bp) {
        $.app.menu.change();
    });

    // Tooltip Initialization
    $('[data-toggle="tooltip"]').tooltip({
        container:'body'
    });

    // Top Navbars - Hide on Scroll
    if ($(".navbar-hide-on-scroll").length > 0) {
        $(".navbar-hide-on-scroll.fixed-top").headroom({
          "offset": 205,
          "tolerance": 5,
          "classes": {
             // when element is initialised
            initial : "headroom",
            // when scrolling up
            pinned : "headroom--pinned-top",
            // when scrolling down
            unpinned : "headroom--unpinned-top",
          }
        });
        // Bottom Navbars - Hide on Scroll
        $(".navbar-hide-on-scroll.fixed-bottom").headroom({
          "offset": 205,
          "tolerance": 5,
          "classes": {
             // when element is initialised
            initial : "headroom",
            // when scrolling up
            pinned : "headroom--pinned-bottom",
            // when scrolling down
            unpinned : "headroom--unpinned-bottom",
          }
        });
    }

    //Match content & menu height for content menu
    setTimeout(function(){
        if($('body').hasClass('vertical-content-menu')){
            setContentMenuHeight();
        }
    },500);
    function setContentMenuHeight(){
        var menuHeight = $('.main-menu').height();
        var bodyHeight = $('.content-body').height();
        if(bodyHeight<menuHeight){
            $('.content-body').css('height',menuHeight);
        }
    }

    //좌측 서브메뉴 클릭시 class 처리
    $(`a[data-menu="submenu"]`).on('click', function(e){
      //e.preventDefault();
      $(this).closest('ul').find('li').removeClass('active');
      $(this).closest('li').addClass('active');
    });

    // Collapsible Card
    $('a[data-action="collapse"]').on('click',function(e){
        e.preventDefault();
        $(this).closest('.card').children('.card-content').collapse('toggle');
        $(this).closest('.card').find('[data-action="collapse"] i').toggleClass('ft-plus ft-minus');

    });

    // Toggle fullscreen
    $('a[data-action="expand"]').on('click',function(e){
        e.preventDefault();
        $(this).closest('.card').find('[data-action="expand"] i').toggleClass('ft-maximize ft-minimize');
        $(this).closest('.card').toggleClass('card-fullscreen');
    });

    //  Notifications & messages scrollable
    if($('.scrollable-container').length > 0){
        $('.scrollable-container').each(function(){
            var scrollable_container = new PerfectScrollbar($(this)[0]); 
        });
    }

    // Reload Card
    $('a[data-action="reload"]').on('click',function(){
        var block_ele = $(this).closest('.card');

        // Block Element
        block_ele.block({
            message: '<div class="ft-refresh-cw icon-spin font-medium-2"></div>',
            timeout: 2000, //unblock after 2 seconds
            overlayCSS: {
                backgroundColor: '#FFF',
                cursor: 'wait',
            },
            css: {
                border: 0,
                padding: 0,
                backgroundColor: 'none'
            }
        });
    });

    // Close Card
    $('a[data-action="close"]').on('click',function(){
        $(this).closest('.card').removeClass().slideUp('fast');
    });

    // Match the height of each card in a row
    setTimeout(function(){
        $('.row.match-height').each(function() {
            $(this).find('.card').not('.card .card').matchHeight(); // Not .card .card prevents collapsible cards from taking height
        });
    },500);


    $('.card .heading-elements a[data-action="collapse"]').on('click',function(){
        var $this = $(this),
        card = $this.closest('.card');
        var cardHeight;

        if(parseInt(card[0].style.height,10) > 0){
            cardHeight = card.css('height');
            card.css('height','').attr('data-height', cardHeight);
        }
        else{
            if(card.data('height')){
                cardHeight = card.data('height');
                card.css('height',cardHeight).attr('data-height', '');
            }
        }
    });

    // Add open class to parent list item if subitem is active except compact menu
    var menuType = $body.data('menu');
    if(menuType != 'vertical-compact-menu' && menuType != 'horizontal-menu' && compactMenu === false ){
        if( $body.data('menu') == 'vertical-menu-modern' ){
            if( localStorage.getItem("menuLocked") === "true"){
                $(".main-menu-content").find('li.active').parents('li').addClass('open');
            }
        }
        else{
            $(".main-menu-content").find('li.active').parents('li').addClass('open');
        }
    }
    if(menuType == 'vertical-compact-menu' || menuType == 'horizontal-menu'){
        $(".main-menu-content").find('li.active').parents('li:not(.nav-item)').addClass('open');
        $(".main-menu-content").find('li.active').parents('li').addClass('active');
    }

    //card heading actions buttons small screen support
    $(".heading-elements-toggle").on("click",function(){
        $(this).parent().children(".heading-elements").toggleClass("visible");
    });

    //  Dynamic height for the chartjs div for the chart animations to work
    var chartjsDiv = $('.chartjs'),
    canvasHeight = chartjsDiv.children('canvas').attr('height');
    chartjsDiv.css('height', canvasHeight);

    if($body.hasClass('boxed-layout')){
        if($body.hasClass('vertical-overlay-menu') || $body.hasClass('vertical-compact-menu')){
           var menuWidth= $('.main-menu').width();
           var contentPosition = $('.app-content').position().left;
           var menuPositionAdjust = contentPosition-menuWidth;
           if($body.hasClass('menu-flipped')){
                $('.main-menu').css('right',menuPositionAdjust+'px');
           }else{
                $('.main-menu').css('left',menuPositionAdjust+'px');
           }
        }
    }

    $('.nav-link-search').on('click',function(){
        var $this = $(this),
        searchInput = $(this).siblings('.search-input');

        if(searchInput.hasClass('open')){
            searchInput.removeClass('open');
        }
        else{
            searchInput.addClass('open');
        }
    });

    
    // Hide overlay menu on content overlay click on small screens
    $(document).on('click', '.sidenav-overlay', function(e) {
        // Hide menu
        $.app.menu.hide();
        return false;
    });
    
    // Execute below code only if we find hammer js for touch swipe feature on small screen
    if(typeof Hammer !== 'undefined'){
    
        // Swipe menu gesture
        var swipeInElement = document.querySelector('.drag-target');
    
        if( $(swipeInElement).length > 0 ){
            var swipeInMenu = new Hammer(swipeInElement);
    
            swipeInMenu.on("panright", function(ev) {
                if( $body.hasClass('vertical-overlay-menu') ){
                    $.app.menu.open();
                    return false;
                }
            });
        }
    
        // menu swipe out gesture
        setTimeout(function(){
            var swipeOutElement = document.querySelector('.main-menu');
            var swipeOutMenu;
    
            if( $(swipeOutElement).length > 0 ){
                swipeOutMenu = new Hammer(swipeOutElement);    
            
                swipeOutMenu.get('pan').set({ direction: Hammer.DIRECTION_ALL, threshold: 100 });
    
                swipeOutMenu.on("panleft", function(ev) {
                    if( $body.hasClass('vertical-overlay-menu') ){
                        $.app.menu.hide();
                        return false;
                    }
                });
            }
        }, 300);
    
        // menu overlay swipe out gestrue
        var swipeOutOverlayElement = document.querySelector('.sidenav-overlay');
    
        if( $(swipeOutOverlayElement).length > 0 ){
    
            var swipeOutOverlayMenu = new Hammer(swipeOutOverlayElement);
    
            swipeOutOverlayMenu.on("panleft", function(ev) {
                if( $body.hasClass('vertical-overlay-menu') ){
                    $.app.menu.hide();
                    return false;
                }
            });
        }
    }
    
    $(document).on('click', '.menu-toggle, .modern-nav-toggle', function(e) {
        e.preventDefault();
    
        // Hide dropdown of user profile section for material templates
        if($('.user-profile .user-info .dropdown').hasClass('show')){
            $('.user-profile .user-info .dropdown').removeClass('show');
            $('.user-profile .user-info .dropdown .dropdown-menu').removeClass('show');
        }
    
        // Toggle menu
        $.app.menu.toggle();
    
        setTimeout(function(){
            $(window).trigger( "resize" );
        },200);
    
        if($('#collapsed-sidebar').length > 0){
            setTimeout(function(){
                if($body.hasClass('menu-expanded') || $body.hasClass('menu-open')){
                    $('#collapsed-sidebar').prop('checked', false);
                }
                else{
                    $('#collapsed-sidebar').prop('checked', true);
                }
            },1000);
        }
    
        // Hides dropdown on click of menu toggle
        // $('[data-toggle="dropdown"]').dropdown('hide');
        
        // Hides collapse dropdown on click of menu toggle
        if($('.vertical-overlay-menu .navbar-with-menu .navbar-container .navbar-collapse').hasClass('show')){
            $('.vertical-overlay-menu .navbar-with-menu .navbar-container .navbar-collapse').removeClass('show');
        }
    
        return false;
    });
    
    $(document).on('click', '.open-navbar-container', function(e) {
    
        var currentBreakpoint = Unison.fetch.now();
    
        // Init drilldown on small screen
        $.app.menu.drillDownMenu(currentBreakpoint.name);
    
        // return false;
    });
    
    $(document).on('click', '.main-menu-footer .footer-toggle', function(e) {
        e.preventDefault();
        $(this).find('i').toggleClass('pe-is-i-angle-down pe-is-i-angle-up');
        $('.main-menu-footer').toggleClass('footer-close footer-open');
        return false;
    });
    
    // Add Children Class
    $('.navigation').find('li').has('ul').addClass('has-sub');
    
    // Page full screen
    $('.nav-link-expand').on('click', function(e) {
        if (typeof screenfull != 'undefined'){
            if (screenfull.enabled) {
                screenfull.toggle();
            }
        }
    });
    if (typeof screenfull != 'undefined'){
        if (screenfull.enabled) {
            $(document).on(screenfull.raw.fullscreenchange, function(){
                if(screenfull.isFullscreen){
                    $('.nav-link-expand').find('i').toggleClass('ft-minimize ft-maximize');
                }
                else{
                    $('.nav-link-expand').find('i').toggleClass('ft-maximize ft-minimize');
                }
            });
        }
    }
    
    $(document).on('click', '.mega-dropdown-menu', function(e) {
        e.stopPropagation();
    });
  
    $('.step-icon').each(function(){
      var $this = $(this);
      if($this.siblings('span.step').length > 0){
        $this.siblings('span.step').empty();
        $(this).appendTo($(this).siblings('span.step'));
      }
    });
    
    // Update manual scroller when window is resized
    $(window).resize(function() {
        $.app.menu.manualScroller.updateHeight();
    });
    
    $('#sidebar-page-navigation').on('click', 'a.nav-link', function(e){
        e.preventDefault();
        e.stopPropagation();
        var $this = $(this),
        href= $this.attr('href');
        var offset = $(href).offset();
        var scrollto = offset.top - 80; // minus fixed header height
        $('html, body').animate({scrollTop:scrollto}, 0);
        setTimeout(function(){
            $this.parent('.nav-item').siblings('.nav-item').children('.nav-link').removeClass('active');
            $this.addClass('active');
        }, 100);
    });
  }

  setUserInfo() {
    Swal.fire({
      html: this.vModel.getUserInfoPopUp(),
      confirmButtonText: '닫기',
      width: 'auto',
      willOpen: (popupElement) => {
        // TODO
      },

      didOpen: (popupElement) => {
        // TODO
      },

      willClose: (popupElement) => {
        // TODO
      },

      didClose: () => {
        // TODO
      }
    });
  }

  logout(){
    this.confirm('로그아웃', '로그아웃 하시겠습니까?',null,()=>{
      try{
        this.authController.reqPostLogout(()=>{
          location.href = '/';
        });
      }catch(except){
        console.error(except)
      }
      // finally{
      //   location.href = '/';
      // }
    });
  }
}