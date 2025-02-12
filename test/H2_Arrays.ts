import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import hre from "hardhat";

describe("H2_Arrays", function () {
  async function deployH2ArraysFixture() {
    const [owner, addr1, addr2] = await hre.viem.getWalletClients();

    const h2Arrays = await hre.viem.deployContract("H2_Arrays");
    const h2ArraysContract = await hre.viem.getContractAt("H2_Arrays", h2Arrays.address);

    return { h2ArraysContract, owner, addr1, addr2 };
  }

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      const { h2ArraysContract } = await loadFixture(deployH2ArraysFixture);
      expect(h2ArraysContract.address).to.be.a('string').and.satisfy(s => s.startsWith('0x'));
    });
  });

  describe("addEntry", function () {
    it("Should add an entry successfully", async function () {
      const { h2ArraysContract } = await loadFixture(deployH2ArraysFixture);
      await h2ArraysContract.write.addEntry([BigInt(42)]);
      const entries = await h2ArraysContract.read.getEntries();
      expect(entries[0]).to.equal(42n);
    });
  });

  describe("getEntries", function () {
    it("Should return the correct entries", async function () {
      const { h2ArraysContract } = await loadFixture(deployH2ArraysFixture);
      await h2ArraysContract.write.addEntry([BigInt(42)]);
      await h2ArraysContract.write.addEntry([BigInt(24)]);
      const entries = await h2ArraysContract.read.getEntries();
      expect(entries).to.deep.equal([42n, 24n]);
    });
  });

  describe("removeEntry", function () {
    it("Should remove an entry successfully", async function () {
      const { h2ArraysContract } = await loadFixture(deployH2ArraysFixture);
      await h2ArraysContract.write.addEntry([BigInt(42)]);
      await h2ArraysContract.write.addEntry([BigInt(24)]);
      await h2ArraysContract.write.removeEntry([BigInt(0)]);
      const entries = await h2ArraysContract.read.getEntries();
      expect(entries[0]).to.equal(0n);
      expect(entries[1]).to.equal(24n);
    });

    it("Should revert when trying to remove an entry out of bounds", async function () {
      const { h2ArraysContract } = await loadFixture(deployH2ArraysFixture);
      await expect(h2ArraysContract.write.removeEntry([BigInt(0)])).to.be.rejectedWith("execution reverted");
    });
  });

  describe("entries", function () {
    it("Should return the correct entry at a given index", async function () {
      const { h2ArraysContract } = await loadFixture(deployH2ArraysFixture);
      await h2ArraysContract.write.addEntry([BigInt(42)]);
      await h2ArraysContract.write.addEntry([BigInt(24)]);
      const entry = await h2ArraysContract.read.entries([BigInt(1)]);
      expect(entry).to.equal(24n);
    });
  });
});