const { Schema } = require('mongoose');
let db;
try {
    db = require('../db');
} catch (e) {
    db = require('./db');
}
const { writeConnection, readConnection } = db;

const bookSchema = new Schema({
    maSach: { 
        type: String, 
        required: true,
        validate: {
            validator: function(v) {
                return v.startsWith('077'); // 3 số cuối MSSV của 23IT.B077
            },
            message: props => `Mã sách phải bắt đầu bằng tiền tố 3 số cuối MSSV (077)!`
        }
    },
    tenSach: String,
    giaGoc: Number,
    giaSauThue: Number
});

// Model đọc dùng readConnection, Model ghi dùng writeConnection
const BookRead = readConnection.model('Book', bookSchema);
const BookWrite = writeConnection.model('Book', bookSchema);

module.exports = { BookRead, BookWrite };
