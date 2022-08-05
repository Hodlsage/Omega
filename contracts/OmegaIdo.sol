// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./Omega.sol";
import "./Ox.sol";

contract OmegaIdo {
  Omega public cuboAddress;
  Ox public daiAddress;
  address private owner;
  uint public pricePerOmegaPercent;

  constructor(Omega _cuboAddress, Ox _daiAddress, uint _pricePerOmega) {
    owner = msg.sender;
    cuboAddress = _cuboAddress;
    daiAddress = _daiAddress;
    pricePerOmegaPercent = _pricePerOmega;
  }

  function sellOmegaToken(address _buyer, uint _cuboAmount) public {
    require(msg.sender == _buyer, 'You must be the buyer to run this.');
    require(_cuboAmount >= 1 * 10 ** 18, 'You must purchase at least 1 OM token.');

    uint daiAmount = (_cuboAmount * pricePerOmegaPercent) / 100;

    daiAddress.transferFrom(_buyer, address(this), daiAmount);
    cuboAddress.transfer(_buyer, _cuboAmount);
  }

  // TODO: Script to update price
  function updatePrice(uint _price) public {
    require(msg.sender == owner, 'You must be the owner to run this.');
    pricePerOmegaPercent = _price;
  }

  // TODO: Script to withdraw OM form IDO
  function withdrawOmegaFromIdo(address _to, uint _cuboAmount) public {
    require(msg.sender == owner, 'You must be the owner to run this.');
    cuboAddress.transfer(_to, _cuboAmount);
  }

  // TODO: Script to withdraw OX form IDO
  function withdrawOxFromIdo(address _to, uint _daiAmount) public {
    require(msg.sender == owner, 'You must be the owner to run this.');
    daiAddress.transfer(_to, _daiAmount);
  }
}
