#!/usr/bin/env node

"use strict";

let [node_path, cli_path, ...args] = process.argv;

require("../src/cli").run(args);
