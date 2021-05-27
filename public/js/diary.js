function check(){
    if(document.frm.date.value.length==0){
      alert("날짜를 입력해주세요.");
      document.frm.date.focus();
      return false;
    }
    else if(document.frm.time.value.length==0){
        alert("시간를 입력해주세요.");
        document.frm.time.focus();
        return false;
    }else if(document.frm.text.value.length==0){
        alert("내용를 입력해주세요.");
        document.frm.text.focus();
        return false;
    }else if(document.frm.text.value.length>2000){
        alert("2000글자 이하로 입력해주세요.");
        document.frm.text.focus();
        return false;
    }else{
        return true;
    }
  }
  