// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./Omega.sol";
import "./Ox.sol";

contract OmegaDao {
  uint public totalNodes;
  address [] public omegaNodesAddresses;

  Omega public omegaAddress;
  Ox public oxAddress;
  address private owner;
  uint public omegaInterestRatePercent;

  struct Account {
    bool exists;
    uint nanoCount;
    uint miniCount;
    uint kiloCount;
    uint megaCount;
    uint gigaCount;
    uint interestAccumulated;
  }

  mapping(address => Account) public accounts;

  // 0.5%, 0.6%, 0.7%, 0.8%, 1% /day
  uint [] public nodeMultiplers = [1, 3, 7, 16, 100];

  constructor(Omega _omegaAddress, Ox _oxAddress, address [] memory _team) {
    owner = msg.sender;
    omegaAddress = _omegaAddress;
    oxAddress = _oxAddress;
    omegaInterestRatePercent = 1 * 100;

    // create 10 Giga nodes for each team member
    uint i;
    for(i=0; i < _team.length; i++){
      omegaNodesAddresses.push(_team[i]);
      Account memory account = Account(true, 0, 0, 0, 0, 10, 0);
      accounts[_team[i]] = account;
      totalNodes += 10;
    }
  }

  function mintNode(address _address, uint _omegaAmount, uint _oxAmount, uint _nodeType) public {
    require(msg.sender == _address, 'Only user can create a node.');
    require(_nodeType >= 0 && _nodeType <= 4, 'Invalid node type');

    Account memory account;

    if(accounts[_address].exists){
      account = accounts[_address];
    }
    else{
      account = Account(true, 0, 0, 0, 0, 0, 0);
      omegaNodesAddresses.push(_address);
    }

    if(_nodeType == 0){
      require(_omegaAmount >= 100 * 10 ** 18, 'You must provide at least 100 OM for the LP token');
      require(_oxAmount >= 100 * 10 ** 18, 'You must provide at least 100 OX for the LP token');
      account.nanoCount++;
    }
    else if(_nodeType == 1){
      require(_omegaAmount >= 250 * 10 ** 18, 'You must provide at least 250 OM for the LP token');
      require(_oxAmount >= 250 * 10 ** 18, 'You must provide at least 250 OX for the LP token');
      account.miniCount++;
    }
    else if(_nodeType == 2){
      require(_omegaAmount >= 500 * 10 ** 18, 'You must provide at least 500 OM for the LP token');
      require(_oxAmount >= 500 * 10 ** 18, 'You must provide at least 500 OX for the LP token');
      account.kiloCount++;
    }
    else if(_nodeType == 3){
      require(_omegaAmount >= 1000 * 10 ** 18, 'You must provide at least 1000 OM for the LP token');
      require(_oxAmount >= 1000 * 10 ** 18, 'You must provide at least 1000 OX for the LP token');
      account.megaCount++;
    }
    else if(_nodeType == 4){
      require(_omegaAmount >= 5000 * 10 ** 18, 'You must provide at least 5000 OM for the LP token');
      require(_oxAmount >= 5000 * 10 ** 18, 'You must provide at least 5000 OX for the LP token');
      account.gigaCount++;
    }
    totalNodes++;
    accounts[_address] = account;

    omegaAddress.transferFrom(_address, address(this), _omegaAmount);
    oxAddress.transferFrom(_address, address(this), _oxAmount);
  }

  function widthrawInterest(address _to) public {
    require(msg.sender == _to, 'Only user can widthraw its own funds.');
    require(accounts[_to].interestAccumulated > 0, 'Interest accumulated must be greater than zero.');

    uint amount = accounts[_to].interestAccumulated;
    accounts[_to].interestAccumulated = 0;

    omegaAddress.transfer(_to, amount);
  }

  // runs oxly at midnight
  function payInterest() public {
    require(msg.sender == owner, 'You must be the owner to run this.');

    uint i;
    for(i=0; i<omegaNodesAddresses.length; i++){
      address a = omegaNodesAddresses[i];
      Account memory acc = accounts[a];
      uint interestAccumulated;

      // add omegaInterestRatePercent/100 OM per node that address has
      interestAccumulated = (acc.nanoCount * nodeMultiplers[0] * omegaInterestRatePercent * 10 ** 18) / 100;
      interestAccumulated += (acc.miniCount * nodeMultiplers[1] * omegaInterestRatePercent * 10 ** 18) / 100;
      interestAccumulated += (acc.kiloCount * nodeMultiplers[2] * omegaInterestRatePercent * 10 ** 18) / 100;
      interestAccumulated += (acc.megaCount * nodeMultiplers[3] * omegaInterestRatePercent * 10 ** 18) / 100;
      interestAccumulated += (acc.gigaCount * nodeMultiplers[4] * omegaInterestRatePercent * 10 ** 18) / 100;

      acc.interestAccumulated += interestAccumulated;

      accounts[a] = acc; // Do I need this line??
    }
  }

  // runs oxly at 2AM
  function balancePool() public {
    require(msg.sender == owner, 'You must be the owner to run this.');

    uint poolAmount = omegaAddress.balanceOf(address(this)) / 10 ** 18;
    uint runwayInDays = poolAmount/((totalNodes * omegaInterestRatePercent * nodeMultiplers[4]) / 100);
    if(runwayInDays > 900){
      uint newTotalTokens = (365 * omegaInterestRatePercent * totalNodes * nodeMultiplers[4]) / 100; // 365 is the desired runway
      uint amountToBurn = poolAmount - newTotalTokens;
      omegaAddress.burn(amountToBurn * 10 ** 18);
    }
    else if(runwayInDays < 360){
      uint newTotalTokens = (365 * omegaInterestRatePercent * totalNodes * nodeMultiplers[4]) / 100; // 365 is the desired runway
      uint amountToMint = newTotalTokens - poolAmount;
      omegaAddress.mint(amountToMint * 10 ** 18);
    }
  }

  function changeInterestRate(uint _newRate) public {
    require(msg.sender == owner, 'You must be the owner to run this.');
    omegaInterestRatePercent = _newRate;
  }

  function burnOmega(address _dead, uint amount) public {
    require(msg.sender == owner, 'You must be the owner to run this.');
    omegaAddress.transfer(_dead, amount);
  }

  function addOxToLiquidityPool(address _pool, uint amount) public {
    require(msg.sender == owner, 'You must be the owner to run this.');
    oxAddress.transfer(_pool, amount);
  }

  function awardNode(address _address, uint _nodeType) public {
    require(msg.sender == owner, 'You must be the owner to run this.');

    Account memory account;

    if(accounts[_address].exists){
      account = accounts[_address];
    }
    else{
      account = Account(true, 0, 0, 0, 0, 0, 0);
      omegaNodesAddresses.push(_address);
    }

    if(_nodeType == 0){
      account.nanoCount++;
    }
    else if(_nodeType == 1){
      account.miniCount++;
    }
    else if(_nodeType == 2){
      account.kiloCount++;
    }
    else if(_nodeType == 3){
      account.megaCount++;
    }
    else if(_nodeType == 4){
      account.gigaCount++;
    }
    totalNodes++;
    accounts[_address] = account;
  }
}
