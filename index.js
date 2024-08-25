const express = require("express");
const path = require('path');
const {connectToMongoDB} = require("./connect");
const URL = require('./models/url');
const urlRoute = require('./routes/url');
const staticRoute = require('./routes/staticRouter')
const app = express();
const PORT = 8001;

connectToMongoDB('mongodb://127.0.0.1:27017/short-url').then( ()=> console.log('MongoDB connnected'));

app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'))

app.use(express.json());
app.use(express.urlencoded({extended: false}))

app.use('/url', urlRoute);
app.use('/', staticRoute)
 
// server side rendering (templating engins : EJS, pug js, handlebars )
app.get("/test", async (req, res) => {
    const allUrls = await URL.find({})
    return res.render('home',{
        urls: allUrls,
    })
    // return res.end(`
    //     <html>
    //         <head>
    //             <body>
    //                 <ol>
    //                     ${allUrls.map(url => `<li>${url.shortId} -> ${url.redirectURL} -> ${url.visitHistory.length}</li>`).join('')}
    //                 </ol>
    //             </body>
    //         </head>
    //     </html>
    //     `)
})

app.get('/url/:shortId', async(req, res) => {
    const shortId = req.params.shortId;
    const entry =  await URL.findOneAndUpdate({
        shortId
    },{$push:{
        visitHistory: {
            timestamp: Date.now(),
        },
    }});
    res.redirect(entry.redirectURL);

})

app.listen(PORT, () => console.log('Server Started at PORT ', PORT))

