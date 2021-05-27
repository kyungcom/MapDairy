const express=require('express');
const bodyParser=require('body-parser');
const morgan=require('morgan');
const session=require('express-session');
const cookieParser=require('cookie-parser');

const app=express();
const index=require('./routes')
require('dotenv').config();

app.use(express.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(__dirname+'/public')); //기본 파일 폴더 위치 설정
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
  secret: process.env.COOKIE_SECRET,
  resave:false,
  saveUninitialized:true,
  cookie: {
    maxAge: 24000 * 60 * 60 // 쿠키 유효기간 24시간
  }
}));
app.use(morgan('dev'));
app.use('/',index);
app.engine('html',require('ejs').renderFile);


app.set('port',process.env.PORT||3000);
app.set('view engine','ejs');



app.use((req,res,next)=>{
    const err=new Error('Not Found');
    err.status=404;
    next(err);
});


app.use((err,req,res)=>{
    res.locals.message=err.message;
    res.locals.error=req.app.get('env')==='development'?err:{};
    res.status(err.status||500);
    res.render('error');
});

app.listen(app.get('port'),()=>{
    console.log(app.get('port'),'번 포트에서 대기 중');
});
