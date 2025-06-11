// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {FunctionsClient} from "@chainlink/functions/contracts/dev/v1_0_0/FunctionsClient.sol";
import {FunctionsRequest} from "@chainlink/functions/contracts/dev/v1_0_0/libraries/FunctionsRequest.sol";

contract TokenMetricsAdapter is FunctionsClient {
    using FunctionsRequest for FunctionsRequest.Request;

    bytes32 public latestRequestId;
    bytes public latestResponse;
    uint256[] public latestPrices; // Store the array of prices

    event PricesReceived(bytes32 indexed requestId, uint256[] prices);

    constructor(address functionsRouter) FunctionsClient(functionsRouter) {}

    function sendTokenPriceRequest(
        string calldata sourceCode,
        string[] calldata args,
        string calldata secretsUrl,
        uint64 slotId,
        uint64 subscriptionId,
        uint32 gasLimit
    ) external returns (bytes32 requestId) {
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(sourceCode);
        req.setArgs(args);
        req.addDONHostedSecrets(secretsUrl, slotId);

        requestId = _sendRequest(req.encodeCBOR(), subscriptionId, gasLimit);
        latestRequestId = requestId;
    }

    function fulfillRequest(bytes32 requestId, bytes memory response, bytes memory err) internal override {
        latestResponse = response;
        
        if (err.length == 0) {
            // Decode as uint256 array (not single uint256!)
            uint256[] memory prices = abi.decode(response, (uint256[]));
            
            // Store the prices
            delete latestPrices; // Clear existing array
            for (uint256 i = 0; i < prices.length; i++) {
                latestPrices.push(prices[i]);
            }
            
            emit PricesReceived(requestId, prices);
        }
    }

    // Get all latest prices
    function getLatestPrices() external view returns (uint256[] memory) {
        return latestPrices;
    }

    // Get a specific price by index
    function getLatestPriceByIndex(uint256 index) external view returns (uint256) {
        require(index < latestPrices.length, "Index out of bounds");
        return latestPrices[index];
    }

    // Get the first price (for single token requests)
    function getOneLatestPrice() external view returns (uint256) {
        require(latestPrices.length > 0, "No prices available");
        return latestPrices[0];
    }

    // Get number of prices received
    function getPriceCount() external view returns (uint256) {
        return latestPrices.length;
    }
}
