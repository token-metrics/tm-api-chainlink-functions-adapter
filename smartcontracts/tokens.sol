// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {FunctionsClient} from "@chainlink/contracts@1.4.0/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts@1.4.0/src/v0.8/shared/access/ConfirmedOwner.sol";
import {FunctionsRequest} from "@chainlink/contracts@1.4.0/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";

/**
 * @title TokensConsumer
 * @notice Retrieves token data from Token Metrics API via Chainlink Functions
 */
contract TokensConsumer is FunctionsClient, ConfirmedOwner {
    using FunctionsRequest for FunctionsRequest.Request;

    // State variables
    bytes32 public s_lastRequestId;
    bytes public s_lastResponse;
    bytes public s_lastError;
    string public tokenInfo;

    error UnexpectedRequestID(bytes32 requestId);
    event Response(
        bytes32 indexed requestId,
        string tokenInfo,
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
            'const { JsonRpcProvider } = ethers;',
            'const TOKENS_API_URL = "https://api.tokenmetrics.com/v2/tokens";',
            "const apiKey = secrets?.API_KEY;",
            'if (!apiKey) throw Error("API_KEY is required for Token Metrics API");',
            "const token_id = args[0] || '';",
            "const token_name = args[1] || '';",
            "const symbol = args[2] || '';",
            "const params = {};",
            "if (token_id) params.token_id = token_id;",
            "if (token_name) params.token_name = token_name;",
            "if (symbol) params.symbol = symbol;",
            "params.limit = 1;",
            "params.page = 1;",
            "const response = await Functions.makeHttpRequest({",
            " url: TOKENS_API_URL,",
            ' headers: { "x-api-key": `${apiKey}`, accept: "application/json" },',
            " params",
            "});",
            "if (response.error) {",
            ' throw Error(`API failed: ${response.error.message}`);',
            "}",
            "const apiResponse = response.data;",
            'if (!apiResponse || !apiResponse.success) throw Error(`Tokens API error: ${apiResponse?.message || "Unknown error"}`);',
            "if (!apiResponse.data || !Array.isArray(apiResponse.data)) throw Error('No tokens data received');",
            "const tokens = apiResponse.data;",
            "if (tokens.length === 0) throw Error('No tokens found');",
            "const formattedTokens = {",
            " TOKEN_ID: tokens[0].TOKEN_ID,",
            " TOKEN_SYMBOL: tokens[0].TOKEN_SYMBOL,",
            " TOKEN_NAME: tokens[0].TOKEN_NAME",
            "};",
            "let result = '';",
            "if (token_id) {",
            " result = Functions.encodeString(formattedTokens.TOKEN_SYMBOL);",
            "} else {",
            " result = Functions.encodeString(formattedTokens.TOKEN_ID);",
            "}",
            "return result;"
        );

    /**
     * @notice Sends the request to Chainlink Functions
     * @param subscriptionId Your Chainlink subscription ID
     * @param args Arguments to pass [token_id, token_name, symbol]
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

        // Decode bytes to string since we encoded it as string in the adapter
        tokenInfo = abi.decode(response, (string));

        emit Response(requestId, tokenInfo, response, err);
    }

    /**
     * @notice Get the token information from the last request
     * @return If token_id was provided in the request, returns the token symbol
     *         Otherwise, returns the token ID
     */
    function getTokenInfo() external view returns (string memory) {
        return tokenInfo;
    }
} 