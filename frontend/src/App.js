import React, { useState, useEffect } from "react";
import "./App.css";

const App = () => {
  const [selectedItem, setSelectedItem] = useState([]);
  const [products, setProducts] = useState([]);
  const [showFlex, setShowFlex] = useState("");
  const [balance, setBalance] = useState(0);

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
        <div className={`col-sm-6 col-md-4 col-lg-3 mb-4`} key={product.id}>
          <div className="card text-center sold-out">
            <div className="card-body">
              <h5 className="card-title">{product.name}</h5>
              <p className="card-text">฿ {product.price}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className={`col-sm-6 col-md-4 col-lg-3 mb-4`} key={product.id}>
          <div
            className={`card text-center product ${
              selectedItem[0] === product.id ? "bg-primary text-white" : ""
            }`}
            onClick={() =>
              clickProduct(product.id, product.name, product.price)
            }
          >
            <div className="card-body">
              <h5 className="card-title">{product.name}</h5>
              <p className="card-text">฿ {product.price}</p>
            </div>
          </div>
        </div>
      )
    );
  };

  // ฟังก์ชันกดเลือกสินค้า
  const clickProduct = (product_id, product_name, product_price) => {
    setSelectedItem([product_id, product_name, product_price]);
  };

  // ฟังก์ชันเมื่อกดสั่งซื้อ
  const clickPurchase = () => {
    if (selectedItem) {
      setShowFlex("d-flex");
    }
  };

  // ฟังก์ชันเมื่อกดสั่งซื้อ
  const cancelPurchase = () => {
    setShowFlex("");
  };

  // ฟังก์ชันใส่เงิน
  const addMoney = (money) => {
    setBalance((prevBalance) => prevBalance + money);
  };

  // ฟังก์ชันคืนเงิน
  const refund = () => {
    setBalance(0);
  };

  return (
    <div className="px-5">
      <h1 className="my-4 text-center">Vending Machine</h1>
      <div className="row">{renderItems()}</div>
      <div className="text-end">
        <button
          className="btn btn-primary btn-lg btn-block mt-4"
          onClick={clickPurchase}
          disabled={!selectedItem}
        >
          {selectedItem ? "สั่งซื้อ" : "กรุณาเลือกสินค้า"}
        </button>
      </div>

      {/* modal ชำระเงิน */}
      <div className={`modal-custom ${showFlex}`}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-body">
              <div className="row ">
                <h1 className="col-6 text-end">{selectedItem[1]}</h1>
                <h3 className="col-6 mt-2">฿ {selectedItem[2]}</h3>
              </div>
              <div className="row mt-1">
                <h5 className="col-6 text-end">balance</h5>
                <h5 className="col-6">฿ {balance}</h5>
              </div>
              <hr />
              <p className="text-center text-secondary">
                *simulate money dropping
              </p>
              <div className="row text-center">
                <div className="col-4 mb-2">
                  <div className="coin1" onClick={() => addMoney(1)}>1</div>
                </div>
                <div className="col-4 mb-2">
                  <div className="coin5" onClick={() => addMoney(5)}>5</div>
                </div>
                <div className="col-4 mb-2">
                  <div className="coin10" onClick={() => addMoney(10)}>10</div>
                </div>
              </div>
              <div className="row text-center">
                <div className="col-4 mb-2 bn20" onClick={() => addMoney(20)}>20</div>
                <div className="col-4 mb-2 bn50" onClick={() => addMoney(50)}>50</div>
                <div className="col-4 mb-2 bn100" onClick={() => addMoney(100)}>100</div>
              </div>
              <div className="row text-center">
                <div className="col-6 mb-2 bn500" onClick={() => addMoney(500)}>500</div>
                <div className="col-6 mb-2 bn1000" onClick={() => addMoney(1000)}>1000</div>
              </div>
            </div>
            <hr />
            <div className="modal-footer d-flex justify-content-between">
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
                  className="btn btn-warning ms-3"
                  onClick={refund}
                >
                  Refund
                </button>
              </div>
              <button type="button" className="btn btn-success">
                Pay icon
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
