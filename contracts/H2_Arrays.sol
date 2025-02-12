// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;


contract H2_Arrays {

    uint256[] public entries;

    function getEntries() public view returns (uint256[] memory result) {
        return entries;
    }

    function addEntry(uint256 val) public {
        entries.push(val);
    }

    function removeEntry(uint256 _index) public returns (uint256[] memory result) {
        // Ensure index is within array bounds.
        require(_index >= 0 && _index < entries.length, "execution reverted");
        delete entries[_index];
        return entries;
    }
}
