if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();
}
// require("dotenv").config();

const express = require('express');
const { appendFile } = require('fs');
const mongoose = require('mongoose')
const path = require('path')
const methodOverride = require('method-override')
const Campground = require('./models/campground')
const ejsMate = require('ejs-mate');
const res = require('express/lib/response');
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const Joi = require('joi')
const { campgroundSchema, reviewSchema } = require('./schemas.js')
const Review = require('./models/review')
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local')
const User = require('./models/user')
const mongoSanitize = require('express-mongo-sanitize');
// const helmet = require('helmet')
const MongoDBStore = require("connect-mongo");

// 라우팅 모음
const userRoutes = require('./routes/user')
const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');
// const dbUrl = 'mongodb://localhost:27017/yelp-camp'
// 'mongodb://localhost:27017/yelp-camp',

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'

mongoose.connect(dbUrl, {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express()

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'))
// To remove data using these defaults:
app.use(mongoSanitize({
    replaceWith: '_',
}));

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

// require (express) 부분이랑 아래의 코드가 colt가 작성한거랑 다름
const store = MongoDBStore.create({  // change this line
	mongoUrl: dbUrl,  // change this line
	secret,
	touchAfter: 24 * 60 * 60,
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

// 정적 assets 서비스
app.use(express.static(path.join(__dirname, 'public')))

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7 
    }
}

app.use(session(sessionConfig))
app.use(flash());
// app.use(helmet());

// 우리가 허용하려는 url들을 의미한다.
// const scriptSrcUrls = [
//     "https://stackpath.bootstrapcdn.com/",
//     "https://api.tiles.mapbox.com/",
//     "https://api.mapbox.com/",
//     "https://kit.fontawesome.com/",
//     "https://cdnjs.cloudflare.com/",
//     "https://cdn.jsdelivr.net",
// ];
// const styleSrcUrls = [
//     "https://kit-free.fontawesome.com/",
//     "https://stackpath.bootstrapcdn.com/",
//     "https://api.mapbox.com/",
//     "https://api.tiles.mapbox.com/",
//     "https://fonts.googleapis.com/",
//     "https://use.fontawesome.com/",
// ];
// const connectSrcUrls = [
//     "https://api.mapbox.com/",
//     "https://a.tiles.mapbox.com/",
//     "https://b.tiles.mapbox.com/",
//     "https://events.mapbox.com/",
// ];
// const fontSrcUrls = [];
// app.use(
//     helmet.contentSecurityPolicy({
//         directives: {
//             defaultSrc: [],
//             connectSrc: ["'self'", ...connectSrcUrls],
//             scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
//             styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//             workerSrc: ["'self'", "blob:"],
//             objectSrc: [],
//             imgSrc: [
//                 "'self'",
//                 "blob:",
//                 "data:",
//                 "https://res.cloudinary.com/goodsosbva/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
//                 "https://images.unsplash.com/",
//             ],
//             fontSrc: ["'self'", ...fontSrcUrls],
//         },
//     })
// );


// passport
app.use(passport.initialize());
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
    // console.log(req.query);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// app.use((req, res, next) => {
//     console.log(req.session)
//     res.locals.currentUser = req.user;
//     res.locals.success = req.flash('success');
//     res.locals.error = req.flash('error');
//     next();
// })



app.get('/fakeUser', async(req, res) => {
    const user = new User({email: 'good', username: 'khs'})
    const newUser = await User.register(user, 'chicken');
    res.send(newUser)
})


app.use('/', userRoutes);
// go to the campgrounds.js (/campgrounds를 campgrounds로 이용)
app.use('/campgrounds', campgrounds)
// go to the reviews.js
app.use('/campgrounds/:id/reviews', reviews)

app.get('/', (req, res) => {
    res.render('home')
});



app.all('*', (req, res, next) => {
    next(new ExpressError('page not found', 404))
})

app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message = 'oh on, something went wrong!'
    res.status(statusCode).render('error', { err })
})

// 히로쿠에서 자동적으로 포트를 설정해줌.
const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`serving on port ${port}`)
})