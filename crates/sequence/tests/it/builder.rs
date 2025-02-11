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

use eyre::Result;
use lightdotso_sequence::{
    builder::rooted_node_builder,
    recover::recover_signature,
    types::SignerNode,
    utils::{from_hex_string, parse_hex_to_bytes32},
};

// https://sepolia.etherscan.io/tx/0x4dcceb715de1825bee83424e2385a7ed2cc00af70d883ff25aaa29f2c6efbd68
const SIGNATURES: &[&str] = &[
    "0x0100010000000001014fd9d0ee6d6564e80a9ee00c0163fc952d0a45ed00012395bc3e577accfb42eaa452519853a168ca8bd8267063b73957a684c2583a0066a37fe568c1d5e918e98d2a99d6d6e0f0b8448ff704283c7757a82fd37b9dfa1b02",
];

#[tokio::test(flavor = "multi_thread")]
async fn test_integration_rooted_builder() -> Result<()> {
    for (i, signature) in SIGNATURES.iter().enumerate() {
        println!("{}", i);

        let sig = from_hex_string(signature)?.into();
        // Notice that the recovered addresses are hypothetical as we don't have the original
        // user_op_hash that was used for the subdigest.
        let user_op_hash = parse_hex_to_bytes32(
            "0x4fc471aea4f6850725688fbdba63383a7678b9dcba1b4ae9a837bf3d01a1833e",
        )?;

        let config = recover_signature(
            "0xFbd80Fe5cE1ECe895845Fd131bd621e2B6A1345F".parse()?,
            11155111,
            user_op_hash,
            sig,
        )
        .await?;

        println!("signers: {:?}", config.tree.get_signers());

        let signers = config.tree.get_signers();
        let signer_nodes = signers
            .iter()
            .map(|s| SignerNode { signer: Some(s.clone()), left: None, right: None })
            .collect::<Vec<_>>();

        // Build the tree
        let new_config_tree = rooted_node_builder(signer_nodes)?;

        println!("new signer tree: {:?}", new_config_tree.clone());
        println!("signers tree: {:?}", config.tree);

        insta::assert_debug_snapshot!(format!("{}-config", i.to_string()), config.clone().tree);
        insta::assert_debug_snapshot!(format!("{}-config", i.to_string()), new_config_tree.clone());
    }

    Ok(())
}
