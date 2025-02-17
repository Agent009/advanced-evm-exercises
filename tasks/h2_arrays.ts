import { H2_Arrays$Type } from "@artifacts/contracts/H2_Arrays.sol/H2_Arrays";
import { abi } from "@artifacts/contracts/H2_Arrays.sol/H2_Arrays.json";
import { scope } from "hardhat/config";
import type { HardhatRuntimeEnvironment, TaskArguments } from "hardhat/types";
import { Address, GetContractReturnType, PublicClient, WalletClient, getAddress } from "viem";

const CONTRACT_NAME = "H2_Arrays";
const taskScope = scope(CONTRACT_NAME);

const getContract = async (
  hre: HardhatRuntimeEnvironment,
  address: Address,
  walletClient: WalletClient,
): Promise<GetContractReturnType<H2_Arrays$Type["abi"], { public: PublicClient; wallet: WalletClient }>> => {
  const publicClient = await hre.viem.getPublicClient();
  // @ts-expect-error ignore
  return hre.viem.getContractAt(CONTRACT_NAME, address, {
    client: {
      public: publicClient,
      wallet: walletClient,
    },
  }) as unknown as GetContractReturnType<H2_Arrays$Type["abi"], { public: PublicClient; wallet: WalletClient }>;
};

taskScope
  .task("addEntry", "Add entry")
  .addParam("val", "Entry to add")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { viem, deployments } = hre;
    const contract = taskArguments.address
      ? { address: getAddress(taskArguments.address) }
      : await deployments.get(CONTRACT_NAME);
    const [signer] = await viem.getWalletClients();
    const val = BigInt(taskArguments.val);
    const contractAddress = contract.address;
    const consolePrefix = "tasks > h2_arrays > addEntry";
    console.log(`${consolePrefix} > adding ${val} entry to contract at ${contractAddress}...`);
    const publicClient = await hre.viem.getPublicClient();
    const deployedContract = await getContract(hre, contractAddress as Address, signer!);
    const { request } = await publicClient.simulateContract({
      account: signer as unknown as Address,
      address: contractAddress as unknown as Address,
      abi,
      functionName: "addEntry",
      args: [val],
    });
    const hash = await signer!.writeContract(request);
    console.log(`${consolePrefix} > hash`, hash, "waiting for confirmations...");
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log(`${consolePrefix} > transaction confirmed -> receipt`, receipt.blockNumber);
    const entries = await deployedContract.read.getEntries();
    console.log(`${consolePrefix} > entries`, entries);
  });

taskScope
  .task("removeEntryNoGapsGasOptimised", "Optimized version to remove an entry without leaving gaps")
  .addParam("index", "Specify index of the entry to remove")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { viem, deployments } = hre;
    const contract = taskArguments.address
      ? { address: getAddress(taskArguments.address) }
      : await deployments.get(CONTRACT_NAME);
    const [signer] = await viem.getWalletClients();
    const index = BigInt(taskArguments.index);
    const contractAddress = contract.address;
    const consolePrefix = "tasks > h2_arrays > removeEntryNoGapsGasOptimised";
    console.log(`${consolePrefix} > removing entry at index ${index} from contract at ${contractAddress}...`);
    const publicClient = await hre.viem.getPublicClient();
    const deployedContract = await getContract(hre, contractAddress as Address, signer!);
    const { request } = await publicClient.simulateContract({
      account: signer as unknown as Address,
      address: contractAddress as unknown as Address,
      abi,
      functionName: "removeEntryNoGapsGasOptimised",
      args: [index],
    });
    const hash = await signer!.writeContract(request);
    console.log(`${consolePrefix} > hash`, hash, "waiting for confirmations...");
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log(`${consolePrefix} > transaction confirmed -> receipt`, receipt.blockNumber);
    const entries = await deployedContract.read.getEntries();
    console.log(`${consolePrefix} > entries after removal`, entries);
  });

taskScope
  .task("deploy", `Deploys ${CONTRACT_NAME} Contract`)
  // @ts-expect-error ignore
  .setAction(async function (taskArguments: TaskArguments, { viem }) {
    const [signer] = await viem.getWalletClients();
    const consolePrefix = "tasks > h2_arrays > deploy";
    const contract = await viem.deployContract(CONTRACT_NAME);
    console.log(`${consolePrefix} > ${CONTRACT_NAME} deployed to`, contract.address, "by", signer!.account.address);
  });
