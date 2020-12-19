pragma solidity ^0.6.0;

import "./Product.sol";

enum States {Created, Paid, Delivered, Returned, Faulty}
contract Item {
    uint public paid;
    uint public price;
    uint public index;
    uint public index_product;
    uint public serialNumber;
    address  purchaser;
    States public state;
    Product parentContract;
    
    constructor(Product _parentContract, uint _serialNumber, uint _price, uint _index, uint _ind_p) public { 
        paid = 0;
        index = _index;
        index_product = _ind_p;
        price =  _price;
        serialNumber = _serialNumber; 
        state = States.Created;
        parentContract = _parentContract;
    }
    
    function setState(States st) public {
        state = st;
    }

    receive() external payable {
        require(msg.value/10**18 >= price, "We do not offer discounts");  
        require(msg.value/10**18 <= price, "You are sending too much money");  
        paid += msg.value;
        state = States.Paid;
        parentContract.reduce_stock(index_product, index, uint(state), msg.sender,msg.value/10**18) ;
    }
    fallback () external {
    }
}