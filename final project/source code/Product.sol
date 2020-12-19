pragma solidity ^0.6.0;

import "./Item.sol";
import "./Ownable.sol";

contract Product is Ownable {

    struct S_Product {
        string identifier;
        uint code;
        uint stock;
        string category;
        string subCategory;
        mapping(uint => Item) items;
        mapping(uint => uint) serial_numbers;
        uint index_item;
        string brand;
        }
    mapping(uint => S_Product) public products;
    uint products_index;

    mapping(uint => uint) public product_positions_by_code;
    mapping(bytes32 => uint) public product_positions_by_name;

    event Item_state (string identifier, uint code, uint stock, address item_address,uint state, address sender, uint price, uint serialNumber);

    function stringToBytes(string memory sourceStr) private pure returns(bytes32) {
        bytes32 temp = 0x0;
        assembly {
            temp := mload(add(sourceStr, 32))
        }
    return temp;
}

    function createProduct(string memory _identifier,  uint _code, string memory brand, string memory category, string memory subCategory) public onlyOwner{
        products[products_index] = S_Product({identifier: _identifier,
                                              stock: 0,
                                              category: category,
                                              subCategory: subCategory,
                                              index_item:0,
                                              code: _code,
                                              brand: brand});
        product_positions_by_code[_code]=products_index;
        product_positions_by_name[stringToBytes(_identifier)]=products_index;
        products_index++;
    }

   function check_if_product_exists(string memory _identifier, uint _code) public view returns(string memory message,  bool outcome) {
       if (products[product_positions_by_code[_code]].code == _code){
            return("Product code already present", false);
        } else if(keccak256(bytes(products[product_positions_by_name[keccak256(bytes(_identifier))]].identifier)) == keccak256(bytes(_identifier))){
            return("Product name already present", false);
        } else{
            return("", true);
        }
   }


   function check_if_sn_exists(uint _code, uint serial_number) public view returns(string memory message, bool outcome) {
       if (products[product_positions_by_code[_code]].stock == 0){
           return("", true);
       }
       uint item_index = products[product_positions_by_code[_code]].serial_numbers[serial_number];
       Item it = products[product_positions_by_code[_code]].items[item_index];
       if( it.serialNumber() == serial_number){
            return("Serial number already present", false);
        } else {
            return("", true);
        }
   }

   function reduce_stock(uint index_product, uint index, uint state, address sender,uint price) public {
       products[index_product].stock--;
       Item it = products[index_product].items[index];
       emit Item_state(products[index_product].identifier,
                        products[index_product].code,
                        products[index_product].stock,
                        address(it),
                        state,
                        sender,
                        price,
                        it.serialNumber());
       }

    function get_first_free_by_name(string memory _name) public view returns(string memory message, address item_address, uint price, bool outcome){
        uint p_index = product_positions_by_name[stringToBytes(_name)];

        if(keccak256(bytes(products[p_index].identifier)) != keccak256(bytes(_name))){
            outcome=false;
            return('Product does not exist', address(products[p_index].items[0]), 0,  outcome);
        } else if(products[p_index].stock == 0){
            outcome=false;
            return('Product out of stock', address(products[p_index].items[0]), 0,  outcome);
        } else {
            outcome=true;
            uint index_item = products[p_index].index_item;
            uint index = index_item - products[p_index].stock;
            Item it = products[p_index].items[index];
            return('', address(it), products[p_index].items[index].price(),  outcome);
        }
    }

     function get_first_free_by_code(uint _code)  public view returns(string memory message, address item_address, uint price, bool outcome){
        uint p_index = product_positions_by_code[_code];
        if(products[p_index].code != _code){
            outcome=false;
            return('Product does not exist', address(products[p_index].items[0]), 0,  outcome);
        } else if(products[p_index].stock == 0){
            outcome=false;
            return('Product out of stock', address(products[p_index].items[0]), 0,  outcome);
        } else {
            outcome=true;
            uint index_item = products[p_index].index_item;
            uint index = index_item - products[p_index].stock;
            Item it = products[p_index].items[index];
            return('', address(it), products[p_index].items[index].price(),  outcome);
        }
    }

    function gatherProductInfo_by_code(uint _code) public view
    returns(string memory identifier, uint code, uint stock, string memory brand, string memory category, string memory subCategory, bool outcome)
    {
        uint p_index = product_positions_by_code[_code];
        S_Product memory prod = products[p_index] ;
        if (prod.code == _code){
            outcome = true;
            return(prod.identifier, prod.code, prod.stock, prod.brand, prod.category, prod.subCategory, outcome);
        } else {
            outcome = false;
            return("Product not found", 0, 0, "", "", "",  outcome);
        }
    }
    function gatherProductInfo_by_name(string memory _name) public view
    returns(string memory identifier, uint code, uint stock, string memory brand, string memory category, string memory subCategory, bool outcome)
    {
        uint p_index = product_positions_by_name[stringToBytes(_name)];
        S_Product memory prod = products[p_index];
        if (keccak256(bytes(_name)) == keccak256(bytes(prod.identifier))){
           outcome = true;
           return(prod.identifier, prod.code, prod.stock, prod.brand, prod.category, prod.subCategory, outcome);
        } else {
           outcome = false;
           return("Product not found", 0, 0, "", "", "", outcome);
        }
    }

    function createItem(uint _serialNumber, uint _price, uint prod_code) public onlyOwner {
        uint _index_product = product_positions_by_code[prod_code];
        uint index_item = products[_index_product].index_item;
        Item item = new Item(this, _serialNumber, _price,  index_item, _index_product);
        products[_index_product].items[index_item] = item;
        products[_index_product].serial_numbers[_serialNumber] = index_item;
        products[_index_product].index_item++;
        products[_index_product].stock++;
    }
}
