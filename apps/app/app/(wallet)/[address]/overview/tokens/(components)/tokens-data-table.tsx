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

"use client";

import type { WalletSettingsData } from "@lightdotso/data";
import { useQueryTokens, useQueryTokensCount } from "@lightdotso/query";
import { queryKeys } from "@lightdotso/query-keys";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, type FC } from "react";
import type { Address } from "viem";
import { columns } from "@/app/(wallet)/[address]/overview/tokens/(components)/data-table/columns";
import { DataTable } from "@/app/(wallet)/[address]/overview/tokens/(components)/data-table/data-table";
import { usePaginationQueryState } from "@/queryStates";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface TokensDataTableProps {
  address: Address;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const TokensDataTable: FC<TokensDataTableProps> = ({ address }) => {
  // ---------------------------------------------------------------------------
  // Query State Hooks
  // ---------------------------------------------------------------------------

  const [paginationState] = usePaginationQueryState();

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const offsetCount = useMemo(() => {
    return paginationState.pageSize * paginationState.pageIndex;
  }, [paginationState.pageSize, paginationState.pageIndex]);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const walletSettings: WalletSettingsData | undefined =
    queryClient.getQueryData(queryKeys.wallet.settings({ address }).queryKey);

  const { tokens } = useQueryTokens({
    address: address,
    is_testnet: walletSettings?.is_enabled_testnet ?? false,
    limit: paginationState.pageSize,
    offset: offsetCount,
    group: true,
    chain_ids: null,
  });

  const { tokensCount } = useQueryTokensCount({
    address: address,
    is_testnet: walletSettings?.is_enabled_testnet ?? false,
    chain_ids: null,
  });

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const pageCount = useMemo(() => {
    if (!tokensCount || !tokensCount?.count) {
      return null;
    }
    return Math.ceil(tokensCount.count / paginationState.pageSize);
  }, [tokensCount, paginationState.pageSize]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="rounded-md border border-border bg-background p-4">
      <DataTable
        data={tokens ?? []}
        columns={columns}
        pageCount={pageCount ?? 0}
      />
    </div>
  );
};
