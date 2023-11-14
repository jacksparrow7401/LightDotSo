// Copyright (C) 2023 Light, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

import { inngest } from "@/inngest/client";
import { NonRetriableError } from "inngest";
import type { Chain } from "@covalenthq/client-sdk";

export const ChainIdMapping: Record<number, Chain> = {
  1: "eth-mainnet",
  10: "optimism-mainnet",
  100: "gnosis-mainnet",
  137: "matic-mainnet",
  8453: "base-mainnet",
};

export const walletPortfolioInvoke = inngest.createFunction(
  {
    id: "wallet-portfolio-invoke",
    rateLimit: {
      key: "event.data.address",
      limit: 1,
      period: "3m",
    },
  },
  { event: "wallet/portfolio.invoke" },
  async ({ event, step, prisma }) => {
    const wallet = await step.run("Find wallet in db", async () => {
      const data = prisma.wallet.findUnique({
        where: {
          address: event.data.address,
        },
      });

      if (!data) {
        throw new NonRetriableError("Wallet not found", {
          cause: new Error("no wallet exists"),
        });
      }

      return data;
    });

    // For each chainId in the `ChainIdMapping`, send an `wallet/portfolio.covalent.set` event.
    // with the array of chainIds.
    const chainIds = Object.keys(ChainIdMapping).map(chainId => {
      return parseInt(chainId);
    });
    await step.sendEvent("Set the portfolio", {
      name: "wallet/portfolio.covalent.set",
      data: {
        address: wallet!.address,
        chainIds,
      },
    });

    // Update the llama portfolio
    await step.sendEvent("Update the portfolio ", {
      name: "wallet/portfolio.llama.update",
      data: {
        address: wallet!.address,
        service_id: event.ts!.toString(),
      },
    });

    // Set the llama portfolio
    await step.sendEvent("Set the portfolio", {
      name: "wallet/portfolio.llama.set",
      data: {
        address: wallet!.address,
        service_id: event.name,
      },
    });
  },
);
