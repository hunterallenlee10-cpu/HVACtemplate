# ASSETS.md: generation log

Every image and video on the site was generated for this project on **Higgsfield** (via the Higgsfield MCP), on 2026-10-28/29.
No stock photos, no real brand logos, no people. Full job IDs are in [`assets/jobs.json`](assets/jobs.json); the raw downloads
live in `assets/raw/` (gitignored, about 1.5 GB).

## Budget

- Unlimited generations were **not available** through the MCP (`models_explore … unlim: true` returned `unlim.available: false`),
  so per the brief I asked before spending credits. The owner approved the **full spec** (4 variants per keyframe, every
  transition on both Kling 3.0 and Seedance 2.0).
- Balance before: **1,892.98** credits. After: **1,053.48**. **Spent: 839.5 credits.**
  The three Seedance jobs that failed on Higgsfield's side were refunded automatically.

| Model (as billed) | Used for | Jobs | Credits each |
|---|---|---|---|
| Nano Banana Pro (`nano_banana_pro`, 4k) | All 15 keyframes × 4 variants + K08 × 4 | 64 | 4 |
| Kling 3.0 (`kling3_0`, pro, sound off) | V01–V08 transitions, V03 re-shoot, V08 loop | 9 | 8.75–12.25 (5–7 s) |
| Seedance 2.0 (`seedance_2_0`, 1080p, no audio) | V01–V07 comparison renders (incl. 3 retries) | 7 ok + 3 failed (refunded) | 60–84 (5–7 s) |
| Image Background Remover | Furnace + heat-pump cutouts | 2 | 1 |
| Seedream 5.0 Pro (`remove_bg`) | Ductless cutout (the remover kept erroring on it) | 1 | 2.5 |

Note: the job records list the image model as `nano_banana_2` while the ledger bills "Nano Banana Pro"; all requests were sent as `nano_banana_pro`.

## How winners were picked

- **Stills:** 4 variants each, downloaded at full 5504×3072, laid out as contact sheets and reviewed by eye against the
  checklist (no text/logos/people, same house/room/unit, subject in the center 60%, readable shadows).
- **Aligned pairs** (K02/K06b/K06 for the thermostat crossfade, K09/K10 for the filter slider) were also measured with an
  edge-correlation script (`assets/tmp/align.mjs`): every winner sits at **0 px shift** from its base.
- **Transitions:** each pair reviewed as an 8-frame strip, then scored with ffmpeg scene-change values (mean/max frame-to-frame
  change) to catch jumps and warps. Lower and steadier wins unless the frames show morphing.

## Style lock (appended to every still prompt)

> photorealistic, shot on ARRI Alexa 35, 35mm lens, cinematic color grade, natural film grain, soft realistic light, high dynamic range, 16:9, no people, no text, no logos, no watermarks, no brand names

## Keyframes (Nano Banana Pro, 4k, 16:9 unless noted)

| Shot | File | Prompt (abridged; style lock appended) | Refs | Winner | Why |
|---|---|---|---|---|---|
| K01 Hero exterior | `K01-hero` | White clapboard center-hall colonial, Maryland suburb, winter dawn, hard frost, bare oaks, black shutters, one upstairs window glowing amber, eye-level from the lawn, space lower-left | none | #4 `429218b3` | Perfectly symmetrical facade with centered door, best for the push-in; strongest frost detail |
| K02 Cold living room | `K02-cold-room` | Same house, 6:45am, frost on the inside of tall multi-pane windows, gray sofa + cream knit throw, white-oak floor, beams, stone fireplace, cold blue light, camera 40 cm off the floor, floor register lower-right | none | #4 `2511b2a7` | Frost clearly visible; fireplace, rug and table give the warm edit the most to transform |
| K03 Register close-up | `K03-register` | Extreme low-angle macro of the same steel register, slats crisp, room blurred behind | K02 | #4 `605e99e2` | Register centered, crisp slats, room properly out of focus |
| K04 Duct tunnel | `K04-duct` | Galvanized supply duct, one-point perspective, riveted collars, dust motes, orange furnace glow at the end | none | #2 `a721fbd5` | Cleanest symmetry and glow; #3 had a dead black hole at the end |
| K05 Furnace burners | `K05-furnace` | Six burner ports with steady blue flames, heat-exchanger tubes above, orange rim light | none | #4 `9c682b42` | Clean blue flames; #2/#3 had yellow-orange tips, which contradict the copy |
| K06 Warm room (edit) | `K06-warm-room` | Edit of K02: same framing; frost gone, golden late-afternoon sun raking across the floor, table lamp on, amber grade | K02 | #1 `b00511fe` | Best structure match (r = 0.762); snow outside keeps it the same winter day |
| K06b Mid room (edit) | `K06b-mid-room` | Edit of K02: frost fading at pane edges, neutral daylight | K02 | #3 `ba8cfe6e` | Best alignment (r = 0.970) |
| K07 Outdoor unit | `K07-outdoor-unit` | Same house in autumn: unbranded condenser on a concrete pad, maple leaves, boxwoods, shuttered window above, three-quarter high angle | K01 | #1 `2e8761ea` | Unit centered with headroom above for the explode; no badge visible |
| K08 X-ray exploded | `K08-xray` | Same framing; unit as cyan holographic x-ray exploded vertically: base pan, compressor, control board + capacitor/contactor, coil, fan motor, fan guard; dusk | K07 | #1 `99c65e6a` | Full stack on the pad, evenly spaced, nothing clipped |
| K09 Dirty filter | `K09-filter-dirty` | Top-down used 16x25x1 pleated filter clogged with dust and pet hair, dark charcoal surface | none | #3 `ce73bfe0` | Dust reads most clearly |
| K10 Clean filter (edit) | `K10-filter-clean` | Edit of K09: identical filter, brand new and white | K09 | #3 `e2bf103a` | Best alignment (r = 0.740, lower only because the dust is gone) |
| K11 Gas furnace | `K11-furnace-product` | Studio product shot, matte warm-white furnace cabinet, black seamless, orange rim light, unbranded | none | #3 `4fe58cc6` | Reads most like a furnace (split panels) |
| K12 Heat pump | `K12-heatpump-product` | Same studio setup, charcoal outdoor heat pump | none | #1 `aaf8386e` | Most realistic louvered cabinet |
| K13 Ductless | `K13-ductless-product` | Same studio setup, white wall head floating above a compact condenser | none | #3 `3144fead` | Centered, both units large |
| K14 OG image | `K14-og` (→ `public/img/og-base.jpg`) | K01 reframed 21:9 with the house in the right third and empty sky/lawn left | K01 | #3 `b91458d9` | #1 had a visible compositing seam |

Variant job IDs for every shot are in `assets/jobs.json`.

## Transitions (image-to-video, 16:9, start + end frame, silent)

| Clip | Start → End | Motion prompt (abridged) | Kling 3.0 pro | Seedance 2.0 1080p | Kept | Why |
|---|---|---|---|---|---|---|
| V01 | K01 → K02 | Slow dolly across the frosty lawn, through the front entrance into the cold room, settle low | `c8286415` | `bcb6ab76` (1st try `28b8c278` failed) | **Kling** | Steadier (mean 0.0047 vs 0.0085) |
| V02 | K02 → K03 | Lower to the floor and push in on the register | `49773cf5` | `fe807eb3` | **Kling** | Lower motion noise; its one spike is frame 1, which the pipeline drops |
| V03 | K03 → K04 | Dive between the slats into darkness, emerge in the duct | `669cb59a` slid under the coffee table (fail); re-shoot `00b4ed92` | `e4e75beb` (1st try `6adb967d` failed) | **Seedance** | Actually dives between the slats; Kling's re-shoot split the frame half-room/half-duct mid-move |
| V04 | K04 → K05 | Accelerating flight down the duct, burst into the furnace as blue flames ignite | `acaa27dc` | `8f70b3f6` (1st try `10b161d9` failed) | **Kling** | Seedance blows out to flat orange then jumps |
| V05 | K05 → K06 | Follow warm air up through the ducts and out of the register into the sunlit room | `565e5980` furnace morphs into a stove in the living room (fail) | `b4c40b68` | **Seedance** | Clean |
| V06 | K06 → K07 | Out through the window, arc around the house, descend to the unit in autumn leaves | `cab15ff4` sofa follows the camera outside (fail) | `9d905d19` | **Seedance** | Clean, if quick, window pass |
| V07 | K07 → K08 | Near-locked camera; unit turns to cyan x-ray, parts rise into the exploded view | `72ba242b` | `dbc17f80` | **Kling** | Continuous separation; Seedance's parts vanish and reappear |
| V08 | K05 → K05 | Locked-off flame flicker, seamless loop | `a51f7360` | n/a | **Kling** | Used as the burner "hold" in chapter 4 |

## Product cutouts

| Product | Source | Tool | Job |
|---|---|---|---|
| Furnace | K11 #3 | Image Background Remover | `6fa44e76` |
| Heat pump | K12 #1 | Image Background Remover | `dc54de28` |
| Ductless | K13 #3 | Seedream 5.0 Pro `remove_bg` (remover errored 3×) | `7f6cf954` |

## Processing

- `bash scripts/extract-frames.sh`: clips in `assets/raw/clips/V0X.mp4` → `public/seq/{desktop,mobile}/chXX/0001.webp`, driven by
  `content/sequence.manifest.json` (clip → chapter mapping, fps 12, 1600 px desktop, 3:4 portrait crop on mobile that follows a
  per-chapter focal point, every 2nd frame). The duplicate first frame of each clip after the first is skipped.
- `node scripts/optimize-images.mjs`: stills → AVIF + WebP at 900/1600/2400, blur placeholders in `content/blur.json`, products
  → trimmed square transparent WebP/AVIF, K14 → `og-base.jpg`.

## Not done (optional bonus)

- Dedicated 9:16 mobile keyframes and transitions (spec Phase 2 bonus). Mobile currently uses a 3:4 crop of the 16:9 frames that
  follows each chapter's subject, which held up in QA at 390×844.
