import {expect} from "chai";
import {loadFixture} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import hre from "hardhat";

describe("H2_Arrays", function () {
  async function deployH2ArraysFixture() {
    const [owner, addr1, addr2] = await hre.viem.getWalletClients();

    const h2Arrays = await hre.viem.deployContract("H2_Arrays");
    const h2ArraysContract = await hre.viem.getContractAt("H2_Arrays", h2Arrays.address);

    return {h2ArraysContract, owner, addr1, addr2};
  }

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      const {h2ArraysContract} = await loadFixture(deployH2ArraysFixture);
      expect(h2ArraysContract.address).to.be.a('string').and.satisfy((s: string) => s.startsWith('0x'));
    });
  });

  describe("addEntry", function () {
    it("Should add an entry successfully", async function () {
      const {h2ArraysContract} = await loadFixture(deployH2ArraysFixture);
      await h2ArraysContract.write.addEntry([BigInt(42)]);
      const entries = await h2ArraysContract.read.getEntries();
      expect(entries[0]).to.equal(42n);
    });
  });

  describe("getEntries", function () {
    it("Should return the correct entries", async function () {
      const {h2ArraysContract} = await loadFixture(deployH2ArraysFixture);
      await h2ArraysContract.write.addEntry([BigInt(42)]);
      await h2ArraysContract.write.addEntry([BigInt(24)]);
      const entries = await h2ArraysContract.read.getEntries();
      expect(entries).to.deep.equal([42n, 24n]);
    });
  });

  describe("removeEntryLeavingGaps", function () {
    it("Should remove an entry successfully", async function () {
      const {h2ArraysContract} = await loadFixture(deployH2ArraysFixture);
      await h2ArraysContract.write.addEntry([BigInt(42)]);
      await h2ArraysContract.write.addEntry([BigInt(24)]);
      await h2ArraysContract.write.removeEntryLeavingGaps([BigInt(0)]);
      const entries = await h2ArraysContract.read.getEntries();
      expect(entries[0]).to.equal(0n);
      expect(entries[1]).to.equal(24n);
    });

    it("Should revert when trying to remove an entry out of bounds", async function () {
      const {h2ArraysContract} = await loadFixture(deployH2ArraysFixture);
      await expect(h2ArraysContract.write.removeEntryLeavingGaps([BigInt(0)])).to.be.rejectedWith("invalid index");
    });
  });

  describe("removeEntryNoGaps", function () {
    it("Should remove an entry without leaving gaps", async function () {
      const {h2ArraysContract} = await loadFixture(deployH2ArraysFixture);
      // Add some entries
      await h2ArraysContract.write.addEntry([BigInt(10)]);
      await h2ArraysContract.write.addEntry([BigInt(20)]);
      await h2ArraysContract.write.addEntry([BigInt(30)]);
      await h2ArraysContract.write.addEntry([BigInt(40)]);
      // Remove the second entry (index 1)
      await h2ArraysContract.write.removeEntryNoGaps([BigInt(1)]);
      // Get the updated entries
      const updatedEntries = await h2ArraysContract.read.getEntries();
      // Check if the entry was removed and the array was compacted
      expect(updatedEntries).to.deep.equal([10n, 30n, 40n]);
    });

    it("Should revert when trying to remove an entry out of bounds", async function () {
      const {h2ArraysContract} = await loadFixture(deployH2ArraysFixture);
      // Try to remove an entry from an empty array
      await expect(h2ArraysContract.write.removeEntryNoGaps([BigInt(0)]))
        .to.be.rejectedWith("invalid index");
      // Add one entry
      await h2ArraysContract.write.addEntry([BigInt(10)]);
      // Try to remove an entry at an invalid index
      await expect(h2ArraysContract.write.removeEntryNoGaps([BigInt(1)]))
        .to.be.rejectedWith("invalid index");
    });
  });

  describe("removeEntryNoGapsGasOptimised", function () {
    it("Should remove an entry without leaving gaps (gas optimised)", async function () {
      const { h2ArraysContract } = await loadFixture(deployH2ArraysFixture);
      // Add some entries
      await h2ArraysContract.write.addEntry([BigInt(10)]);
      await h2ArraysContract.write.addEntry([BigInt(20)]);
      await h2ArraysContract.write.addEntry([BigInt(30)]);
      await h2ArraysContract.write.addEntry([BigInt(40)]);
      // Remove the second entry (index 1)
      await h2ArraysContract.write.removeEntryNoGapsGasOptimised([BigInt(1)]);
      // Get the updated entries
      const updatedEntries = await h2ArraysContract.read.getEntries();
      // Check if the entry was removed and the array was compacted
      expect(updatedEntries.length).to.equal(3);
      expect(updatedEntries).to.include.members([10n, 30n, 40n]);
      expect(updatedEntries).to.not.include(20n);
    });

    it("Should remove the last entry correctly", async function () {
      const { h2ArraysContract } = await loadFixture(deployH2ArraysFixture);
      // Add some entries
      await h2ArraysContract.write.addEntry([BigInt(10)]);
      await h2ArraysContract.write.addEntry([BigInt(20)]);
      await h2ArraysContract.write.addEntry([BigInt(30)]);
      // Remove the last entry (index 2)
      await h2ArraysContract.write.removeEntryNoGapsGasOptimised([BigInt(2)]);
      // Get the updated entries
      const updatedEntries = await h2ArraysContract.read.getEntries();
      // Check if the last entry was removed
      expect(updatedEntries).to.deep.equal([10n, 20n]);
    });

    it("Should revert when trying to remove an entry out of bounds", async function () {
      const { h2ArraysContract } = await loadFixture(deployH2ArraysFixture);
      // Try to remove an entry from an empty array
      await expect(h2ArraysContract.write.removeEntryNoGapsGasOptimised([BigInt(0)]))
        .to.be.rejectedWith("no entries");
      // Add one entry
      await h2ArraysContract.write.addEntry([BigInt(10)]);
      // Try to remove an entry at an invalid index
      await expect(h2ArraysContract.write.removeEntryNoGapsGasOptimised([BigInt(1)]))
        .to.be.rejectedWith("invalid index");
    });

    it("Should maintain array compactness after multiple removals", async function () {
      const { h2ArraysContract } = await loadFixture(deployH2ArraysFixture);
      // Add some entries
      await h2ArraysContract.write.addEntry([BigInt(10)]);
      await h2ArraysContract.write.addEntry([BigInt(20)]);
      await h2ArraysContract.write.addEntry([BigInt(30)]);
      await h2ArraysContract.write.addEntry([BigInt(40)]);
      await h2ArraysContract.write.addEntry([BigInt(50)]);
      // Remove multiple entries
      await h2ArraysContract.write.removeEntryNoGapsGasOptimised([BigInt(1)]);
      await h2ArraysContract.write.removeEntryNoGapsGasOptimised([BigInt(2)]);
      // Get the updated entries
      const updatedEntries = await h2ArraysContract.read.getEntries();
      // Check if the array is compact and has the correct length
      expect(updatedEntries.length).to.equal(3);
      expect(updatedEntries).to.include.members([10n, 40n, 50n]);
    });
  });

  describe("entries", function () {
    it("Should return the correct entry at a given index", async function () {
      const {h2ArraysContract} = await loadFixture(deployH2ArraysFixture);
      await h2ArraysContract.write.addEntry([BigInt(42)]);
      await h2ArraysContract.write.addEntry([BigInt(24)]);
      const entry = await h2ArraysContract.read.entries([BigInt(1)]);
      expect(entry).to.equal(24n);
    });
  });
});