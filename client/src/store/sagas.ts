import {
  BrowserProvider,
  JsonRpcProvider,
  Signer,
  Transaction,
  TransactionReceipt,
  TransactionResponse,
} from "ethers";
import { takeEvery } from "redux-saga/effects";

import apolloClient from "../apollo/client";
import { navigate } from "../components/NaiveRouter";
import { SaveTransaction } from "../queries";
import { Actions, SendTransactionAction } from "../types";

function* sendTransaction({ payload }: SendTransactionAction) {
  const provider = new JsonRpcProvider("http://localhost:8545");

  const walletProvider = new BrowserProvider(window.web3.currentProvider);

  const signer: Signer = yield walletProvider.getSigner();

  const accounts: Array<{ address: string }> = yield provider.listAccounts();

  const randomAddress = () => {
    const min = 1;
    const max = 19;
    const random = Math.round(Math.random() * (max - min) + min);
    return accounts[random].address;
  };

  const randomValue = () => {
    const min = 1;
    const max = 100;
    return Math.round(Math.random() * (max - min) + min);
  };

  const transaction = {
    to: payload.to || randomAddress(),
    value: payload.value || randomValue(),
  };

  try {
    const txResponse: TransactionResponse = yield signer.sendTransaction(
      transaction
    );

    const response: TransactionReceipt = yield txResponse.wait();

    const receipt: Transaction = yield response.getTransaction();

    const variables = {
      transaction: {
        gasLimit: (receipt.gasLimit && receipt.gasLimit.toString()) || "0",
        gasPrice: (receipt.gasPrice && receipt.gasPrice.toString()) || "0",
        to: receipt.to,
        from: receipt.from,
        value: (receipt.value && receipt.value.toString()) || "",
        data: receipt.data || null,
        chainId: (receipt.chainId && receipt.chainId.toString()) || "123456",
        hash: receipt.hash,
      },
    };

    yield apolloClient.mutate({
      mutation: SaveTransaction,
      variables,
    });

    navigate(`/transaction/${receipt.hash}`);
  } catch (error) {
    console.log(error);
  }
}

export function* rootSaga() {
  yield takeEvery(Actions.SendTransaction, sendTransaction);
}
