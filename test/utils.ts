import hre from "hardhat";
import { Abi, GetContractReturnType, PublicClient, WalletClient } from "viem";

export const deployContract = async <CN extends string, abi extends Abi>(
  contractName: CN,
): Promise<{
  publicClient: PublicClient;
  deployer: WalletClient;
  addr1: WalletClient;
  addr2: WalletClient;
  contract: GetContractReturnType<abi, PublicClient>;
  // deployedContract: GetContractReturnType;
}> => {
  const publicClient = await hre.viem.getPublicClient();
  const [deployer, addr1, addr2] = await hre.viem.getWalletClients();
  const contract = (await hre.viem.deployContract(contractName)) as unknown as GetContractReturnType<abi, PublicClient>;
  // const deployedContract = await hre.viem.getContractAt(contractName, contract.address);
  return { publicClient, deployer: deployer!, addr1: addr1!, addr2: addr2!, contract };
};
