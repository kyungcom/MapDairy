function check(){
    if(document.frm.psw.value!=document.frm.psw_repeat.value){
      alert("비밀번호가 일치하지 않습니다.");
      document.frm.psw_repeat.focus();
      return false;
    }
    else{
      return true;
    }
  }