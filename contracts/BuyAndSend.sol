pragma solidity ^0.5.0;

import "./IERC20.sol";
import "./SafeERC20.sol";

contract BuyAndSend {
  using SafeERC20 for IERC20;
  address payable proxy;

  constructor(address payable _proxy) public {
    proxy = _proxy;
  } 

  function buyAndSend(bytes memory _calldata, address receiver, IERC20 toToken) payable public {
    callProxy(_calldata, msg.value);
    toToken.safeTransfer(receiver, toToken.balanceOf(address(this)));
  }

  function callProxy(bytes memory _calldata, uint256 _value) internal {
    (bool success, bytes memory data) = proxy.call.value(_value)(_calldata);
    require(success);
  }

  function () external payable {}
}
