import { ethers } from "ethers";

export const fromWeiToEth = (weiValue: string | undefined) => {
  try {
    if (!weiValue) return "0";

    const ethValue = ethers.formatEther(weiValue);
    return ethValue;
  } catch (error) {
    console.error("Error converting WEI to ETH:", error);
    return "0";
  }
};
