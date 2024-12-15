const dateFormater = (formatType , dateString)=>{
  const dateObject = new Date(dateString)
  if(formatType === 'YYYY-MM-DD' && dateString){ 
    const strFullYear = dateObject.getFullYear();
    let strMonth = dateObject.getMonth() + 1;
    if(strMonth < 10){
      strMonth = `0${strMonth}`;
    }
    const strDate = (dateObject.getDate()<10)? '0' +dateObject.getDate() : dateObject.getDate();
    const dateString = `${strFullYear}.${strMonth}.${strDate}`;
    return dateString.replaceAll(' ','');
  }else if(formatType === 'YYYY-MM-DD-HH:MM:SS' && dateString){
    const date = new Date(dateString);

    let year = date.getFullYear();
    let month = date.getMonth() + 1; // 월은 0부터 시작하므로 1을 더해줍니다.
    let day = date.getDate();

    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();

    // 한 자리 숫자 앞에 '0'을 붙여 두 자리로 만듭니다.
    month = month < 10 ? '0' + month : month;
    day = day < 10 ? '0' + day : day;
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    // 최종 포맷: 'YYYY.MM.DD HH:MM:SS'
    return `${year}.${month}.${day} ${hours}.${minutes}.${seconds}`;
  }else{
    return null;
  }
}

function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

function generateUniqueRandomNumber() {
  // 현재 시간을 밀리초 단위로 가져온 후, 랜덤 값과 결합
  const uniqueNumber = Date.now() + Math.floor(Math.random() * 99999999999);
  return uniqueNumber;
}

const currencyFormater = (number, locationTitle, currencySymbol)=>{
  const symbolOption = (currencySymbol)? {style : 'currency', currency : currencySymbol} : '';
  return new Intl.NumberFormat(locationTitle, symbolOption).format(number)
}
