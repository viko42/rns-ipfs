// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

interface RNSChecker {
    function getAddress(uint256 id) external view returns (address);
}

contract RNSIPFSRegistry is Ownable {
    string public defaultIpfsLink;
    mapping(string => string) private rnsLinks;
    RNSChecker public nftContract;

    constructor(string memory _defaultIpfsLink, address _nftContractAddress) Ownable(msg.sender) {
        defaultIpfsLink = _defaultIpfsLink;
        nftContract = RNSChecker(_nftContractAddress);
    }

    function updateRnsLink(string memory id, string memory ipfsLink) public {
        uint256 tokenId = uint256(keccak256(abi.encodePacked(id)));
        require(nftContract.getAddress(tokenId) == msg.sender, "Not the token owner");
        rnsLinks[id] = ipfsLink;
    }

    function getIpfsLink(string memory id) public view returns (string memory) {
        string memory link = rnsLinks[id];
        return bytes(link).length > 0 ? link : defaultIpfsLink;
    }

    function updateDefaultIpfsLink(string memory _newDefaultLink) public onlyOwner {
        defaultIpfsLink = _newDefaultLink;
    }
}
