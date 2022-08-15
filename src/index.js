// Import Module
const path = require('path');
require('dotenv').config() // process.env config
const express = require('express');
const session = require('express-session');
const favicon = require('serve-favicon');

// Routing Import
// Common Import
const logout = require('./routes/auth/logout.js');
const login = require('./routes/auth/login.js');

// Assistant Import
const assistantMain = require('./routes/assistant/assistant.js');
const assistantAuth = require('./routes/assistant/auth.js');
const assistantRegist = require('./routes/assistant/registration.js');
const assistantApplication = require('./routes/assistant/application/application.js');
const assistantSchedule = require('./routes/assistant/application/schedule.js');
const assistantResult = require('./routes/assistant/result/result.js');
const assistantCertificate = require('./routes/assistant/result/certificate.js');
const assistantNotice = require('./routes/assistant/notice/notice.js');
const assistantQuestion = require('./routes/assistant/question/question.js');
const assistantPolicy = require('./routes/assistant/policy/policy.js');

// Student Import
const studentMain = require('./routes/student/student.js');

const studentCertificate = require('./routes/student/certificate/certificate.js')

const studentNotice = require('./routes/student/notice/notice.js');
const studentQuestion = require('./routes/student/question/question.js');

const studentAuth = require('./routes/student/auth/auth.js');


// Server Env
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
// Routing For All
app.use('/auth/login', login);
app.use('/auth/logout', logout);
app.use(function(req, res, next){
  if(req.session.auth !== 99){
    console.log("Not Auth!");
    return res.redirect('/auth/login');
  }
  next();
})

// Routing For Assistant
app.use('/assistant', assistantMain);
app.use('/assistant/auth', assistantAuth);
app.use('/assistant/auth/registration', assistantRegist);
app.use('/assistant/application', assistantApplication);
app.use('/assistant/schedule', assistantSchedule);
app.use('/assistant/result', assistantResult);
app.use('/assistant/certificate', assistantCertificate);
app.use('/assistant/notice', assistantNotice);
app.use('/assistant/question', assistantQuestion);
app.use('/assistant/policy', assistantPolicy);

// Routing For Student
app.use('/student', studentMain);

app.use('/student/certificate', studentCertificate);

app.use('/student/notice', studentNotice);
app.use('/student/question', studentQuestion);
app.use('/student/auth', studentAuth);


// Error Checking?
app.use('/', function(req, res){ 
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


