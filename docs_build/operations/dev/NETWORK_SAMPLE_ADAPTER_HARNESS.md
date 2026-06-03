# NETWORK_SAMPLE_ADAPTER_HARNESS

## Purpose
Provide a low-risk validation path for shared network debug support without hard-coding a specific transport or protocol into the shared layer.

## Harness Responsibilities
- expose connection summaries
- expose latency/RTT summaries
- expose replication summaries
- expose divergence summaries
- expose event stream summaries

## Harness Rules
- adapters remain project-local
- shared network panels/providers stay generic
- no protocol internals in shared layer
