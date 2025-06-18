// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {FunctionsClient} from "@chainlink/contracts@1.4.0/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts@1.4.0/src/v0.8/shared/access/ConfirmedOwner.sol";
import {FunctionsRequest} from "@chainlink/contracts@1.4.0/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";

/**
 * @title ScenarioAnalysisConsumer
 * @notice Retrieves token scenario analysis data from Token Metrics API via Chainlink Functions
 */
contract ScenarioAnalysisConsumer is FunctionsClient, ConfirmedOwner {
    using FunctionsRequest for FunctionsRequest.Request;

    // State variables
    bytes32 public s_lastRequestId;
    bytes public s_lastResponse;
    bytes public s_lastError;
    uint256 public moonScenarioPrice;

    error UnexpectedRequestID(bytes32 requestId);
    event Response(
        bytes32 indexed requestId,
        uint256 price,
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
            'const SCENARIO_ANALYSIS_API_URL = "https://api.tokenmetrics.com/v2/scenario-analysis";',
            "const REQUEST_TIMEOUT = 10000;", // 10 seconds timeout
            "const apiKey = secrets?.API_KEY;",
            'if (!apiKey) throw Error("API_KEY is required for Token Metrics API");',
            "const tokenId = args[0];",
            'if (!tokenId) throw Error("token_id is required");',
            "const response = await Functions.makeHttpRequest({",
            " url: SCENARIO_ANALYSIS_API_URL,",
            ' headers: { "x-api-key": `${apiKey}`, accept: "application/json" },',
            " params: { token_id: tokenId },",
            " timeout: REQUEST_TIMEOUT",
            "});",
            "if (response.error) {",
            ' if (response.error.message.includes("timeout")) throw Error("Request timed out");',
            ' throw Error(`API failed: ${response.error.message}`);',
            "}",
            "const apiResponse = response.data;",
            'if (!apiResponse || !apiResponse.success) throw Error(`Scenario Analysis API error: ${apiResponse?.message || "Unknown error"}`);',
            "if (!apiResponse.data || !Array.isArray(apiResponse.data) || apiResponse.data.length === 0) throw Error('No scenario analysis data received');",
            "const item = apiResponse.data[0];",
            "if (!item || !item.SCENARIO_PREDICTION || !item.SCENARIO_PREDICTION.scenario_prediction) throw Error('Invalid scenario analysis data received');",
            "const moonScenario = item.SCENARIO_PREDICTION.scenario_prediction[0]?.predicted_price_moon;",
            'if (!moonScenario || typeof moonScenario !== "number") throw Error("No moon scenario prediction found");',
            "const predictedPriceStr = moonScenario.toFixed(18);",
            "const cleanPredictedPriceStr = predictedPriceStr.replace(/\\.?0+$/, '');",
            "const predictedPrice = ethers.parseUnits(cleanPredictedPriceStr, 18);",
            "return Functions.encodeUint256(predictedPrice);"
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
        moonScenarioPrice = abi.decode(response, (uint256));

        emit Response(requestId, moonScenarioPrice, response, err);
    }

    /**
     * @notice Get the latest moon scenario price in wei (18 decimals)
     */
    function getMoonScenarioPrice() external view returns (uint256) {
        return moonScenarioPrice;
    }
} 