# 🧊 King of the Iceberg — Game Design Document (GDD v9)

## Overview
King of the Iceberg is a chaotic multiplayer arena game where 2–8 pingwins compete to control a floating, unstable iceberg.

## Core Loop
Win by staying on TOP for X total seconds.
Timer only increases while on top.

## Key Features
- Sliding physics + tilt system
- Jump + stomp impacts affect iceberg
- Unique hero selection (no duplicates)
- Power-ups and abilities
- Wrap-around world (off-screen → opposite side)
- Iceberg break event at 65%
- Multiplayer (local + network)
- Attract mode + leaderboard (fastest win time)

## Heroes (Examples)
- Splash — water push
- Frostbite — freeze area
- Glacier — heavy tilt
- Dash — burst movement
- Sniper — precision shot
- Bombard — explosive impact
- Cyclone — radial push
- Anchor — traction boost

## Power-Ups
- Grip Boots — traction
- Freeze Orb — freeze players
- Wave Slam — shockwave
- Mega Core — extra weight
- Ice Sniper — projectile boost
- Spin Core — stronger spin
- Dash Surge — speed boost
- Wind Gust — push field

## Systems
- Tilemap iceberg (left authored, right mirrored)
- Parallax background
- Physics-driven combat
- Network authoritative model

## Next Step
Proceed to PLAN_PR to build systems and repo structure.
