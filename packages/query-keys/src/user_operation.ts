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

import type {
  UserOperationGetParams,
  UserOperationListCountParams,
  UserOperationListParams,
  UserOperationNonceParams,
  UserOperationSignatureGetParams,
} from "@lightdotso/params";
import { createQueryKeys } from "@lukemorales/query-key-factory";
import type { inferQueryKeys } from "@lukemorales/query-key-factory";

// -----------------------------------------------------------------------------
// Keys
// -----------------------------------------------------------------------------

export const user_operation = createQueryKeys("user_operation", {
  get: (params: UserOperationGetParams) => ({
    queryKey: [{ params }],
  }),
  list: (params: UserOperationListParams) => ({
    queryKey: [{ params }],
  }),
  listCount: (params: UserOperationListCountParams) => ({
    queryKey: [{ params }],
  }),
  nonce: (params: UserOperationNonceParams) => ({
    queryKey: [{ params }],
  }),
  signature: (params: UserOperationSignatureGetParams) => ({
    queryKey: [{ params }],
  }),
});

// -----------------------------------------------------------------------------
// Infer
// -----------------------------------------------------------------------------

export type UserOperationKeys = inferQueryKeys<typeof user_operation>;
