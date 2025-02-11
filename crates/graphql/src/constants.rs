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

use lazy_static::lazy_static;
use std::collections::HashMap;

// The graph hosted service rpc urls
lazy_static! {
    pub static ref THE_GRAPH_HOSTED_SERVICE_URLS: HashMap<u64, String> = {
        let mut m = HashMap::new();

        // Mainnet
        m.insert(1, "https://api.thegraph.com/subgraphs/name/lightdotso/mainnet".to_string());
        m.insert(10, "https://api.thegraph.com/subgraphs/name/lightdotso/optimism".to_string());
        m.insert(56, "https://api.thegraph.com/subgraphs/name/lightdotso/bsc".to_string());
        m.insert(100, "https://api.thegraph.com/subgraphs/name/lightdotso/gnosis".to_string());
        m.insert(137, "https://api.thegraph.com/subgraphs/name/lightdotso/matic".to_string());
        m.insert(250, "https://api.thegraph.com/subgraphs/name/lightdotso/fantom".to_string());
        m.insert(1101, "https://api.thegraph.com/subgraphs/name/lightdotso/polygon-zkevm".to_string());
        m.insert(8453, "https://api.thegraph.com/subgraphs/name/lightdotso/base".to_string());
        m.insert(42161, "https://api.thegraph.com/subgraphs/name/lightdotso/arbitrum-one".to_string());
        m.insert(42220, "https://api.thegraph.com/subgraphs/name/lightdotso/celo".to_string());
        m.insert(43114, "https://api.thegraph.com/subgraphs/name/lightdotso/avalanche".to_string());


        // Testnet
        m.insert(80001, "https://api.thegraph.com/subgraphs/name/lightdotso/mumbai".to_string());
        m.insert(421614, "https://api.thegraph.com/subgraphs/name/lightdotso/arbitrum-sepolia".to_string());
        m.insert(11155111, "https://api.thegraph.com/subgraphs/name/lightdotso/sepolia".to_string());

        m
    };
}

lazy_static! {
    pub static ref THE_GRAPH_STUDIO_BASE_URL: String =
        "https://gateway-arbitrum.network.thegraph.com/api".to_string();
}

// The graph studio service rpc urls
lazy_static! {
    pub static ref THE_GRAPH_STUDIO_SERVICE_IDS: HashMap<u64, String> = {
        let mut m = HashMap::new();

        // Testnet
        m.insert(168587773, "GSV9eeURHDAoAVPacXKqTKKdDwE4cuUzTesWCvqQMJzU".to_string());

        m
    };
}

lazy_static! {
    pub static ref SATSUMA_BASE_URL: String = "https://subgraph.satsuma-prod.com".to_string();
}

// The satsuma rpc urls
lazy_static! {
    pub static ref SATSUMA_LIVE_IDS: HashMap<u64, String> = {
        let mut m = HashMap::new();

        // Mainnet
        m.insert(1, "lightdotso/mainnet/api".to_string());
        m.insert(10, "lightdotso/optimism/api".to_string());
        m.insert(137, "lightdotso/matic/api".to_string());
        m.insert(8453, "lightdotso/base/api".to_string());
        m.insert(42161, "lightdotso/arbitrum-one/api".to_string());


        // Testnet
        m.insert(80001, "lightdotso/mumbai/api".to_string());
        m.insert(84532, "lightdotso/base-sepolia/api".to_string());
        m.insert(421614, "lightdotso/arbitrum-sepolia/api".to_string());
        m.insert(11155111, "lightdotso/sepolia/api".to_string());
        m.insert(11155420, "lightdotso/optimism-sepolia/api".to_string());

        m
    };
}

// The default chain sleep seconds
lazy_static! {
    pub static ref DEFAULT_CHAIN_SLEEP_SECONDS: u64 = 12;
}

// The chain sleep seconds
lazy_static! {
    pub static ref CHAIN_SLEEP_SECONDS: HashMap<u64, u64> = {
        let mut m = HashMap::new();

        // Mainnet
        m.insert(1, 12);
        m.insert(10, 2);
        m.insert(137, 3);
        m.insert(8453, 2);
        m.insert(42161, 2);


        // Testnet
        m.insert(80001, 12);
        m.insert(84532, 12);
        m.insert(421614, 12);
        m.insert(11155111, 12);

        m
    };
}
