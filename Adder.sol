//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Adder{
    uint public count;
    constructor (uint _count){
        count=_count;
    }
    function Add(uint amount) public returns(uint){
        count+=amount;
        return count;
    }
    function reset()public{
        count=0;
    }
    function getCount()public view returns(uint){
        return count;
    }
}