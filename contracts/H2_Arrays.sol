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

    function removeEntryLeavingGaps(uint256 _index) public returns (uint256[] memory) {
        // Ensure index is within array bounds. uint256 is always non-negative.
        require(_index < entries.length, "invalid index");
        delete entries[_index];
        return entries;
    }

    /// @notice This is more gas-expensive than removeEntryLeavingGaps, especially for large arrays, but it keeps the
    /// array compact without any gaps.
    function removeEntryNoGaps(uint256 _index) public returns (uint256[] memory) {
        // Ensure index is within array bounds.
        require(_index < entries.length, "invalid index");

        // Shift elements to fill the gap
        // Shift all elements after the removed index one position to the left.
        // Iterate from the _index to the second-to-last element of the array, moving each element one position to the left.
        for (uint256 i = _index; i < entries.length - 1; i++) {
            entries[i] = entries[i + 1];
        }

        // Remove the last element which is now a duplicate of the second-to-last element.
        entries.pop();

        return entries;
    }

    /// @notice Optimized version to remove an entry without leaving gaps
    /// @dev This function is more gas-efficient, especially for large arrays
    /// @dev The trade-off is that this method doesn't preserve the original order of elements in the array.
    function removeEntryNoGapsGasOptimised(uint256 _index) public returns (uint256[] memory) {
        require(entries.length > 0, "no entries");
        // Avoid multiple array length computations.
        uint256 lastIndex = entries.length - 1;
        // We now use <= instead of <, allowing removal of the last element without a separate check.
        require(_index <= lastIndex, "invalid index");

        // Instead of shifting all elements after the removed index, we simply move the last element to the position of
        // the removed element (if it's not the last element).
        if (_index < lastIndex) {
            // Move the last element to the position of the element to be removed
            entries[_index] = entries[lastIndex];
        }

        // Remove the last element whether it was the one to be removed or it was moved to replace another.
        entries.pop();

        return entries;
    }
}
