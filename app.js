const express = require('express');
const session = require('express-session');
const connectMongo = require('connect-mongo');
const MongoStore = connectMongo.MongoStore || connectMongo.default || connectMongo;
const path = require('path');
require('dotenv').config();

const { BookRead, BookWrite } = require('./models/Book');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Cấu hình View Engine Handlebars
const hbs = require('hbs');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Helper định dạng tiền tệ đẹp (VNĐ)
hbs.registerHelper('formatCurrency', function (value) {
    if (value === undefined || value === null || isNaN(value)) return '0 VNĐ';
    return Number(value).toLocaleString('vi-VN') + ' VNĐ';
});

// Cấu hình Stateless Session lưu trên MongoDB Atlas
app.use(session({
    secret: process.env.SESSION_SECRET || 'my_secret_key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_WRITE_URI, // Lưu session lên Cloud Atlas
        collectionName: 'sessions'
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 ngày
}));

// Xử lý logic Thuế suất động & Footer cá nhân hóa:
// Công thức: VAT = (Chữ số cuối MSSV + 6)% -> MSSV 23IT.B077 có chữ số cuối là 7 => VAT = (7 + 6)% = 13%
const MSSV = "23IT.B077";
const HO_TEN = "Nguyễn Như Huy";
const VAT_RATE = 0.13; // (Chữ số cuối 7 + 6)% = 13%

app.use((req, res, next) => {
    res.locals.footerInfo = {
        hoTen: HO_TEN,
        mssv: MSSV,
        vat: `${VAT_RATE * 100}%`
    };
    next();
});

// Trang chủ / Xem danh sách (Dùng quyền Read)
app.get('/', async (req, res) => {
    try {
        const books = await BookRead.find({}).lean(); // Tự động điều hướng sang luồng Read
        res.render('index', { books });
    } catch (err) {
        console.error('Lỗi khi truy vấn danh sách sách:', err);
        res.status(500).send(`Lỗi hệ thống: ${err.message}`);
    }
});

// Thêm mới sách (Tính toán giá sau thuế & Dùng quyền Write)
app.post('/add', async (req, res) => {
    try {
        const { maSach, tenSach, giaGoc } = req.body;
        // Tự động tính giá sau thuế
        const giaSauThue = Math.round(Number(giaGoc) * (1 + VAT_RATE));

        const newBook = new BookWrite({
            maSach,
            tenSach,
            giaGoc: Number(giaGoc),
            giaSauThue
        });

        await newBook.save(); // Tự động điều hướng sang luồng Write
        res.redirect('/');
    } catch (err) {
        console.error('Lỗi khi thêm sách mới:', err);
        res.status(400).send(`Lỗi: ${err.message}`);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
