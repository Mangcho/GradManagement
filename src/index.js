// Import
const path = require('path');
require('dotenv').config() // 환경변수 세팅
const express = require('express');
const session = require('express-session');
const favicon = require('serve-favicon');

// Routing Import
const logout = require('./routes/auth/logout.js');
const login = require('./routes/auth/login.js');
const assistant = require('./routes/assistant/index.js');
const assistantAuth = require('./routes/assistant/auth.js');
const assistantRegist = require('./routes/assistant/registration.js');
const assistantApplication = require('./routes/assistant/application/application.js');
const assistantSchedule = require('./routes/assistant/application/schedule.js');
const assistantResult = require('./routes/assistant/result/result.js');
const assistantCertificate = require('./routes/assistant/result/certificate.js');

// 서버 기본 세팅
const app = express();
app.use(express.static(path.join(__dirname, '/public'))); 
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended : false}));
app.use(favicon(path.join(__dirname, '/public/images', '/favicon.ico')));

app.use(session({
    secret: process.env.SESSION_SECRET_KEY, // .env 읽어와서 key 세팅
    resave: false,
    saveUninitialized: false
  }));


// Routing

app.use('/auth/login', login);
app.use('/auth/logout', logout);
app.use(function(req, res, next){
  if(req.session.auth !== 99){
    console.log("Not Auth!");
    return res.redirect('/auth/login');
  }
  next();
})
app.use('/assistant', assistant);
app.use('/assistant/auth', assistantAuth);
app.use('/assistant/auth/registration', assistantRegist);
app.use('/assistant/application', assistantApplication);
app.use('/assistant/schedule', assistantSchedule);
app.use('/assistant/result', assistantResult);
app.use('/assistant/certificate', assistantCertificate);



app.use('/', function(req, res){ // auth된 상태라면 가야 할 곳으로 보내주자
  if(req.session.auth === 99){
    console.log("original URL ROUTING : " + req.originalUrl);
    return res.send("something wrong");
  }
  else{
    return res.redirect('/auth/login'); // return 사용 -> 중복 respond prevent
  }

})





app.listen(process.env.PORT, () => {
    console.log('Internal Server IP: '+ process.env.INTERNAL_IP + process.env.PORT);
    console.log('External Server IP: '+ process.env.EXTERNAL_IP + process.env.PORT);
    console.log("=================== LOG ====================");
});



/*
app.use(function(req, res, next) {
    next(createError(404));
  });
   
  // 애러 핸들러 나중에 건드리자
  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    // render the error page
    res.status(err.status || 500);
    //res.render('error');
  });

*/


