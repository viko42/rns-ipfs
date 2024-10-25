// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

interface RNSChecker {
    function getAddress(uint256 id) external view returns (address);
}

contract RNSIPFSRegistry is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    string public defaultIpfsLink;
    mapping(string => string) private rnsLinks;
    RNSChecker public nftContract;
    string public constant name = "RNS IPFS Registry";

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    function initialize(string memory _defaultIpfsLink, address _nftContractAddress) public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        defaultIpfsLink = _defaultIpfsLink;
        nftContract = RNSChecker(_nftContractAddress);
    }

    function updateRnsLink(string memory id, string memory ipfsLink) public {
        if (msg.sender != owner()) {
            uint256 tokenId = uint256(keccak256(abi.encodePacked(id)));
            require(nftContract.getAddress(tokenId) == msg.sender, "Not the token owner or contract owner");
        }
        rnsLinks[id] = ipfsLink;
    }

    function getIpfsLink(string memory id) public view returns (string memory) {
        string memory link = rnsLinks[id];
        return bytes(link).length > 0 ? link : defaultIpfsLink;
    }

    function updateDefaultIpfsLink(string memory _newDefaultLink) public onlyOwner {
        defaultIpfsLink = _newDefaultLink;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    // Ajout d'une fonction receive
    receive() external payable {
        // Cette fonction peut rester vide ou vous pouvez y ajouter une logique si nécessaire
    }

    // Ou ajout d'une fonction fallback
    fallback() external payable {
        // Cette fonction peut rester vide ou vous pouvez y ajouter une logique si nécessaire
    }
}
