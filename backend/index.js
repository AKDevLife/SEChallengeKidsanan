var express = require("express");
var cors = require("cors");
const mysql = require("mysql2");
require("dotenv").config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// ฟังก์ชันคำนวณ จำนวนเงินที่ต้องทอน
function getChange(price_change, out_of_cash) {
  var money = {
    1000: 0,
    500: 0,
    100: 0,
    50: 0,
    20: 0,
    10: 0,
    5: 0,
    1: 0,
  };
  var money_arr = [1000, 500, 100, 50, 20, 10, 5, 1];
  // ถ้ามีเหรียญ/ธนบัติที่หมด ให้ลบค่าใน money ที่จะคืน ออก
  if (out_of_cash !== null) {
    // วนลูปเอาหน่วยเงินที่ไม่มีในสต็อกออกจากการคำนวณ
    out_of_cash.forEach((element) => {
      delete money.element;
      money_arr = money_arr.filter((el) => el !== element);
    });
  }
  // วนลูปคำนวณหน่วยเงินแต่ละอันที่ต้องทอน
  money_arr.forEach((d, i) => {
    // คำนวณจำนวนหน่วยปัจจุบันที่สามารถใช้ทอนได้ โดยปัดเศษลงเพื่อให้ได้ค่าที่ใกล้และทอนได้
    var num = Math.floor(price_change / d);
    // ปรับจำนวนเงินที่เหลืออยู่ -เอาเศษมาใช้
    price_change = price_change % d;
    // บวกหน่วยเงินนั้นตามจำนวนที่สามารถทอนเงินได้
    money[d] += num;
  });
  return money;
}

var app = express();
app.use(express.json());
app.use(cors());

// แสดงรายการสินค้าทั้งหมด
app.get("/products", function (req, res, next) {
  connection.query("SELECT * FROM `products`", function (err, results, fields) {
    res.json(results);
  });
});

// คำนวณออเดอร์
app.post("/orders", function (req, res, next) {
  const req_product_id = req.body.product_id;
  const req_balance = req.body.balance;
  const req_money = req.body.money;
  // จำนวนเงินทอน
  let price_change = 0;
  // เงินที่ต้องทอนลูกค้า
  let money_changes = [];

  // ดึงสินค้าที่ตรงกับ id ลูกค้าเลือก
  connection.query(
    "SELECT * FROM products WHERE id = ?",
    [req_product_id],
    function (err, results, fields) {
      const product_id = results[0].id;
      const product_name = results[0].name;
      const product_price = results[0].price;
      const product_amount = results[0].amount;
      // เช็ค error การค้นหา
      if (err) {
        console.error("Error executing SELECT query:", err);
        return;
      }
      // เช็คว่าสินค้าหมดหรือไม่
      if (product_amount == 0) {
        const product = {
          status: 500,
          messsage: product_name + " Out of stock!",
        };
        return res.json(product);
      }else{
        // หน่วยเงินที่หมด
        let out_of_cash = [];
        // ถ้าจำนวนเงินที่รับมามากกว่าราคาสินค้า
        if (req_balance > product_price) {
          // ปรับเพิ่มสต๊อกเหรียญ/แบงค์ จากที่ลูกค้าใส่เข้ามา
          req_money.forEach((data) => {
            connection.query(
              "UPDATE money SET quantity = quantity+? WHERE cost = ?",
              [1, data],
              (err, results, fields) => {
                // เช็ค error การค้นหา
                if (err) {
                  console.error("Error executing query:", err);
                  return;
                }
              }
            );
          });
          // ดึงข้อมูลตารางสต๊อกเหรียญ/แบงค์
          connection.query(
            "SELECT * FROM money",
            function (err, results, fields) {
              // เช็ค error การค้นหา
              if (err) {
                console.error("Error executing query:", err);
                return;
              }
              results.forEach((data) => {
                // เช็คหน่วยเงินที่ไม่มีในสต็อก
                if (data.quantity === 0) {
                  out_of_cash.push(data.cost);
                }
              });
              // คำนวณจำนวนเงินที่ต้องทอน
              price_change = req_balance - product_price;
              money_changes = getChange(price_change, out_of_cash);
              console.log(money_changes);
  
              // ปรับลดสต๊อกเหรียญ/แบงค์ จากที่ทอนลูกค้า
              for (let key in money_changes) {
                console.log(key + ":" + money_changes[key]);
                connection.query(
                  "UPDATE money SET quantity = quantity-? WHERE cost = ?",
                  [money_changes[key], key],
                  (err, results, fields) => {
                    // เช็ค error การค้นหา
                    if (err) {
                      console.error("Error executing query:", err);
                      return;
                    }
                  }
                );
              }
            }
          );
        }
        // ปรับสต็อกสินค้า
        connection.query(
          "UPDATE products SET amount = amount-? WHERE id = ?",
          [1, product_id],
          (err, results, fields) => {
            // เช็ค error การค้นหา
            if (err) {
              console.error("Error executing query:", err);
              return;
            }
          }
        );
        // ส่งค่ากลับไปแสดงที่จอ user
        const product = {
          status: 200,
          messsage: "success",
          product: product_name,
          price_change: price_change,
          money_changes: money_changes,
        };
      }
    }
  );
});

app.listen(5000, function () {
  console.log("CORS-enabled web server listening on port 5000");
});
