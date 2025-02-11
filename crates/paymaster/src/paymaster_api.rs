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

use crate::types::{GasAndPaymasterAndData, PaymasterAndData, UserOperationRequest};
use ethers::types::Address;
use jsonrpsee::{core::RpcResult, proc_macros::rpc};

#[rpc(client, server, namespace = "paymaster")]
#[cfg_attr(test, automock)]
pub trait PaymasterApi {
    #[method(name = "requestPaymasterAndData")]
    async fn request_paymaster_and_data(
        &self,
        user_operation: UserOperationRequest,
        entry_point: Address,
        chain_id: u64,
    ) -> RpcResult<PaymasterAndData>;

    #[method(name = "requestGasAndPaymasterAndData")]
    async fn request_gas_and_paymaster_and_data(
        &self,
        user_operation: UserOperationRequest,
        entry_point: Address,
        chain_id: u64,
    ) -> RpcResult<GasAndPaymasterAndData>;
}
