import { H2_Arrays$Type } from "@artifacts/contracts/H2_Arrays.sol/H2_Arrays";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { deployContract } from "@test/utils";
import { expect } from "chai";

const CONTRACT_NAME = "H2_Arrays";

describe(CONTRACT_NAME, function () {
  async function deployH2ArraysFixture() {
    return await deployContract<H2_Arrays$Type["contractName"], H2_Arrays$Type["abi"]>(CONTRACT_NAME);
  }

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      const { contract } = await loadFixture(deployH2ArraysFixture);
      expect(contract.address)
        .to.be.a("string")
        .and.satisfy((s: string) => s.startsWith("0x"));
    });
  });

  describe("addEntry", function () {
    it("Should add an entry successfully", async function () {
      const { contract } = await loadFixture(deployH2ArraysFixture);
      // @ts-expect-error ignore
      await contract.write.addEntry([BigInt(42)]);
      const entries = await contract.read.getEntries();
      expect(entries[0]).to.equal(42n);
    });
  });

  describe("getEntries", function () {
    it("Should return the correct entries", async function () {
      const { contract } = await loadFixture(deployH2ArraysFixture);
      // @ts-expect-error ignore
      await contract.write.addEntry([BigInt(42)]);
      // @ts-expect-error ignore
      await contract.write.addEntry([BigInt(24)]);
      const entries = await contract.read.getEntries();
      expect(entries).to.deep.equal([42n, 24n]);
    });
  });

  describe("removeEntryLeavingGaps", function () {
    it("Should remove an entry successfully", async function () {
      const { contract } = await loadFixture(deployH2ArraysFixture);
      // @ts-expect-error ignore
      await contract.write.addEntry([BigInt(42)]);
      // @ts-expect-error ignore
      await contract.write.addEntry([BigInt(24)]);
      // @ts-expect-error ignore
      await contract.write.removeEntryLeavingGaps([BigInt(0)]);
      const entries = await contract.read.getEntries();
      expect(entries[0]).to.equal(0n);
      expect(entries[1]).to.equal(24n);
    });

    it("Should revert when trying to remove an entry out of bounds", async function () {
      const { contract } = await loadFixture(deployH2ArraysFixture);
      // @ts-expect-error ignore
      await expect(contract.write.removeEntryLeavingGaps([BigInt(0)])).to.be.rejectedWith("invalid index");
    });
  });

  describe("removeEntryNoGaps", function () {
    it("Should remove an entry without leaving gaps", async function () {
      const { contract } = await loadFixture(deployH2ArraysFixture);
      // Add some entries
      // @ts-expect-error ignore
      await contract.write.addEntry([BigInt(10)]);
      // @ts-expect-error ignore
      await contract.write.addEntry([BigInt(20)]);
      // @ts-expect-error ignore
      await contract.write.addEntry([BigInt(30)]);
      // @ts-expect-error ignore
      await contract.write.addEntry([BigInt(40)]);
      // Remove the second entry (index 1)
      // @ts-expect-error ignore
      await contract.write.removeEntryNoGaps([BigInt(1)]);
      // Get the updated entries
      const updatedEntries = await contract.read.getEntries();
      // Check if the entry was removed and the array was compacted
      expect(updatedEntries).to.deep.equal([10n, 30n, 40n]);
    });

    it("Should revert when trying to remove an entry out of bounds", async function () {
      const { contract } = await loadFixture(deployH2ArraysFixture);
      // Try to remove an entry from an empty array
      // @ts-expect-error ignore
      await expect(contract.write.removeEntryNoGaps([BigInt(0)])).to.be.rejectedWith("invalid index");
      // Add one entry
      // @ts-expect-error ignore
      await contract.write.addEntry([BigInt(10)]);
      // Try to remove an entry at an invalid index
      // @ts-expect-error ignore
      await expect(contract.write.removeEntryNoGaps([BigInt(1)])).to.be.rejectedWith("invalid index");
    });
  });

  describe("removeEntryNoGapsGasOptimised", function () {
    it("Should remove an entry without leaving gaps (gas optimised)", async function () {
      const { contract } = await loadFixture(deployH2ArraysFixture);
      // Add some entries
      // @ts-expect-error ignore
      await contract.write.addEntry([BigInt(10)]);
      // @ts-expect-error ignore
      await contract.write.addEntry([BigInt(20)]);
      // @ts-expect-error ignore
      await contract.write.addEntry([BigInt(30)]);
      // @ts-expect-error ignore
      await contract.write.addEntry([BigInt(40)]);
      // Remove the second entry (index 1)
      // @ts-expect-error ignore
      await contract.write.removeEntryNoGapsGasOptimised([BigInt(1)]);
      // Get the updated entries
      const updatedEntries = await contract.read.getEntries();
      // Check if the entry was removed and the array was compacted
      expect(updatedEntries.length).to.equal(3);
      expect(updatedEntries).to.include.members([10n, 30n, 40n]);
      expect(updatedEntries).to.not.include(20n);
    });

    it("Should remove the last entry correctly", async function () {
      const { contract } = await loadFixture(deployH2ArraysFixture);
      // Add some entries
      // @ts-expect-error ignore
      await contract.write.addEntry([BigInt(10)]);
      // @ts-expect-error ignore
      await contract.write.addEntry([BigInt(20)]);
      // @ts-expect-error ignore
      await contract.write.addEntry([BigInt(30)]);
      // Remove the last entry (index 2)
      // @ts-expect-error ignore
      await contract.write.removeEntryNoGapsGasOptimised([BigInt(2)]);
      // Get the updated entries
      const updatedEntries = await contract.read.getEntries();
      // Check if the last entry was removed
      expect(updatedEntries).to.deep.equal([10n, 20n]);
    });

    it("Should revert when trying to remove an entry out of bounds", async function () {
      const { contract } = await loadFixture(deployH2ArraysFixture);
      // Try to remove an entry from an empty array
      // @ts-expect-error ignore
      await expect(contract.write.removeEntryNoGapsGasOptimised([BigInt(0)])).to.be.rejectedWith("no entries");
      // Add one entry
      // @ts-expect-error ignore
      await contract.write.addEntry([BigInt(10)]);
      // Try to remove an entry at an invalid index
      // @ts-expect-error ignore
      await expect(contract.write.removeEntryNoGapsGasOptimised([BigInt(1)])).to.be.rejectedWith("invalid index");
    });

    it("Should maintain array compactness after multiple removals", async function () {
      const { contract } = await loadFixture(deployH2ArraysFixture);
      // Add some entries
      // @ts-expect-error ignore
      await contract.write.addEntry([BigInt(10)]);
      // @ts-expect-error ignore
      await contract.write.addEntry([BigInt(20)]);
      // @ts-expect-error ignore
      await contract.write.addEntry([BigInt(30)]);
      // @ts-expect-error ignore
      await contract.write.addEntry([BigInt(40)]);
      // @ts-expect-error ignore
      await contract.write.addEntry([BigInt(50)]);
      // Remove multiple entries
      // @ts-expect-error ignore
      await contract.write.removeEntryNoGapsGasOptimised([BigInt(1)]);
      // @ts-expect-error ignore
      await contract.write.removeEntryNoGapsGasOptimised([BigInt(2)]);
      // Get the updated entries
      const updatedEntries = await contract.read.getEntries();
      // Check if the array is compact and has the correct length
      expect(updatedEntries.length).to.equal(3);
      expect(updatedEntries).to.include.members([10n, 40n, 50n]);
    });
  });

  describe("entries", function () {
    it("Should return the correct entry at a given index", async function () {
      const { contract } = await loadFixture(deployH2ArraysFixture);
      // @ts-expect-error ignore
      await contract.write.addEntry([BigInt(42)]);
      // @ts-expect-error ignore
      await contract.write.addEntry([BigInt(24)]);
      const entry = await contract.read.entries([BigInt(1)]);
      expect(entry).to.equal(24n);
    });
  });
});
