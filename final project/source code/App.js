import React, { Component } from "react";
import Product from "./contracts/Product.json";
import Item from "./contracts/Item.json";

import getWeb3 from "./getWeb3";
import "./App.css";




class App extends Component {
  state = {price: "",
           productName: "",
           brand: "",
           category: "",
           subCategory: "",
           productCode: "" ,
           productCode_ext:"",
           productCode_check:"",
           productName_check:"",
           productCode_buy:"",
           productName_buy:"",
           item_SN:"",
           item_price:"",
           loaded:false};

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      this.web3 = await getWeb3();
      // Use web3 to get the user's accounts.

    this.accounts = await this.web3.eth.getAccounts(); // Get the contract instance.

    this.networkId = await this.web3.eth.net.getId();
    this.product= new this.web3.eth.Contract(
      Product.abi,
      Product.networks[this.networkId] && Product.networks[this.networkId].address,
      );

    this.item = new this.web3.eth.Contract(
      Item.abi,
      Item.networks[this.networkId] && Item.networks[this.networkId].address,
      );

    this.listenToPaymentEvent();
    this.setState({loaded:true});

  } catch (error) {
        alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
        );
        console.error(error);
      }
  };

  render() {
    if (! this.state.loaded  ) {
      return <div>Loading Web3, accounts, and contract...</div>;
    } return (
    <div className="App">
      <h1>Blockchain-based FIFO store</h1>

      <div class="row">

        <div className = 'column-left'>
          <h2>Manager</h2>
          <div id = 'left'>
            <div id="rcorners1">
              <h3>Add product</h3>
              <br/>
              <p>Product Name: <input type="text" name="productName" value={this.state.productName} onChange={this.handleInputChange}/> </p>
              <p>Brand: <input type="text" name="brand" value={this.state.brand} onChange={this.handleInputChange} /> </p>
              <p>Category: <input type="text" name="category" value={this.state.category} onChange={this.handleInputChange} /> </p>
              <p>Sub-category: <input type="text" name="subCategory" value={this.state.subCategory} onChange={this.handleInputChange} /> </p>
              <p>Product Code: <input type="text" name="productCode" value={this.state.productCode} onChange={this.handleInputChange} /> </p>
              <button type="button" className="button" onClick={this.handleSubmit_product}>Create new Product</button>
              </div>
          </div>
          <div id = 'right'>
            <div id="rcorners1">
              <h3>Add Item</h3>
              <br/>
              <p>Product Code: <input type="text" name="productCode_ext" value={this.state.productCode_ext} onChange={this.handleInputChange}/> </p>
              <p>Item serial number: <input type="text" name="item_SN" value={this.state.item_SN} onChange={this.handleInputChange}/> </p>
              <p>Item Price (ETH): <input type="text" name="item_price" value={this.state.item_price} onChange={this.handleInputChange}/></p>
              <button type="button" className="button" onClick={this.handleSubmit_item}>Create new Item</button>
            </div>
          </div>
        </div>

        <div class = 'column-right'>
          <h2>Customer</h2>
          <div id = 'left'>
            <div id="rcorners1">
              <h3>Check product</h3>
              <br/>
              <p>Product Code: <input type="text" name="productCode_check" value={this.state.productCode_check} onChange={this.handleInputChange}/> </p>
              <button type="button" class="button" onClick={this.handleSubmit_check_product_by_code}>Check Product</button><br/><br/>
              <p>Product Name: <input type="text" name="productName_check" value={this.state.productName_check} onChange={this.handleInputChange}/> </p>
              <button type="button" class="button" onClick={this.handleSubmit_check_product_by_name}>Check Product</button>
            </div>
          </div>
          <div id = 'right'>
            <div id="rcorners1">
              <h3>Buy item</h3>
              <br/>
              <p>Product Code: <input type="text" name="productCode_buy" value={this.state.productCode_buy} onChange={this.handleInputChange}/> </p>
              <button type="button" class="button" onClick={this.handleSubmit_buy_product_by_code}>Buy item</button><br/><br/>
              <p>Product Name: <input type="text" name="productName_buy" value={this.state.productName_buy} onChange={this.handleInputChange}/> </p>
              <button type="button" class="button" onClick={this.handleSubmit_buy_product_by_name}>Buy item</button>
            </div>
          </div>
        </div>

      </div>
    </div>
    ); }

    handleSubmit_buy_product_by_name = async () => {
      const { productName_buy } = this.state;
      let result = await this.product.methods.get_first_free_by_name(productName_buy).call();
      if(result.outcome == true){
        alert("Please pay " + result.price + " ETH to the adress "+ result.item_address);
      } else {
        alert(result.message);
      }
    };

    handleSubmit_buy_product_by_code = async () => {
      const { productCode_buy } = this.state;
      let result = await this.product.methods.get_first_free_by_code(productCode_buy).call();
      if(result.outcome == true){
        alert("Please pay " + result.price + " ETH to the adress "+ result.item_address);
      } else {
        alert(result.message);
      }
    };

    handleSubmit_check_product_by_code = async () => {
      const { productCode_check } = this.state;
      let result = await this.product.methods.gatherProductInfo_by_code(productCode_check).call();
      if (result.outcome==true){
        console.log(result)
        alert("PROD INFO \n Product name: " + result.identifier +
        "\n Brand:" + result.brand +
        "\n Product code:" + result.code +
        "\n Category:" + result.category + ", " + result.subCategory +
        "\n Stock: " + result.stock);
      } else{
        alert("PROD INFO  \n Product name: " + result.identifier);
      }
    };

    handleSubmit_check_product_by_name = async () => {
      const { productName_check } = this.state;
      let result = await this.product.methods.gatherProductInfo_by_name(productName_check).call();
      if (result.outcome==true){
        alert("PROD INFO \n Product name: " + result.identifier +
        "\n Brand:" + result.brand +
        "\n Product code:" + result.code +
        "\n Category:" + result.category + " " + result.subCategory +
        "\n Stock: " + result.stock);
      } else{
        alert("PROD INFO  \n Product name: " + result.identifier);
      }
    };


    handleSubmit_product = async () => {
      const { productName, productCode, brand, category, subCategory} = this.state;
      try {
        let check = await this.product.methods.check_if_product_exists(productName, productCode).call();
        console.log(check, productName)
        if (check.outcome == true){
          let result = await this.product.methods.createProduct(productName, productCode, brand, category, subCategory).send({ from: this.accounts[0] });
          alert("Product added");
        } else{
          alert("Addition failed.\n" + check.message);
        }
      } catch (e) {
        if (e.message.includes("You are not the owner")){
          alert("Only the owner have privileges for this feature")
        }
        else if (e.message.includes("tx doesn't have the correct nonce")){
          alert("Reset the account")
        }
        else{
          alert("Reload the web page")
        }
      }
    };

    handleSubmit_item = async () => {
      const { productCode_ext,item_SN,item_price } = this.state;
      try { 
        let check_prod = await this.product.methods.check_if_product_exists(" ", productCode_ext).call();
        if (check_prod.outcome == false){
            let check = await this.product.methods.check_if_sn_exists(productCode_ext,item_SN).call();
            if (check.outcome == true){
              let result = await this.product.methods.createItem(item_SN, item_price, productCode_ext).send({ from: this.accounts[0]});
              alert("Item added");
              } else {
              alert("Addition failed.\n" + check.message);
            }
          } else{
            alert("Addition failed.\nProduct not present in the database");
          }
        } catch (e) {
        if (e.message.includes("You are not the owner")){
          alert("Only the owner have privileges for this feature")
        }
        else if (e.message.includes("tx doesn't have the correct nonce")){
          alert("Reset the account")
        }
        else{
          alert("Reload the web page")
        }
      }
    };


    handleInputChange = (event) => {
      const target = event.target;
      const value = target.type === 'checkbox' ? target.checked : target.value; const name = target.name;
      this.setState({
        [name]: value
      });
    }

    listenToPaymentEvent = () => {
      let self = this;

      this.product.events.Item_state().on("data", async function(evt){
        console.log(evt)
        if(evt.returnValues.state == 1){
            alert("Item: " + evt.returnValues.identifier + "\nCode: " + evt.returnValues.code+"\nAddr.: "+ evt.returnValues.item_address
            +"\nSerial number: "+ evt.returnValues.serialNumber +
            "\nPrice: "+evt.returnValues.price+" ETH \nBought by: "+evt.returnValues.sender+"\nNew stock is  " + evt.returnValues.stock);
          }
        })

    }
}


export default App;
