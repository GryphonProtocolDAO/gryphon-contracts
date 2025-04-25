// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./IAgentFactory.sol";
import "./IAgentToken.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "@openzeppelin/contracts/governance/IGovernor.sol";

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";


contract AgentFactory is
IAgentFactory,
Initializable,
AccessControlUpgradeable,
PausableUpgradeable
{
    using SafeERC20 for IERC20;

    uint256 private _nextId;
    address public tokenImplementation;
    uint256 public applicationThreshold;

    address[] public allTokens;

    address public assetToken; // Base currency
    uint256 public maturityDuration; // Staking duration in seconds for initial LP. eg: 10years

    bytes32 public constant WITHDRAW_ROLE = keccak256("WITHDRAW_ROLE"); // Able to withdraw and execute applications

    event NewPersona(
        address token,
        address lp
    );
    event NewApplication(uint256 id);

    enum ApplicationStatus {
        Active,
        Executed,
        Withdrawn
    }

    struct Application {
        string name;
        string symbol;
        string tokenURI;
        ApplicationStatus status;
        uint256 withdrawableAmount;
        address proposer;
        uint8[] cores;
        uint256 proposalEndBlock;
    }

    mapping(uint256 => Application) private _applications;

    address public gov; // Deprecated in v2, execution of application does not require DAO decision anymore

    modifier onlyGov() {
        require(msg.sender == gov, "Only DAO can execute proposal");
        _;
    }

    event ApplicationThresholdUpdated(uint256 newThreshold);
    event GovUpdated(address newGov);
    event ImplContractsUpdated(address token, address dao);


    bool internal locked;

    modifier noReentrant() {
        require(!locked, "cannot reenter");
        locked = true;
        _;
        locked = false;
    }

    ///////////////////////////////////////////////////////////////
    // V2 Storage
    ///////////////////////////////////////////////////////////////
    address[] public allTradingTokens;
    address private _uniswapRouter;
    address private _minter; // Unused
    address private _tokenAdmin;
    address public defaultDelegatee;

    // Default agent token params
    bytes private _tokenSupplyParams;
    bytes private _tokenTaxParams;
    uint16 private _tokenMultiplier; // Unused

    bytes32 public constant BONDING_ROLE = keccak256("BONDING_ROLE");

    ///////////////////////////////////////////////////////////////

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address tokenImplementation_,
        address assetToken_,
        uint256 applicationThreshold_,
        uint256 nextId_,
        address tokenAdmin_,
        address uniswapRouter_
    ) public initializer {
        __Pausable_init();

        tokenImplementation = tokenImplementation_;
        assetToken = assetToken_;
        applicationThreshold = applicationThreshold_;
        _nextId = nextId_;
        _tokenAdmin = tokenAdmin_;
        _uniswapRouter = uniswapRouter_;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function getApplication(
        uint256 proposalId
    ) public view returns (Application memory) {
        return _applications[proposalId];
    }

    function proposeAgent(
        string memory name,
        string memory symbol,
        string memory tokenURI,
        uint8[] memory cores
    ) public whenNotPaused returns (uint256) {
        address sender = _msgSender();
        require(
            IERC20(assetToken).balanceOf(sender) >= applicationThreshold,
            "Insufficient asset token"
        );
        require(
            IERC20(assetToken).allowance(sender, address(this)) >=
            applicationThreshold,
            "Insufficient asset token allowance"
        );
        require(cores.length > 0, "Cores must be provided");

        IERC20(assetToken).safeTransferFrom(
            sender,
            address(this),
            applicationThreshold
        );

        uint256 id = _nextId++;
        uint256 proposalEndBlock = block.number; // No longer required in v2
        Application memory application = Application(
            name,
            symbol,
            tokenURI,
            ApplicationStatus.Active,
            applicationThreshold,
            sender,
            cores,
            proposalEndBlock
        );
        _applications[id] = application;
        emit NewApplication(id);

        return id;
    }

    function withdraw(uint256 id) public noReentrant {
        Application storage application = _applications[id];

        require(
            msg.sender == application.proposer ||
            hasRole(WITHDRAW_ROLE, msg.sender),
            "Not proposer"
        );

        require(
            application.status == ApplicationStatus.Active,
            "Application is not active"
        );

        require(
            block.number > application.proposalEndBlock,
            "Application is not matured yet"
        );

        uint256 withdrawableAmount = application.withdrawableAmount;

        application.withdrawableAmount = 0;
        application.status = ApplicationStatus.Withdrawn;

        IERC20(assetToken).safeTransfer(
            application.proposer,
            withdrawableAmount
        );
    }

    function _executeApplication(
        uint256 id,
        bytes memory tokenSupplyParams_
    ) internal returns (address){
        require(
            _applications[id].status == ApplicationStatus.Active,
            "Application is not active"
        );

        require(_tokenAdmin != address(0), "Token admin not set");

        Application storage application = _applications[id];

        uint256 initialAmount = application.withdrawableAmount;
        application.withdrawableAmount = 0;
        application.status = ApplicationStatus.Executed;
        // C1
        address token = _createNewAgentToken(
            application.name,
            application.symbol,
            tokenSupplyParams_
        );
        // C2

        IERC20(assetToken).safeTransfer(token, initialAmount);
        IAgentToken(token).addInitialLiquidity(address(this));
        address lp = IAgentToken(token).liquidityPools()[0];
        emit NewPersona(token, lp);
        return token;
    }

    function executeApplication(uint256 id) public noReentrant {
        // This will bootstrap an Agent with following components:
        // C1: Agent Token
        // C2: LP Pool + Initial liquidity

        Application storage application = _applications[id];

        require(
            msg.sender == application.proposer ||
            hasRole(WITHDRAW_ROLE, msg.sender),
            "Not proposer"
        );

        _executeApplication(id, _tokenSupplyParams);
    }


    function _createNewAgentToken(
        string memory name,
        string memory symbol,
        bytes memory tokenSupplyParams_
    ) internal returns (address instance) {
        instance = Clones.clone(tokenImplementation);
        IAgentToken(instance).initialize(
            [_tokenAdmin, _uniswapRouter, assetToken],
            abi.encode(name, symbol),
            tokenSupplyParams_,
            _tokenTaxParams
        );

        allTradingTokens.push(instance);
        return instance;
    }

    function totalAgents() public view returns (uint256) {
        return allTokens.length;
    }

    function setApplicationThreshold(
        uint256 newThreshold
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        applicationThreshold = newThreshold;
        emit ApplicationThresholdUpdated(newThreshold);
    }


    function setImplementations(
        address token
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        tokenImplementation = token;
    }

    function setMaturityDuration(
        uint256 newDuration
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        maturityDuration = newDuration;
    }

    function setTokenAdmin(
        address newTokenAdmin
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _tokenAdmin = newTokenAdmin;
    }

    function setTokenSupplyParams(
        uint256 maxSupply,
        uint256 lpSupply,
        uint256 vaultSupply,
        uint256 maxTokensPerWallet,
        uint256 maxTokensPerTxn,
        uint256 botProtectionDurationInSeconds,
        address vault
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _tokenSupplyParams = abi.encode(
            maxSupply,
            lpSupply,
            vaultSupply,
            maxTokensPerWallet,
            maxTokensPerTxn,
            botProtectionDurationInSeconds,
            vault
        );
    }

    function setTokenTaxParams(
        uint256 projectBuyTaxBasisPoints,
        uint256 projectSellTaxBasisPoints,
        uint256 taxSwapThresholdBasisPoints,
        address projectTaxRecipient
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _tokenTaxParams = abi.encode(
            projectBuyTaxBasisPoints,
            projectSellTaxBasisPoints,
            taxSwapThresholdBasisPoints,
            projectTaxRecipient
        );
    }

    function setAssetToken(
        address newToken
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        assetToken = newToken;
    }

    function pause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }


    function initFromBondingCurve(
        string memory name,
        string memory symbol,
        uint8[] memory cores,
        uint256 applicationThreshold_,
        address creator
    ) public whenNotPaused onlyRole(BONDING_ROLE) returns (uint256) {
        address sender = _msgSender();
        require(
            IERC20(assetToken).balanceOf(sender) >= applicationThreshold_,
            "Insufficient asset token"
        );
        require(
            IERC20(assetToken).allowance(sender, address(this)) >=
            applicationThreshold_,
            "Insufficient asset token allowance"
        );
        require(cores.length > 0, "Cores must be provided");

        IERC20(assetToken).safeTransferFrom(
            sender,
            address(this),
            applicationThreshold_
        );

        uint256 id = _nextId++;
        uint256 proposalEndBlock = block.number; // No longer required in v2
        Application memory application = Application(
            name,
            symbol,
            "",
            ApplicationStatus.Active,
            applicationThreshold_,
            creator,
            cores,
            proposalEndBlock
        );
        _applications[id] = application;
        emit NewApplication(id);

        return id;
    }

    function executeBondingCurveApplication(
        uint256 id,
        uint256 totalSupply,
        uint256 lpSupply,
        address vault
    ) public onlyRole(BONDING_ROLE) noReentrant returns (address) {
        bytes memory tokenSupplyParams = abi.encode(
            totalSupply,
            lpSupply,
            totalSupply - lpSupply,
            totalSupply,
            totalSupply,
            0,
            vault
        );
        address agentToken = _executeApplication(id, tokenSupplyParams);

        return agentToken;
    }

    function setDefaultDelegatee(
        address newDelegatee
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        defaultDelegatee = newDelegatee;
    }

    function getTokenTaxParams() public view returns (bytes memory) {
        return _tokenTaxParams;
    }

    function getTokenSupplyParams() public view returns (bytes memory) {
        return _tokenSupplyParams;
    }
}
