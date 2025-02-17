import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const lock = await deploy("H2_Arrays", {
    from: deployer!,
    args: [],
    log: true,
  });

  console.log(`H2_Arrays contract: `, lock.address);
};
export default func;
func.id = "deploy_h2_arrays"; // id required to prevent re-execution
func.tags = ["H2_Arrays"];
