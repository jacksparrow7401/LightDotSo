// Copyright 2023-2024 Light, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

"use client";

import {
  useMutationUserOperationCreate,
  useMutationUserOperationCreateBatch,
  useQueryConfiguration,
} from "@lightdotso/query";
import { subdigestOf } from "@lightdotso/sequence";
import { useAuth, useFormRef, useUserOperations } from "@lightdotso/stores";
import {
  useAccount,
  useSignMessage,
  // lightWalletAbi,
  // lightWalletFactoryAbi,
  // useReadLightVerifyingPaymasterGetHash,
  // useReadLightVerifyingPaymasterSenderNonce,
} from "@lightdotso/wagmi";
import { MerkleTree } from "merkletreejs";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Address, Hex } from "viem";
import {
  isAddressEqual,
  toBytes,
  hexToBytes,
  keccak256,
  // fromHex,
  // decodeFunctionData,
} from "viem";
// import { useDebouncedValue } from "./useDebouncedValue";
import { useDelayedValue } from "./useDelayedValue";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type UserOperationCreateProps = {
  address: Address;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const useUserOperationCreate = ({
  address,
}: UserOperationCreateProps) => {
  // ---------------------------------------------------------------------------
  // Wagmi
  // ---------------------------------------------------------------------------

  const { isConnecting } = useAccount();

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { address: userAddress } = useAuth();
  const { setCustomFormSuccessText, setIsFormLoading } = useFormRef();
  const { internalUserOperations, addPendingSubmitUserOperationHash } =
    useUserOperations();

  // ---------------------------------------------------------------------------
  // State Hooks
  // ---------------------------------------------------------------------------

  const [merkleTree, setMerkleTree] = useState<MerkleTree | undefined>();
  const [signedData, setSignedData] = useState<Hex>();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { configuration } = useQueryConfiguration({
    address: address,
  });

  // ---------------------------------------------------------------------------
  // Query State Hooks
  // ---------------------------------------------------------------------------

  // const [, setInternalUserOperations] = useInternalUserOperationsQueryState();

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  // Get the delayed internalUserOperations value
  // const debouncedInternalUserOperations = useDebouncedValue(
  //   internalUserOperations,
  //   1000,
  // );

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  // Set the internalUserOperations state
  // useEffect(() => {
  //   setInternalUserOperations(debouncedInternalUserOperations);
  // }, [debouncedInternalUserOperations, setInternalUserOperations]);

  // ---------------------------------------------------------------------------
  // Local Variables
  // ---------------------------------------------------------------------------

  const subdigest = useMemo(() => {
    // If the userOperation length is 0, return
    if (internalUserOperations.length === 0) {
      return;
    }

    // If the userOperation length is 1, get the first userOperation
    const userOperation = internalUserOperations[0];

    // Check if the userOperation has hash and chainId
    if (!userOperation?.hash || !userOperation?.chainId) {
      return;
    }

    // Return the subdigest of the userOperation w/ hash and chainId encoded (type 1)
    if (internalUserOperations.length === 1) {
      return subdigestOf(
        address,
        hexToBytes(userOperation?.hash as Hex),
        userOperation?.chainId,
      );
    }

    // Check if all of the internalUserOperations have hash
    const isAllHashed = internalUserOperations.every(
      userOperation => userOperation.hash,
    );
    if (!isAllHashed) {
      return;
    }

    // If the userOperation length is greater than 1, get the merkle root of the internalUserOperations
    if (internalUserOperations.length > 1) {
      // Get the leaves of the merkle tree
      const leaves = internalUserOperations
        .map(userOperation => hexToBytes(userOperation.hash as Hex))
        .sort(Buffer.compare);

      // If the number of leaves is not 2, add a leaf w/ 0
      // if (leaves.length % 2 !== 0) {
      //   leaves.push(new Uint8Array(32));
      // }

      // Create a merkle tree from the leaves, with sort option enabled
      const tree = new MerkleTree(leaves, keccak256, { sort: true });

      setMerkleTree(tree);

      return subdigestOf(address, tree.getRoot(), BigInt(0));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // Solely dependent on internalUserOperations for the subdigest
    internalUserOperations,
  ]);

  // ---------------------------------------------------------------------------
  // Wagmi
  // ---------------------------------------------------------------------------

  // Sign the message of the subdigest
  const { data, signMessage, isPending: isSignLoading } = useSignMessage();

  // const { data: paymasterNonce } = useReadLightVerifyingPaymasterSenderNonce({
  //   address: userOperation.paymasterAndData.slice(0, 42) as Address,
  //   chainId: Number(userOperation.chainId),
  //   args: [userOperation.sender as Address],
  // });

  // const { data: paymasterHash } = useReadLightVerifyingPaymasterGetHash({
  //   address: userOperation.paymasterAndData.slice(0, 42) as Address,
  //   chainId: Number(userOperation.chainId),
  //   args: [
  //     {
  //       sender: userOperation.sender as Address,
  //       nonce: userOperation.nonce,
  //       initCode: userOperation.initCode as Hex,
  //       callData: userOperation.callData as Hex,
  //       callGasLimit: userOperation.callGasLimit,
  //       verificationGasLimit: userOperation.verificationGasLimit,
  //       preVerificationGas: userOperation.preVerificationGas,
  //       maxFeePerGas: userOperation.maxFeePerGas,
  //       maxPriorityFeePerGas: userOperation.maxPriorityFeePerGas,
  //       paymasterAndData: userOperation.paymasterAndData as Hex,
  //       signature: toHex(new Uint8Array([2])),
  //     },
  //     fromHex(`0x${userOperation.paymasterAndData.slice(154, 162)}`, "number"),
  //     fromHex(`0x${userOperation.paymasterAndData.slice(162, 170)}`, "number"),
  //   ],
  // });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  // Get the owner of the userOperation from the configuration
  // Should default to lastest configuration
  const owner = useMemo(() => {
    if (!userAddress) {
      return;
    }

    return configuration?.owners?.find(owner =>
      isAddressEqual(owner.address as Address, userAddress),
    );
  }, [configuration?.owners, userAddress]);

  // const decodedInitCode = useMemo(() => {
  //   // If the initCode is `0x`, return
  //   if (
  //     !userOperation?.callData ||
  //     !userOperation?.initCode ||
  //     userOperation?.initCode === "0x"
  //   ) {
  //     return;
  //   }

  //   // Parse the initCode of the userOperation
  //   return decodeFunctionData({
  //     abi: lightWalletFactoryAbi,
  //     data: `0x${userOperation?.initCode.slice(42)}` as Hex,
  //   }).args;
  // }, [userOperation?.initCode, userOperation?.callData]);

  // const decodedCallData = useMemo(() => {
  //   // If the callData is `0x`, return
  //   if (!userOperation?.callData || userOperation?.callData === "0x") {
  //     return;
  //   }

  //   // Parse the callData of tha args depending on the args type
  //   switch (userOperation?.callData.slice(0, 10)) {
  //     // If the function selector is `execute` or `executeBatch`
  //     case "0xb61d27f6":
  //     case "0x47e1da2a":
  //       return decodeFunctionData({
  //         abi: lightWalletAbi,
  //         data: userOperation?.callData as Hex,
  //       }).args;
  //     default:
  //       return userOperation?.callData;
  //   }
  // }, [userOperation?.callData]);

  // ---------------------------------------------------------------------------
  // Callback Hooks
  // ---------------------------------------------------------------------------

  // Sign the userOperation
  const signUserOperation = useCallback(() => {
    console.info(subdigest);

    if (!subdigest) {
      return;
    }

    signMessage({ message: { raw: toBytes(subdigest) } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subdigest]);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const {
    userOperationCreate,
    isUserOperactionCreateLoading,
    isUserOperactionCreateSuccess,
  } = useMutationUserOperationCreate({
    address: address,
  });

  const {
    userOperationCreateBatch,
    isUserOperactionCreateBatchLoading,
    isUserOperactionCreateBatchSuccess,
  } = useMutationUserOperationCreateBatch({
    address: address,
  });

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  // Sync the signed data
  useEffect(() => {
    if (!data) {
      return;
    }

    setSignedData(data);
  }, [data]);

  // Create the userOperation (single or batch)
  useEffect(() => {
    // Create a single user operation
    const createUserOp = async () => {
      if (!owner || !signedData || !internalUserOperation) {
        return;
      }

      console.info("sign...");
      console.info(signedData);

      userOperationCreate({
        ownerId: owner.id,
        signedData: signedData as Hex,
        userOperation: internalUserOperation,
      });

      addPendingSubmitUserOperationHash(internalUserOperation.hash as Hex);

      setSignedData(undefined);
    };

    // Create a batch of user operations
    const createUserOpBatch = async () => {
      if (!owner || !signedData || !merkleTree || !internalUserOperations) {
        return;
      }

      console.info("signBatch...");
      console.info(merkleTree);
      console.info(`0x${merkleTree.getRoot().toString("hex")}` as Hex);

      userOperationCreateBatch({
        ownerId: owner.id,
        signedData: signedData as Hex,
        userOperations: internalUserOperations,
        merkleRoot: `0x${merkleTree.getRoot().toString("hex")}` as Hex,
      });

      for (const userOperation of internalUserOperations) {
        addPendingSubmitUserOperationHash(userOperation.hash as Hex);
      }

      setSignedData(undefined);
    };

    // If the internalUserOperations length is 0, return
    if (internalUserOperations.length === 0) {
      return;
    }

    // If the internalUserOperations length is 1, get the first userOperation
    const internalUserOperation = internalUserOperations[0];
    if (internalUserOperations.length === 1) {
      createUserOp();
      return;
    }

    // If the internalUserOperations length is greater than 1
    if (internalUserOperations.length > 1) {
      createUserOpBatch();
      return;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    signedData,
    owner,
    internalUserOperations,
    configuration?.threshold,
    address,
  ]);

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  // Check if the internalUserOperations are valid
  // Should be all defined and not undefined for all required fields
  const isValidUserOperations = useMemo(() => {
    return (
      internalUserOperations &&
      internalUserOperations.length > 0 &&
      internalUserOperations.every(userOperation => {
        return !!(
          typeof owner !== "undefined" &&
          userOperation &&
          userOperation.chainId &&
          userOperation.hash &&
          userOperation.nonce &&
          userOperation.initCode &&
          userOperation.sender &&
          userOperation.callData &&
          userOperation.callGasLimit &&
          userOperation.verificationGasLimit &&
          userOperation.preVerificationGas &&
          userOperation.maxFeePerGas &&
          userOperation.maxPriorityFeePerGas &&
          userOperation.paymasterAndData
        );
      })
    );
  }, [owner, internalUserOperations]);

  // Check if the current subdigest is equal to the merkle tree root if the internalUserOperations length is greater than 1
  const isUserOperationMerkleEqual = useMemo(() => {
    if (internalUserOperations.length > 1) {
      return (
        typeof merkleTree !== "undefined" &&
        subdigest === subdigestOf(address, merkleTree.getRoot(), BigInt(0))
      );
    }

    return true;
  }, [address, internalUserOperations.length, merkleTree, subdigest]);

  // Check if the userOperation is submittable under the current owner signature
  // The configuration threshold should be defined and the owner weight should be greater than or equal to the threshold
  const isUserOperationCreateSubmittable = useMemo(() => {
    return (
      typeof configuration?.threshold !== "undefined" &&
      typeof owner !== "undefined" &&
      configuration?.threshold <= owner?.weight
    );
  }, [owner, configuration?.threshold]);

  // Check if the userOperation is createable
  const isUserOperationCreateable = useMemo(() => {
    return typeof owner !== "undefined" && typeof subdigest !== "undefined";
  }, [owner, subdigest]);

  // Check if the userOperation is loading
  const isUserOperationCreateLoading = useMemo(() => {
    return (
      isSignLoading ||
      isUserOperactionCreateLoading ||
      isUserOperactionCreateBatchLoading
    );
  }, [
    isSignLoading,
    isUserOperactionCreateLoading,
    isUserOperactionCreateBatchLoading,
  ]);

  // Check if the userOperation is success
  const isUserOperationCreateSuccess = useMemo(() => {
    return isUserOperactionCreateSuccess || isUserOperactionCreateBatchSuccess;
  }, [isUserOperactionCreateSuccess, isUserOperactionCreateBatchSuccess]);

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  // Get the delayed success value
  const delayedIsSuccess = useDelayedValue<boolean>(
    isUserOperationCreateSuccess,
    false,
    3000,
  );

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const formStateText = useMemo(() => {
    if (!address) {
      return "Connect Wallet";
    }

    if (isConnecting) {
      return "Connecting...";
    }

    if (isSignLoading) {
      return "Signing...";
    }

    if (isUserOperactionCreateLoading) {
      return "Creating transaction...";
    }

    if (isUserOperactionCreateBatchLoading) {
      return "Creating transactions...";
    }

    if (delayedIsSuccess) {
      return "Success";
    }

    return "Sign";
  }, [
    address,
    isConnecting,
    isSignLoading,
    isUserOperactionCreateLoading,
    isUserOperactionCreateBatchLoading,
    delayedIsSuccess,
  ]);

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  // Set the custom form success text
  useEffect(() => {
    if (!formStateText) {
      return;
    }
    setCustomFormSuccessText(formStateText);
  }, [formStateText, setCustomFormSuccessText]);

  // Set the form loading state to true if the status is success
  useEffect(() => {
    if (isUserOperationCreateSuccess) {
      setIsFormLoading(isUserOperactionCreateLoading);
    }
  }, [
    isUserOperationCreateSuccess,
    isUserOperactionCreateLoading,
    setIsFormLoading,
  ]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return {
    isUserOperationCreateable,
    isUserOperationMerkleEqual,
    isUserOperationCreateLoading,
    isUserOperationCreateSubmittable,
    isUserOperationCreateSuccess,
    isValidUserOperations,
    // decodedCallData,
    // decodedInitCode,
    // paymasterHash,
    // paymasterNonce,
    signUserOperation,
    subdigest,
    owner,
    threshold: configuration?.threshold,
  };
};
