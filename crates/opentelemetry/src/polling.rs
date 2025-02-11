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
use once_cell::sync::Lazy;
use opentelemetry::{global, metrics::Counter, KeyValue};

lazy_static! {
    pub static ref POLLING_ATTEMPT_COUNT: Lazy<Counter<u64>> =
        Lazy::new(|| global::meter("").u64_counter("polling_attempt_count").init());
}

pub struct PollingMetrics {}

impl PollingMetrics {
    pub fn set_attempt(chain_id: u64) {
        POLLING_ATTEMPT_COUNT.add(1, &[KeyValue::new("chain_id", chain_id.to_string())]);
    }
}
