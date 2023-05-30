import React, { useState, useEffect } from "react";
import "./Home.css";
import Swal from "sweetalert2";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [selectedItem, setSelectedItem] = useState([]);
  const [showMenu, setShowMenu] = useState("");
  const [showPuchase, setShowPuchase] = useState("");
  const [showPuchaseButton, setShowPuchaseButton] = useState("d-none");
  const [balance, setBalance] = useState(0);
  const [money, setMoney] = useState([]);
  const [showThankYou, setShowThankYou] = useState("");
  const [showThankYouButton, setShowThankYouButton] = useState("d-none");
  const [priceChange, setPriceChange] = useState(0);
  const [remainingChanges, setRemainingChanges] = useState({});

  // ดึงข้อมูลจากสินค้าจาก API
  useEffect(() => {
    fetch(`http://localhost:5000/products`)
      .then((res) => res.json())
      .then((result) => {
        setProducts(result);
        console.log(result);
      });
  }, []);

  // ฟังก์ชันแสดงสินค้า
  const renderItems = () => {
    return products.map((product) =>
      product.amount === 0 ? (
        <div
          className={`col-sm-6 col-md-4 col-lg-3 mb-4 ${showMenu}`}
          key={product.id}
        >
          <div className="card text-center sold-out">
            <div className="card-body">
              <img
                src={`/products/${product.image}`}
                className="image-item"
                width={150}
                alt={product.image}
              ></img>
              <h5 className="card-title">{product.name}</h5>
              <p className="card-text">฿ {product.price}</p>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`col-sm-6 col-md-4 col-lg-3 mb-4 ${showMenu}`}
          key={product.id}
        >
          <div
            className={`card text-center product ${
              selectedItem[0] === product.id ? "select_item" : ""
            }`}
            onClick={() =>
              clickProduct(product.id, product.name, product.price)
            }
          >
            <div className="card-body">
              <img
                src={`/products/${product.image}`}
                className="image-item"
                width={150}
                alt={product.image}
              ></img>
              <h5 className="card-title">{product.name}</h5>
              <p className="card-text">฿ {product.price}</p>
            </div>
          </div>
        </div>
      )
    );
  };

  // ฟังก์ชันเลือกสินค้า
  const clickProduct = (product_id, product_name, product_price) => {
    setSelectedItem([product_id, product_name, product_price]);
  };

  // ฟังก์ชันกดสั่งซื้อ
  const clickPurchase = () => {
    if (selectedItem !== "") {
      setShowMenu("d-none");
      setShowPuchase("d-flex");
      setShowPuchaseButton("d-flex");
    }
  };

  // ฟังก์ชันเมื่อกดยกเลิกสั่งซื้อ
  const cancelPurchase = () => {
    setShowMenu("");
    setShowPuchase("");
    setSelectedItem([]);
    setShowPuchaseButton("d-none");
  };

  // ฟังก์ชันใส่เงิน
  const addMoney = (value) => {
    const updatedMoney = [...money, value];
    setMoney(updatedMoney);
    setBalance((prevBalance) => prevBalance + value);
  };

  // ฟังก์ชันคืนเงิน
  const refund = () => {
    Swal.fire("Success!", "Refund ฿" + balance, "success");
    setBalance(0);
    setMoney([]);
  };

  // ฟังก์ชันชำระเงิน
  const sendOrder = () => {
    const orderData = {
      product_id: selectedItem[0],
      balance: balance,
      money: money,
    };
    console.log(JSON.stringify(orderData));
    fetch("http://localhost:5000/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.status === 1) {
          setPriceChange(result.price_change);
          setRemainingChanges(result.money_changes);
          // ล้างหน้าต่างชำระเงิน
          setShowPuchase("");
          setSelectedItem([]);
          setShowPuchaseButton("d-none");
          // เปิดหน้าต่างขอบคุณ
          setShowThankYou("d-flex");
          setShowThankYouButton("");
        } else {
          Swal.fire(result.messsage, " and refund ฿" + balance, "warning");
        }
      })
      .catch((err) => {
        console.error("Error:", err);
      });
  };

  // ฟังก์ชันแสดงเงินทอน
  const renderMoneyChanges = () => {
    return Object.entries(remainingChanges).map(([key, value]) =>
      value !== 0 ? (
        <li
          key={key}
          className="list-group-item d-flex justify-content-between align-items-start"
        >
          <div className="ms-2 me-auto">
            <div className="fw-bold">฿{key}</div>
          </div>
          <span className="badge bg-success rounded-pill">{value}</span>
        </li>
      ) : null
    );
  };

  // ฟังก์ชันปิด modal ThankYou
  const closModalThankYou = () => {
    setShowThankYou("");
    setShowThankYouButton("d-none");
    setPriceChange(0);
    setRemainingChanges({});
    setShowMenu("");
  };

  return (
    <div>
      {/* Header */}
      <h1 className="header text-center">Vending Machine </h1>

      {/* Content */}
      <div className="menu row">
        {renderItems()}

        {/* modal ชำระเงิน */}
        <div className={`modal-custom ${showPuchase}`}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-body mb-5">
                <div className="row">
                  <h1 className="col-6 text-end">{selectedItem[1]}</h1>
                  <h3 className="col-6 mt-2">฿ {selectedItem[2]}</h3>
                </div>
                <div className="row mt-1 mb-4">
                  <h5 className="col-6 text-end">balance</h5>
                  <h5 className="col-6">฿ {balance}</h5>
                </div>
                <hr />
                <p className="text-center text-secondary mt-4">
                  *simulate money dropping
                </p>
                <div className="row text-center mt-5">
                  <div className="col-4 mb-3">
                    <div className="coin1" onClick={() => addMoney(1, 1)}>
                      1
                    </div>
                  </div>
                  <div className="col-4 mb-3">
                    <div className="coin5" onClick={() => addMoney(5, 1)}>
                      5
                    </div>
                  </div>
                  <div className="col-4 mb-3">
                    <div className="coin10" onClick={() => addMoney(10, 1)}>
                      10
                    </div>
                  </div>
                </div>
                <div className="row text-center">
                  <div
                    className="col-4 mb-3 bn20"
                    onClick={() => addMoney(20, 2)}
                  >
                    20
                  </div>
                  <div
                    className="col-4 mb-3 bn50"
                    onClick={() => addMoney(50, 2)}
                  >
                    50
                  </div>
                  <div
                    className="col-4 mb-3 bn100"
                    onClick={() => addMoney(100, 2)}
                  >
                    100
                  </div>
                </div>
                <div className="row text-center">
                  <div
                    className="col-6 mb-2 bn500"
                    onClick={() => addMoney(500, 2)}
                  >
                    500
                  </div>
                  <div
                    className="col-6 mb-2 bn1000"
                    onClick={() => addMoney(1000, 2)}
                  >
                    1000
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* modal ขอบคุณ */}
        <div className={`modal-custom ${showThankYou}`}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-body">
                <div className="row">
                  <h1 className="col-12 text-center">Thank You</h1>
                </div>
                <div className="row mt-1">
                  <h5 className="col-12 text-center">
                    please collect your product & changes
                  </h5>
                </div>
              </div>
              <hr />
              <div className="row">
                <h3 className="col-12 text-center">
                  ... Remaining Changes ...
                </h3>
              </div>
              <ul className="list-group mb-5">
                {renderMoneyChanges()}
                <li
                  key="TotalChanges"
                  className="list-group-item bg-success text-white d-flex justify-content-between align-items-start"
                >
                  <div className="ms-2 me-auto">
                    <div className="fw-bold">฿{priceChange}</div>
                  </div>
                  <div className="ms-2 ms-auto">
                    <div className="fw-bold">Total Changes</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="footer text-end">
        {/* ปุ่มหน้า menu */}
        <button
          className={`btn btn-lg btn-block btn-purchase ${showMenu}`}
          onClick={clickPurchase}
          disabled={selectedItem == ""}
        >
          {selectedItem == "" ? "Choose Product..." : "Purchase"}
        </button>
        {/* ปุ่มสำหรับ modal ชำระเงิน */}
        <div
          className={`modal-footer ${showPuchaseButton} justify-content-between`}
        >
          <div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={cancelPurchase}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`btn btn-warning ms-3 ${
                balance === 0 ? "disabled" : ""
              }`}
              onClick={refund}
            >
              Refund
            </button>
          </div>
          <button
            type="button"
            className={`btn btn-purchase ${
              balance < selectedItem[2] ? "disabled" : ""
            }`}
            onClick={sendOrder}
          >
            Pay{" "}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={30}
              height={30}
              viewBox="-5 0 28 25"
            >
              <path
                fill="currentColor"
                d="M12.0049 22.0029C6.48204 22.0029 2.00488 17.5258 2.00488 12.0029C2.00488 6.48008 6.48204 2.00293 12.0049 2.00293C17.5277 2.00293 22.0049 6.48008 22.0049 12.0029C22.0049 17.5258 17.5277 22.0029 12.0049 22.0029ZM12.0049 20.0029C16.4232 20.0029 20.0049 16.4212 20.0049 12.0029C20.0049 7.58465 16.4232 4.00293 12.0049 4.00293C7.5866 4.00293 4.00488 7.58465 4.00488 12.0029C4.00488 16.4212 7.5866 20.0029 12.0049 20.0029ZM11.0049 16.0029H8.00488V8.00293H11.0049V6.00293H13.0049V8.00293H14.0049C15.3856 8.00293 16.5049 9.12222 16.5049 10.5029C16.5049 11.0657 16.3189 11.5851 16.0051 12.0029C16.3189 12.4208 16.5049 12.9401 16.5049 13.5029C16.5049 14.8836 15.3856 16.0029 14.0049 16.0029H13.0049V18.0029H11.0049V16.0029ZM10.0049 13.0029V14.0029H14.0049C14.281 14.0029 14.5049 13.7791 14.5049 13.5029C14.5049 13.2268 14.281 13.0029 14.0049 13.0029H10.0049ZM10.0049 10.0029V11.0029H14.0049C14.281 11.0029 14.5049 10.7791 14.5049 10.5029C14.5049 10.2268 14.281 10.0029 14.0049 10.0029H10.0049Z"
              ></path>
            </svg>
          </button>
        </div>
        {/* ปุ่มสำหรับ modal ขอบคุณ */}
        <div
          className={`modal-footer d-flex justify-content-center ${showThankYouButton}`}
        >
          <button
            type="button"
            className="btn btn-secondary"
            onClick={closModalThankYou}
          >
            Finish
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
