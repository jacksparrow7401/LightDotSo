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

use crate::types::{ErrorResponse, Response};
use eyre::{Error, Result};
use lightdotso_tracing::tracing::{info, warn};

pub mod error;
pub mod rpc;
pub mod types;

/// From: https://github.com/qi-protocol/ethers-userop/blob/50cb1b18a551a681786f1a766d11215c80afa7cf/src/userop_middleware.rs#L222
/// License: MIT
///
/// Helper function to handle the response from the bundler
///
/// # Arguments
/// * `response` - The response from the bundler
///
/// # Returns
/// * `Response<R>` - The success response if no error
pub async fn handle_response<R>(response: reqwest::Response) -> Result<Response<R>>
where
    R: std::fmt::Debug + serde::de::DeserializeOwned,
{
    let str_response = response.text().await?;
    let parsed_response: Result<Response<R>> =
        serde_json::from_str(&str_response).map_err(Error::from);

    match parsed_response {
        Ok(success_response) => {
            info!("Success {:?}", success_response);
            Ok(success_response)
        }
        Err(_) => {
            let error_response: ErrorResponse = serde_json::from_str(&str_response)?;
            let error_message = error_response.clone().error.message;
            warn!("Error: {:?}", error_response);
            Err(Error::msg(error_message))
        }
    }
}
