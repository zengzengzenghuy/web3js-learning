//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Adder{
    uint public count;
    event Adder(uint count);
    constructor (uint _count){
        count=_count;
    }
    function Add(uint amount) public returns(uint){
        require(amount>0,"add value should be positive");
        count+=amount;
        emit Adder(amount);
        return count;
    }
    function reset()public{
        count=0;
    }
    function getCount()public view returns(uint){
        return count;
    }
}