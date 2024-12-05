// import ethers.js
// create main function

// execute main function

const { ethers } = require("hardhat");

async function main() {
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

  // init 2 accounts
  const [firstAccount, secondAccount] = await ethers.getSigners();

  // fund contract with first account
  const fundTx = await fundMe.fund({ value: ethers.parseEther("0.2") });
  await fundTx.wait();
  // check balance of contract
  const balanceOfContract = await ethers.provider.getBalance(fundMe.target);

  console.log(`Balance of the contract is ${balanceOfContract}`);
  // fund contract with second contract
  const fundTxWithSecondAccount = await fundMe
    .connect(secondAccount)
    .fund({ value: ethers.parseEther("0.2") });
  await fundTxWithSecondAccount.wait();
  // check balance of contract
  const balanceOfContractAfterSecondFund = await ethers.provider.getBalance(
    fundMe.target
  );
  console.log(`Balance of the contract is ${balanceOfContractAfterSecondFund}`);

  // check mapping fundersToAmount
  const firstAccountBalanceInFundMe = fundMe.fundersToAmount(
    firstAccount.address
  );
  const secondAccountBalanceInFundMe = fundMe.fundersToAmount(
    secondAccount.address
  );
  console.log(
    `Balance of first account ${firstAccount.address}is ${firstAccountBalanceInFundMe}`
  );
  console.log(
    `Balance of second account ${secondAccount.address}is ${secondAccountBalanceInFundMe}`
  );
}

async function verifyFundMe(fundMeAddr, args) {
  await hre.run("verify:verify", {
    address: fundMeAddr,
    constructorArguments: [args],
  });
}

main()
  .then()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
