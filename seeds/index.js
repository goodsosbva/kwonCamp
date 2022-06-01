const mongoose = require('mongoose')
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers')
const Campground = require('../models/campground')

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useUnifiedTopology: true
});
// khs id => 628320f0374fa5f99504bf4c
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
    // 일단 전부 삭제
    await Campground.deleteMany({})

    // 데이터를 새로히 넣기 1번
    // const c = new Campground({title: 'purple field'})
    // await c.save();
    for(let i = 0; i < 50; i++){
        const random1000 = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '628334582db6e1032c5d93d3',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            // image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price,
            geometry: {
              type: "Point",
              coordinates: [
                  cities[random1000].longitude,
                  cities[random1000].latitude,
              ]
          },
            images: [
                {
                  url: 'https://res.cloudinary.com/dhgabxthq/image/upload/v1653375225/YelpCamp/xrqjd0emukqnv52y8csv.jpg',
                  filename: 'YelpCamp/xrqjd0emukqnv52y8csv',         
                },
                {
                  url: 'https://res.cloudinary.com/dhgabxthq/image/upload/v1653375223/YelpCamp/ymxiimph6oj0xxpdbjoq.jpg',
                  filename: 'YelpCamp/ymxiimph6oj0xxpdbjoq',         
                }
              ]
        })
        await camp.save();
        }
}

seedDB().then(() => {
    mongoose.connection.close();
})