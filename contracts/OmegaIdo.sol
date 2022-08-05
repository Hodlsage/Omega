// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./Omega.sol";
import "./Ox.sol";

contract OmegaIdo {
  Omega public omegaAddress;
  Ox public oxAddress;
  address private owner;
  uint public pricePerOmegaPercent;

  constructor(Omega _omegaAddress, Ox _oxAddress, uint _pricePerOmega) {
    owner = msg.sender;
    omegaAddress = _omegaAddress;
    oxAddress = _oxAddress;
    pricePerOmegaPercent = _pricePerOmega;
  }

  function sellOmegaToken(address _buyer, uint _omegaAmount) public {
    require(msg.sender == _buyer, 'You must be the buyer to run this.');
    require(_omegaAmount >= 1 * 10 ** 18, 'You must purchase at least 1 OM token.');

    uint oxAmount = (_omegaAmount * pricePerOmegaPercent) / 100;

    oxAddress.transferFrom(_buyer, address(this), oxAmount);
    omegaAddress.transfer(_buyer, _omegaAmount);
  }

  // TODO: Script to update price
  function updatePrice(uint _price) public {
    require(msg.sender == owner, 'You must be the owner to run this.');
    pricePerOmegaPercent = _price;
  }

  // TODO: Script to withdraw OM form IDO
  function withdrawOmegaFromIdo(address _to, uint _omegaAmount) public {
    require(msg.sender == owner, 'You must be the owner to run this.');
    omegaAddress.transfer(_to, _omegaAmount);
  }

  // TODO: Script to withdraw OX form IDO
  function withdrawOxFromIdo(address _to, uint _oxAmount) public {
    require(msg.sender == owner, 'You must be the owner to run this.');
    oxAddress.transfer(_to, _oxAmount);
  }
}
