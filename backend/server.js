const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser')
const mongoDB = require('./database/mongoDb')

require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const itemRouter = require('./routes/itemRoutes');
const brandRouter = require('./routes/manufacturerRoutes');
const locationRouter = require('./routes/locationRoutes');
const borrowItemRouter = require('./routes/borrowItemRoutes')
const analyticsRoutes = require('./routes/analyticsRoutes');

mongoDB();

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({
    origin: `${process.env.FRONTEND_URL}`,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRouter);
app.use('/api/item', itemRouter);
app.use('/api/company', brandRouter);
app.use('/api/location', locationRouter);
app.use('/api/borrow', borrowItemRouter)
app.use('/api/analytics', analyticsRoutes);

app.get('/', (req, res) => res.send("uiahhaha"))


app.listen(8080, () => console.log(`Server started on PORT: ${PORT}`));


