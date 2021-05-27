
const express=require('express');
const mysql=require('mysql');
const util=require('util');
const googleMaps=require('@google/maps');
require('dotenv').config();

var connection=mysql.createConnection({
  host     : 'localhost',
  user     : process.env.SQL_ID,
  password : process.env.SQL_PWD,
  database : process.env.DATABASE
});

const router=express.Router();

var googleMapsClient=googleMaps.createClient({
  key:process.env.PLACES_API_KEY,
});



router.get('/',function(req,res){
  if(req.session.is_Login){
    var sql="SELECT userid,placename AS name,date_format(date,'%Y-%m-%d') AS date,time,text,lat,lng FROM diary where userid='"+req.session.userid+"'"+" ORDER BY date ASC";
    connection.query(sql,function(err,results,fields){
      if(err){
        console.log('err: '+err);
      }else{
       res.render('main',{
       title:'메인페이지',
       name:req.session.userid,
       query:' ',
       data:results
      });
    }
    })
  }else{
    res.render('layout');
  }
});

router.get('/login.ejs',function(req,res){
  if(req.session.is_Login){
    var sql="SELECT userid,placename AS name,date_format(date,'%Y-%m-%d') AS date,time,text,lat,lng FROM diary where userid='"+req.session.userid+"'"+" ORDER BY date ASC";
      connection.query(sql,function(err,results,fields){
        if(err){
          console.log('err: '+err);
        }else{
         res.render('main',{
         title:'메인페이지',
         name:req.session.userid,
         query:' ',
         data:results
        });
      }
  })
}else{
    res.render('login');
  }
});

router.get('/signup.ejs',function(req,res){
  if(req.session.is_Login){
    res.send('<script type="text/javascript">location.href="/";</script>')
    }else{
    res.render('signup');
  }
})

router.get('/main.ejs',function(req,res){
  if(req.session.is_Login){
    var sql="SELECT userid,placename AS name,date_format(date,'%Y-%m-%d') AS date,time,text,lat,lng FROM diary where userid='"+req.session.userid+"'"+" ORDER BY time ASC";
    connection.query(sql,function(err,results,fields){
      if(err){
        console.log('err: '+err);
      }else{
       res.render('main',{
       title:'메인페이지',
       name:req.session.userid,
       query:' ',
       data:results
      });
    }
    })
  }else{
    res.render('layout');
  }
})

router.get('/logout',function(req,res){
  req.session.destroy(function(){ 
    req.session;
    });
  res.render('layout');
})

router.post('/signup',function(req,res){
  let userid=req.body.email;
  let userpwd=req.body.psw;
  let duplication=false;
  var sql='SELECT userid FROM users';
  connection.query(sql,function(err,results,fields){
    if(err) console.log("에러\n"+err);
    else{
      
      for(var i=0;i<results.length;i++){
        if(results[i].userid==userid)
          duplication=true;
      }
    }
    if(duplication==false){
      sql="INSERT INTO nodejs.users (userid,password) VALUES ('"+userid+"','"+userpwd+"')"
      connection.query(sql,function(err){
        if(err) console.log("실패"+err);
        else {
          res.send('<script type="text/javascript">alert("가입완료!"); location.href="/";</script>');
      }
      })
     
    }
    else{
      res.send('<script type="text/javascript">alert("아이디 중복입니다!");location.href="signup.ejs";</script>');
    }

  })
})

router.post('/login',function(req,res){
  let userid=req.body.uname;
  let userpwd=req.body.psw;
  var sql="SELECT password from users WHERE userid='"+userid+"'";
  connection.query(sql,function(err,results,fields){
    if(err){
      console.log('err: '+err);
    }else{
      if(results.length==0){
        res.send('<script type="text/javascript">alert("아이디 혹은 비밀번호가 옳바르지 않습니다.");location.href="login.ejs";</script>');
      }
      else if(results[0].password!=userpwd){
        res.send('<script type="text/javascript">alert("아이디 혹은 비밀번호가 옳바르지 않습니다.");location.href="login.ejs";</script>');
      }else{
        req.session.userid=userid;
        req.session.is_Login=1;
        res.send('<script type="text/javascript">location.href="/";</script>')
      }
    };
  })
});

router.post('/check_in/:query',function(req,res){
  var date=req.body.date;
  var time=req.body.time;
  var text=req.body.text;
  var locationArr= req.params.query.split(',');
  var sql="INSERT INTO nodejs.diary (userid,placename,date,time,text,lat,lng) VALUES ('"+req.session.userid+"','"+locationArr[0]+"','"+date+"','"+time+"','"+text+"','"+locationArr[1]+"','"+locationArr[2]+"')";
      connection.query(sql,function(err){
        if(err) console.log("실패"+err);
        else {
          res.send('<script type="text/javascript">alert("등록완료!");location.href="/" </script>');
      }
  })
});

router.get('/autocomplete/:query',(req,res,next)=>{
  googleMapsClient.placesQueryAutoComplete({
    input:req.params.query,
    language:'ko',
  },(err,response)=>{
    if(err){
      return next(err);
    }
    return res.json(response.json.predictions);
  });
});
router.get('/diary/:query',(req,res,next)=>{
  var sql="SELECT userid,placename AS name,date_format(date,'%Y-%m-%d') AS date,time,text,lat,lng FROM diary where userid='"+req.session.userid+"'"+"AND date='"+req.params.query+"'"+" ORDER BY time ASC";
  connection.query(sql,function(err,results,fields){
    if(err){
      return next(err);
    }else{
     return res.send(results);
    } 
  })
})

router.get('/search/:query',async(req,res,next)=>{
  const googlePlaces=util.promisify(googleMapsClient.places);
  const googlePlacesNearby=util.promisify(googleMapsClient.placesNearby);
  const {lat,lng}=req.query;
  try{
    let response;
    if(lat&&lng){
      response=await googlePlacesNearby({
        keyword:req.params.query,
        location:`${lat},${lng}`,
        rankby:'distance',
        language:'ko'
      });
    }else{
      response=await googlePlacesNearby({
        keyword:req.params.query,
        location:{ lat: 37.239961471642516,lng: 127.08331885578615 },
        rankby:'distance',
        language:'ko'
      });
  }
    var sql="SELECT userid,placename AS name,date_format(date,'%Y-%m-%d') AS date,time,text,lat,lng FROM diary where userid='"+req.session.userid+"'"+" ORDER BY date ASC";
    connection.query(sql,function(err,results,fields){
      if(err){
        console.log('err: '+err);
      }else{
       res.render('main',{
       title:`${req.params.query} 검색 결과`,
       results:response.json.results,
       name:req.session.userid,
       query:req.params.query,
       data:results
      });
      }
    })
  }catch(error){
    console.error(error);
    next(error);
  }
});
router.post('/update/:query',function(req,res){
  var info=req.params.query.split(',');
  var date=req.body.date;
  var time=req.body.time;
  var text=req.body.text;
  var sql="UPDATE diary SET date='"+date+"', time='"+time+"', text='"+text+"' WHERE date='"+info[0]+"' AND time='"+info[1]+"' AND userid='" +req.session.userid+"'" ;
  connection.query(sql,function(err,result){
    if(err) throw err;
    res.send('<script type="text/javascript">alert("수정완료!");location.href="/"</script>');
  })
});
router.post('/delete/:query',function(req,res){
  var info=req.params.query.split(',');
  var sql="DELETE FROM diary where date='"+info[0]+"'AND time='"+info[1]+"'";
  connection.query(sql,function(err,result){
    if(err) throw err;
    res.send('<script type="text/javascript">alert("삭제완료!");location.href="/"</script>');
  })

});
module.exports=router;