// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title CampusFind - A decentralized university lost-and-found board
/// @notice Students can report lost/found items and mark them as claimed
contract CampusFind {

    // 0 = Lost, 1 = Found
    enum ItemType { Lost, Found }

    struct Item {
        uint256 id;
        string name;
        string description;
        string location;
        ItemType itemType;
        address reporter;
        uint256 timestamp;
        bool claimed;
    }

    // All reported items. An item's ID is its position in this list (starting at 0).
    Item[] private items;

    event ItemReported(
        uint256 indexed id,
        address indexed reporter,
        string name,
        ItemType itemType
    );

    event ItemClaimed(uint256 indexed id, address indexed reporter);

    /// @notice Submit a lost or found item
    function reportItem(
        string memory _name,
        string memory _description,
        string memory _location,
        ItemType _itemType
    ) public {
        require(bytes(_name).length > 0, "CampusFind: Item name cannot be empty");
        require(bytes(_name).length <= 100, "CampusFind: Item name too long (max 100 characters)");
        require(bytes(_description).length > 0, "CampusFind: Description cannot be empty");
        require(bytes(_description).length <= 500, "CampusFind: Description too long (max 500 characters)");
        require(bytes(_location).length > 0, "CampusFind: Location cannot be empty");
        require(bytes(_location).length <= 100, "CampusFind: Location too long (max 100 characters)");

        uint256 newId = items.length;

        items.push(
            Item({
                id: newId,
                name: _name,
                description: _description,
                location: _location,
                itemType: _itemType,
                reporter: msg.sender,
                timestamp: block.timestamp,
                claimed: false
            })
        );

        emit ItemReported(newId, msg.sender, _name, _itemType);
    }

    /// @notice Retrieve the details of a particular item
    function getItem(uint256 _id) public view returns (Item memory) {
        require(_id < items.length, "CampusFind: Item does not exist");
        return items[_id];
    }

    /// @notice Total number of items ever reported
    function getItemCount() public view returns (uint256) {
        return items.length;
    }

    /// @notice Mark an item as claimed.
    /// @dev Access control: only the wallet that originally reported the
    ///      item may mark it as claimed, and it can only happen once.
    function claimItem(uint256 _id) public {
        require(_id < items.length, "CampusFind: Item does not exist");

        Item storage item = items[_id];

        require(msg.sender == item.reporter, "CampusFind: Only the original reporter can claim this item");
        require(!item.claimed, "CampusFind: Item is already claimed");

        item.claimed = true;

        emit ItemClaimed(_id, msg.sender);
    }
}
