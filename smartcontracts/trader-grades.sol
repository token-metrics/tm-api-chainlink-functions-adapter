// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {FunctionsClient} from "@chainlink/contracts@1.4.0/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts@1.4.0/src/v0.8/shared/access/ConfirmedOwner.sol";
import {FunctionsRequest} from "@chainlink/contracts@1.4.0/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";

/**
 * @title TraderGradesConsumer
 * @notice Retrieves trader grades data from Token Metrics API via Chainlink Functions
 */
contract TraderGradesConsumer is FunctionsClient, ConfirmedOwner {
    using FunctionsRequest for FunctionsRequest.Request;

    // State variables
    bytes32 public s_lastRequestId;
    bytes public s_lastResponse;
    bytes public s_lastError;
    uint256 public traderGrade;

    error UnexpectedRequestID(bytes32 requestId);
    event Response(
        bytes32 indexed requestId,
        uint256 grade,
        bytes rawResponse,
        bytes err
    );

    // Chainlink config (Sepolia)
    address constant ROUTER = 0xb83E47C2bC239B3bf370bc41e1459A34b41238D0;
    bytes32 constant DON_ID =
        0x66756e2d657468657265756d2d7365706f6c69612d3100000000000000000000;
    uint32 constant GAS_LIMIT = 300000;

    constructor() FunctionsClient(ROUTER) ConfirmedOwner(msg.sender) {}

    // Adapter source as inline JavaScript
    string internal source =
        string.concat(
            'const { ethers } = await import("npm:ethers@6.10.0");',
            'const TRADER_GRADES_API_URL = "https://api.tokenmetrics.com/v2/trader-grades";',
            "const apiKey = secrets?.API_KEY;",
            'if (!apiKey) throw Error("API_KEY is required for Token Metrics API");',
            "const token_id = args[0];",
            'if (!token_id) throw Error("token_id is required as first argument");',
            'if (token_id.includes(",")) throw Error("token_id must be a single token ID, not a comma-separated list");',
            "const response = await Functions.makeHttpRequest({",
            " url: TRADER_GRADES_API_URL,",
            ' headers: { "x-api-key": `${apiKey}`, accept: "application/json" },',
            " params: { token_id, limit: 1, page: 1 },",
            "});",
            "if (response.error) {",
            ' throw Error(`API failed: ${response.error.message}`);',
            "}",
            "const apiResponse = response.data;",
            'if (!apiResponse || !apiResponse.success) throw Error(`Trader Grades API error: ${apiResponse?.message || "Unknown error"}`);',
            "if (!apiResponse.data || !Array.isArray(apiResponse.data) || apiResponse.data.length === 0) throw Error('No trader grades data received');",
            "const item = apiResponse.data[0];",
            'if (!item || typeof item.TM_TRADER_GRADE !== "number") throw Error("Invalid trader grades data received");',
            "const traderGrade = ethers.parseUnits(item.TM_TRADER_GRADE.toString(), 18);",
            "return Functions.encodeUint256(traderGrade);"
        );

    /**
     * @notice Sends the request to Chainlink Functions
     * @param subscriptionId Your Chainlink subscription ID
     * @param args Arguments to pass (token ID)
     */
    function sendRequest(
        uint64 subscriptionId,
        string[] calldata args,
        bytes memory encryptedSecretsUrls
    ) external returns (bytes32 requestId) {
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(source);

        if (encryptedSecretsUrls.length > 0)
            req.addSecretsReference(encryptedSecretsUrls);

        if (args.length > 0) req.setArgs(args);

        s_lastRequestId = _sendRequest(
            req.encodeCBOR(),
            subscriptionId,
            GAS_LIMIT,
            DON_ID
        );

        return s_lastRequestId;
    }

    /**
     * @notice Callback function for receiving Chainlink Functions result
     */
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        if (s_lastRequestId != requestId) revert UnexpectedRequestID(requestId);

        s_lastResponse = response;
        s_lastError = err;

        // Decode bytes to uint256 since we encoded it as uint256 in the adapter
        traderGrade = abi.decode(response, (uint256));

        emit Response(requestId, traderGrade, response, err);
    }

    /**
     * @notice Get the latest trader grade in wei (18 decimals)
     */
    function getTraderGrade() external view returns (uint256) {
        return traderGrade;
    }
} 