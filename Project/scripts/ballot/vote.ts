// eslint-disable-next-line no-unused-vars
import { Contract, BigNumber, ethers } from "ethers";
import "dotenv/config";
import * as customBallotJson from "../../artifacts/contracts/CustomBallot.sol/CustomBallot.json";
// eslint-disable-next-line node/no-missing-import
import { CustomBallot } from "../../typechain";

// This key is already public on Herong's Tutorial Examples - v1.03, by Dr. Herong Yang
// Do never expose your keys like this
const EXPOSED_KEY =
  "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";

function setupProvider() {
  const infuraOptions = process.env.INFURA_API_KEY
    ? process.env.INFURA_API_SECRET
      ? {
          projectId: process.env.INFURA_API_KEY,
          projectSecret: process.env.INFURA_API_SECRET,
        }
      : process.env.INFURA_API_KEY
    : "";
  const options = {
    alchemy: process.env.ALCHEMY_API_KEY,
    infura: infuraOptions,
  };
  const provider = ethers.providers.getDefaultProvider("ropsten", options);
  return provider;
}

async function main() {
  const wallet =
    process.env.MNEMONIC && process.env.MNEMONIC.length > 0
      ? ethers.Wallet.fromMnemonic(process.env.MNEMONIC)
      : new ethers.Wallet(process.env.PRIVATE_KEY ?? EXPOSED_KEY);
  console.log(`Using address ${wallet.address}`);
  const provider = setupProvider();
  const signer = wallet.connect(provider);
  const balanceBN = await signer.getBalance();
  const balance = Number(ethers.utils.formatEther(balanceBN));
  console.log(`Wallet balance ${balance}`);
  if (balance < 0.01) {
    throw new Error("Not enough ether");
  }

  const ballotAddress = "0xb12352DA2BF4697e7b0A2D0A0256b11E2FcE6609"; // initial address
  // const ballotAddress = "0x28159A44155679c7b28eB310F5E2e2b556C02171";
  console.log(
    `Attaching ballot contract interface to address ${ballotAddress}`
  );
  const ballotContract: CustomBallot = new Contract(
    ballotAddress,
    customBallotJson.abi,
    signer
  ) as CustomBallot;

  // if (process.argv.length < 3) throw new Error("Please, enter amount to vote.");
  // if (process.argv.length < 4)
  //   throw new Error("Please, indicate prososal to vote.");

  // const votingAmount = BigNumber.from(process.argv[3]);
  // const proposalIndex = BigNumber.from(process.argv[4]);
  const votingAmount = 1;
  const proposalIndex = 1;

  console.log(`votingAmount:: ${votingAmount}`);
  console.log(`proposalIndex:: ${proposalIndex}`);

  const votingPowerAvailable = await ballotContract.votingPower();
  // await votingPowerAvailable.wait(1);
  console.log(`votingPowerAvailable:: ${votingPowerAvailable}`);

  // if (votingPowerAvailable >= votingAmount)
  if (votingPowerAvailable.gte(votingAmount))
    throw new Error("Has not enough voting power");

  const voteTx = await ballotContract.vote(proposalIndex, votingAmount);
  await voteTx.wait();
  const proposalVote = await ballotContract.proposals(proposalIndex);

  console.log(`Transaction completed. Hash: ${voteTx.hash}`);
  console.log(`vote completed for propsosal ${proposalVote}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
