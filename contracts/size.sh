#!/usr/bin/env bash
# Copyright 2023-2024 Light, Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.


# Create a new file to hold all of the storage layouts
OUTPUT_FILE=.contracts-size

# Build the contracts and output the storage layouts
forge build --sizes > $OUTPUT_FILE

# Remove the first and last lines of the output
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i "" -e '2,$!d' -e '$d' $OUTPUT_FILE
else
    sed -i -e '2,$!d' -e '$d' $OUTPUT_FILE
fi
