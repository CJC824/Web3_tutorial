const { task } = require("hardhat/config");

task("deploy-fundme","deploy and verify fundme contract").setAction(async (taskArgs, hre) => {
  // create factory
  const fundMeFactory = await ethers.getContractFactory("FundMe");

  const LOCK_TIME = 300;

  console.log("contract deploying");
  // deploy contract from factory
  const fundMe = await fundMeFactory.deploy(LOCK_TIME);
  await fundMe.waitForDeployment();

  console.log(
    "contract has been deployed successfully,contract address is" +
      fundMe.target
  );

  // verify fundMe
  if (
    hre.network.config.chainId === 11155111 &&
    process.env.ETHERSCAN_API_KEY
  ) {
    console.log("Waiting for 5 confirmations");
    await fundMe.deploymentTransaction().wait(5);
    await verifyFundMe(fundMe.target, LOCK_TIME);
  } else {
    console.log("verification skipped..");
  }
});

async function verifyFundMe(fundMeAddr, args) {
  await hre.run("verify:verify", {
    address: fundMeAddr,
    constructorArguments: [args],
  });
}

module.exports = {};
