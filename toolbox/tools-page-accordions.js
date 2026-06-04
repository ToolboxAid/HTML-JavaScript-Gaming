(function () {
    const list = document.querySelector("[data-tools-accordion-list]");
    if (!list) {
        return;
    }

    const orderButton = document.querySelector("[data-tools-order]");
    const groupedButton = document.querySelector("[data-tools-sort='grouped']");
    const progressButton = document.querySelector("[data-tools-view='progress']");
    const buildPathButton = document.querySelector("[data-tools-view='build-path']");
    const roleBanner = document.querySelector("[data-toolbox-role-banner]");
    const toolCount = document.querySelector("[data-tools-count]");
    const urlRole = new URLSearchParams(window.location.search).get("role");
    const toolboxRole = urlRole === "admin" ? "admin" : urlRole === "user" ? "creator" : "guest";
    let currentMode = "ascending";
    const toolGroups = [
        {
                "group": "AI",
                "tools": [
                        {
                                "title": "AI Assistant",
                                "href": "../toolbox/ai-assistant/index.html",
                                "image": "../assets/theme-v2/images/image-missing.svg",
                                "description": "Get guided technical help for game creation workflows.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": false,
                                "requiredForPublish": false,
                                "status": "ready",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        }
                ]
        },
        {
                "group": "Planning",
                "tools": [
                        {
                                "title": "Project Workspace",
                                "href": "../toolbox/project-workspace/index.html",
                                "image": "../assets/theme-v2/images/image-missing.svg",
                                "description": "Coordinate Build, Play, and Share readiness for one game project.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": true,
                                "requiredForPublish": true,
                                "status": "in-progress",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Game Design",
                                "href": "../toolbox/game-design/index.html",
                                "image": "../assets/theme-v2/images/image-missing.svg",
                                "description": "Plan gameplay, systems, rules, and player experience.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": true,
                                "requiredForPublish": true,
                                "status": "in-progress",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Game Configuration",
                                "href": "../toolbox/game-configuration/index.html",
                                "image": "../assets/theme-v2/images/image-missing.svg",
                                "description": "Plan release profile, debug visibility, and playable readiness gates.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": true,
                                "requiredForPublish": true,
                                "status": "ready",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        }
                ]
        },
        {
                "group": "Content",
                "tools": [
                        {
                                "title": "Assets",
                                "href": "../toolbox/assets/index.html",
                                "image": "../assets/theme-v2/images/image-missing.svg",
                                "description": "Create sprites, animations, vectors, and palettes.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": true,
                                "requiredForPublish": true,
                                "status": "in-progress",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Colors",
                                "href": "../toolbox/colors/index.html",
                                "image": "../assets/theme-v2/images/image-missing.svg",
                                "description": "Craft and manage color palettes for your games.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": true,
                                "requiredForPublish": true,
                                "status": "complete",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Fonts",
                                "href": "../toolbox/fonts/index.html",
                                "image": "../assets/theme-v2/images/image-missing.svg",
                                "description": "Plan game typography, font loading, and readable text choices.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": false,
                                "requiredForPublish": true,
                                "status": "ready",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Sprites",
                                "href": "../toolbox/sprites/index.html",
                                "image": "../assets/theme-v2/images/image-missing.svg",
                                "description": "Plan sprite creation, review, and game-ready export workflows.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": true,
                                "requiredForPublish": true,
                                "status": "ready",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Characters",
                                "href": "../toolbox/characters/index.html",
                                "image": "../assets/theme-v2/images/image-missing.svg",
                                "description": "Plan player, NPC, and character asset workflows.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": true,
                                "requiredForPublish": true,
                                "status": "ready",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Objects",
                                "href": "../toolbox/objects/index.html",
                                "image": "../assets/theme-v2/images/image-missing.svg",
                                "description": "Design reusable game objects and object-ready assets.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": true,
                                "requiredForPublish": true,
                                "status": "ready",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Worlds",
                                "href": "../toolbox/worlds/index.html",
                                "image": "../assets/theme-v2/images/image-missing.svg",
                                "description": "Shape world layouts, maps, terrain, and scene geometry.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": true,
                                "requiredForPublish": true,
                                "status": "in-progress",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Animations",
                                "href": "../toolbox/animations/index.html",
                                "image": "../assets/theme-v2/images/image-missing.svg",
                                "description": "Plan character and object animation states.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": true,
                                "requiredForPublish": false,
                                "status": "in-progress",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        }
                ]
        },
        {
                "group": "Media & Audio",
                "tools": [
                        {
                                "title": "Audio",
                                "href": "../toolbox/audio/index.html",
                                "image": "../assets/theme-v2/images/image-missing.svg",
                                "description": "Plan game audio, effects, and playback readiness.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "bot",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": false,
                                "requiredForPublish": false,
                                "status": "ready",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Music",
                                "href": "../toolbox/music/index.html",
                                "image": "../assets/theme-v2/images/image-missing.svg",
                                "description": "Plan reusable music and soundtrack workflows.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "bot",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": false,
                                "requiredForPublish": false,
                                "status": "ready",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Voices",
                                "href": "../toolbox/voices/index.html",
                                "image": "../assets/theme-v2/images/image-missing.svg",
                                "description": "Plan character voice, spoken output, and voice review workflows.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "bot",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": false,
                                "requiredForPublish": false,
                                "status": "ready",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Videos",
                                "href": "../toolbox/videos/index.html",
                                "image": "../assets/theme-v2/images/image-missing.svg",
                                "description": "Plan trailer, cutscene, and video asset workflows.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "bot",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": false,
                                "requiredForPublish": false,
                                "status": "ready",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        }
                ]
        },
        {
                "group": "Build & Test",
                "tools": [
                        {
                                "title": "Build Game",
                                "href": "../toolbox/build-game/index.html",
                                "image": "../assets/theme-v2/images/image-missing.svg",
                                "description": "Plan build packaging and playable output readiness.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": true,
                                "requiredForPublish": true,
                                "status": "locked",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Game Testing",
                                "href": "../toolbox/game-testing/index.html",
                                "image": "../assets/theme-v2/images/image-missing.svg",
                                "description": "Plan test passes, release checks, and playable validation.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": true,
                                "requiredForPublish": true,
                                "status": "locked",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Controls",
                                "href": "../toolbox/controls/index.html",
                                "image": "../assets/theme-v2/images/image-missing.svg",
                                "description": "Map keyboard, mouse, gamepad, and touch controls.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": true,
                                "requiredForPublish": true,
                                "status": "ready",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Hitboxes",
                                "href": "../toolbox/hitboxes/index.html",
                                "image": "../assets/theme-v2/images/image-missing.svg",
                                "description": "Plan collision, hurtbox, and interaction region workflows.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": true,
                                "requiredForPublish": true,
                                "status": "ready",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Saved Data",
                                "href": "../toolbox/saved-data/index.html",
                                "image": "../assets/theme-v2/images/image-missing.svg",
                                "description": "Inspect and manage saves, local storage, and game data.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": false,
                                "requiredForPublish": false,
                                "status": "complete",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Debug",
                                "href": "../toolbox/debug/index.html",
                                "image": "../assets/theme-v2/images/image-missing.svg",
                                "description": "Plan visible creator debug settings and release gating.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": true,
                                "requiredForPublish": true,
                                "status": "ready",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Performance",
                                "href": "../toolbox/performance/index.html",
                                "image": "../assets/theme-v2/images/image-missing.svg",
                                "description": "Plan performance budgets, diagnostics, and readiness checks.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": true,
                                "requiredForPublish": true,
                                "status": "ready",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Events",
                                "href": "../toolbox/events/index.html",
                                "image": "../assets/theme-v2/images/image-missing.svg",
                                "description": "Plan gameplay events, triggers, and state transitions.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": true,
                                "requiredForPublish": true,
                                "status": "ready",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        }
                ]
        },
        {
                "group": "Share & Community",
                "tools": [
                        {
                                "title": "Publish",
                                "href": "../toolbox/publish/index.html",
                                "image": "../assets/theme-v2/images/image-missing.svg",
                                "description": "Prepare publishing workflows and release-ready game packages.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": false,
                                "requiredForPublish": true,
                                "status": "locked",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Marketplace",
                                "href": "../toolbox/marketplace/index.html",
                                "image": "../assets/theme-v2/images/image-missing.svg",
                                "description": "Plan marketplace listing, asset, and discovery workflows.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": false,
                                "requiredForPublish": false,
                                "status": "ready",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Community",
                                "href": "../toolbox/community/index.html",
                                "image": "../assets/theme-v2/images/image-missing.svg",
                                "description": "Plan creator community, tutorials, sharing, and feedback workflows.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": false,
                                "requiredForPublish": false,
                                "status": "ready",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Languages",
                                "href": "../toolbox/languages/index.html",
                                "image": "../assets/theme-v2/images/image-missing.svg",
                                "description": "Plan game language coverage and translation review workflows.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": false,
                                "requiredForPublish": false,
                                "status": "ready",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Achievements",
                                "href": "../toolbox/achievements/index.html",
                                "image": "../assets/theme-v2/images/image-missing.svg",
                                "description": "Plan achievement definitions and creator-facing unlock review.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": false,
                                "requiredForPublish": false,
                                "status": "ready",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Ratings",
                                "href": "../toolbox/ratings/index.html",
                                "image": "../assets/theme-v2/images/image-missing.svg",
                                "description": "Plan player ratings, review signals, and quality feedback.",
                                "role": "Foundry Bot",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "adminOnly": false,
                                "hidden": false,
                                "planned": false,
                                "requiredForTestable": false,
                                "requiredForPublish": false,
                                "status": "ready",
                                "progressChecklist": [
                                        "Review readiness",
                                        "Static wireframe text only"
                                ]
                        }
                ]
        },
        {
                "group": "Hidden Capability",
                "tools": [
                        {
                                "title": "Cloud",
                                "href": "../toolbox/cloud/index.html",
                                "image": "../assets/theme-v2/images/image-missing.svg",
                                "description": "Hidden capability shell for connected storage, sync, and publishing support.",
                                "role": "Hidden Preview",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "subgroup": "Hidden planned",
                                "adminOnly": false,
                                "hidden": true,
                                "planned": true,
                                "requiredForTestable": false,
                                "requiredForPublish": false,
                                "status": "locked",
                                "progressChecklist": [
                                        "Hidden planned capability",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Custom Extensions",
                                "href": "../toolbox/code/index.html",
                                "image": "../assets/theme-v2/images/image-missing.svg",
                                "description": "Hidden capability shell for approved extension hooks and creator-private custom logic.",
                                "role": "Hidden Preview",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "subgroup": "Hidden planned",
                                "adminOnly": false,
                                "hidden": true,
                                "planned": true,
                                "requiredForTestable": false,
                                "requiredForPublish": false,
                                "status": "locked",
                                "progressChecklist": [
                                        "Hidden planned capability",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Creator Learning",
                                "href": "../toolbox/learn/index.html",
                                "image": "../assets/theme-v2/images/image-missing.svg",
                                "description": "Hidden capability shell for tutorials and creator learning workflows.",
                                "role": "Hidden Preview",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "subgroup": "Hidden planned",
                                "adminOnly": false,
                                "hidden": true,
                                "planned": true,
                                "requiredForTestable": false,
                                "requiredForPublish": false,
                                "status": "locked",
                                "progressChecklist": [
                                        "Hidden planned capability",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "MIDI",
                                "href": "../toolbox/midi/index.html",
                                "image": "../assets/theme-v2/images/image-missing.svg",
                                "description": "Hidden capability shell for MIDI-driven audio and music interaction flows.",
                                "role": "Hidden Preview",
                                "mascot": "foundry-bot",
                                "theme": "bot",
                                "subgroup": "Hidden planned",
                                "adminOnly": false,
                                "hidden": true,
                                "planned": true,
                                "requiredForTestable": false,
                                "requiredForPublish": false,
                                "status": "locked",
                                "progressChecklist": [
                                        "Hidden planned capability",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Particles",
                                "href": "../toolbox/particles/index.html",
                                "image": "../assets/theme-v2/images/image-missing.svg",
                                "description": "Hidden capability shell for visual effects and particle workflows.",
                                "role": "Hidden Preview",
                                "mascot": "foundry-bot",
                                "theme": "forge",
                                "subgroup": "Hidden planned",
                                "adminOnly": false,
                                "hidden": true,
                                "planned": true,
                                "requiredForTestable": false,
                                "requiredForPublish": false,
                                "status": "locked",
                                "progressChecklist": [
                                        "Hidden planned capability",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Audio Effects",
                                "href": "../toolbox/audio-effects/index.html",
                                "image": "../assets/theme-v2/images/image-missing.svg",
                                "description": "Hidden capability shell for reusable game effect audio workflows.",
                                "role": "Hidden Preview",
                                "mascot": "foundry-bot",
                                "theme": "bot",
                                "subgroup": "Hidden planned",
                                "adminOnly": false,
                                "hidden": true,
                                "planned": true,
                                "requiredForTestable": false,
                                "requiredForPublish": false,
                                "status": "locked",
                                "progressChecklist": [
                                        "Hidden planned capability",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Voice Capture",
                                "href": "../toolbox/speech-to-text/index.html",
                                "image": "../assets/theme-v2/images/image-missing.svg",
                                "description": "Hidden capability shell for spoken input and transcription workflows.",
                                "role": "Hidden Preview",
                                "mascot": "foundry-bot",
                                "theme": "bot",
                                "subgroup": "Hidden planned",
                                "adminOnly": false,
                                "hidden": true,
                                "planned": true,
                                "requiredForTestable": false,
                                "requiredForPublish": false,
                                "status": "locked",
                                "progressChecklist": [
                                        "Hidden planned capability",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Voice Output",
                                "href": "../toolbox/text-to-speech/index.html",
                                "image": "../assets/theme-v2/images/image-missing.svg",
                                "description": "Hidden capability shell for generated narration and spoken output workflows.",
                                "role": "Hidden Preview",
                                "mascot": "foundry-bot",
                                "theme": "bot",
                                "subgroup": "Hidden planned",
                                "adminOnly": false,
                                "hidden": true,
                                "planned": true,
                                "requiredForTestable": false,
                                "requiredForPublish": false,
                                "status": "locked",
                                "progressChecklist": [
                                        "Hidden planned capability",
                                        "Static wireframe text only"
                                ]
                        }
                ]
        },
        {
                "group": "Admin Tools",
                "tools": [
                        {
                                "title": "Users",
                                "href": "../toolbox/users/index.html",
                                "image": "../assets/theme-v2/images/image-missing.svg",
                                "description": "Admin-only planned shell for user management workflows.",
                                "role": "Admin Preview",
                                "mascot": "forgebot",
                                "theme": "forge",
                                "subgroup": "Admin-only planned",
                                "adminOnly": true,
                                "hidden": false,
                                "planned": true,
                                "requiredForTestable": false,
                                "requiredForPublish": false,
                                "status": "locked",
                                "progressChecklist": [
                                        "Admin-only planned tool",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Environments",
                                "href": "../toolbox/environments/index.html",
                                "image": "../assets/theme-v2/images/image-missing.svg",
                                "description": "Admin-only planned shell for environment and deployment controls.",
                                "role": "Admin Preview",
                                "mascot": "forgebot",
                                "theme": "forge",
                                "subgroup": "Admin-only planned",
                                "adminOnly": true,
                                "hidden": false,
                                "planned": true,
                                "requiredForTestable": false,
                                "requiredForPublish": false,
                                "status": "locked",
                                "progressChecklist": [
                                        "Admin-only planned tool",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Game Migration",
                                "href": "../toolbox/game-migration/index.html",
                                "image": "../assets/theme-v2/images/image-missing.svg",
                                "description": "Admin-only planned shell for migration review and game data movement.",
                                "role": "Admin Preview",
                                "mascot": "forgebot",
                                "theme": "forge",
                                "subgroup": "Admin-only planned",
                                "adminOnly": true,
                                "hidden": false,
                                "planned": true,
                                "requiredForTestable": false,
                                "requiredForPublish": false,
                                "status": "locked",
                                "progressChecklist": [
                                        "Admin-only planned tool",
                                        "Static wireframe text only"
                                ]
                        },
                        {
                                "title": "Platform Settings",
                                "href": "../toolbox/platform-settings/index.html",
                                "image": "../assets/theme-v2/images/image-missing.svg",
                                "description": "Admin-only planned shell for platform configuration workflows.",
                                "role": "Admin Preview",
                                "mascot": "forgebot",
                                "theme": "forge",
                                "subgroup": "Admin-only planned",
                                "adminOnly": true,
                                "hidden": false,
                                "planned": true,
                                "requiredForTestable": false,
                                "requiredForPublish": false,
                                "status": "locked",
                                "progressChecklist": [
                                        "Admin-only planned tool",
                                        "Static wireframe text only"
                                ]
                        }
                ]
        }
];
    const groupClassMap = {
        "AI": "tool-group-ai-learning",
        "Planning": "tool-group-development-system",
        "Content": "tool-group-content-assets",
        "Media & Audio": "tool-group-media-audio",
        "Build & Test": "tool-group-development-system",
        "Share & Community": "tool-group-community-marketplace",
        "Hidden Capability": "tool-group-platform-cloud",
        "Admin Tools": "tool-group-platform-cloud"
};
    const groupSwatchMap = {
        "AI": "swatch-purple",
        "Planning": "swatch-blue",
        "Content": "swatch-gold",
        "Media & Audio": "swatch-red",
        "Build & Test": "swatch-gray",
        "Share & Community": "swatch-gold",
        "Hidden Capability": "swatch-blue",
        "Admin Tools": "swatch-blue"
};
    const badgeMap = {
        "AI Assistant": "ai-assistant"
    };
    const defaultProgress = {
        requiredForTestable: false,
        requiredForPublish: false,
        status: "ready",
        progressChecklist: ["Review readiness"]
    };
    const projectProgressSummary = {
        projectProgress: "Core path in-progress",
        publishingProgress: "Publish blocked until configuration and required assets are ready",
        currentFocus: "Complete Game Configuration",
        recommendedNextTool: "Build Game"
    };
    const progressModel = {
        "AI Assistant": {
                "requiredForTestable": false,
                "requiredForPublish": false,
                "status": "ready",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Project Workspace": {
                "requiredForTestable": true,
                "requiredForPublish": true,
                "status": "in-progress",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Game Design": {
                "requiredForTestable": true,
                "requiredForPublish": true,
                "status": "in-progress",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Game Configuration": {
                "requiredForTestable": true,
                "requiredForPublish": true,
                "status": "ready",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Assets": {
                "requiredForTestable": true,
                "requiredForPublish": true,
                "status": "in-progress",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Colors": {
                "requiredForTestable": true,
                "requiredForPublish": true,
                "status": "complete",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Fonts": {
                "requiredForTestable": false,
                "requiredForPublish": true,
                "status": "ready",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Sprites": {
                "requiredForTestable": true,
                "requiredForPublish": true,
                "status": "ready",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Characters": {
                "requiredForTestable": true,
                "requiredForPublish": true,
                "status": "ready",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Objects": {
                "requiredForTestable": true,
                "requiredForPublish": true,
                "status": "ready",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Worlds": {
                "requiredForTestable": true,
                "requiredForPublish": true,
                "status": "in-progress",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Animations": {
                "requiredForTestable": true,
                "requiredForPublish": false,
                "status": "in-progress",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Audio": {
                "requiredForTestable": false,
                "requiredForPublish": false,
                "status": "ready",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Music": {
                "requiredForTestable": false,
                "requiredForPublish": false,
                "status": "ready",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Voices": {
                "requiredForTestable": false,
                "requiredForPublish": false,
                "status": "ready",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Videos": {
                "requiredForTestable": false,
                "requiredForPublish": false,
                "status": "ready",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Build Game": {
                "requiredForTestable": true,
                "requiredForPublish": true,
                "status": "locked",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Game Testing": {
                "requiredForTestable": true,
                "requiredForPublish": true,
                "status": "locked",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Controls": {
                "requiredForTestable": true,
                "requiredForPublish": true,
                "status": "ready",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Hitboxes": {
                "requiredForTestable": true,
                "requiredForPublish": true,
                "status": "ready",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Saved Data": {
                "requiredForTestable": false,
                "requiredForPublish": false,
                "status": "complete",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Debug": {
                "requiredForTestable": true,
                "requiredForPublish": true,
                "status": "ready",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Performance": {
                "requiredForTestable": true,
                "requiredForPublish": true,
                "status": "ready",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Events": {
                "requiredForTestable": true,
                "requiredForPublish": true,
                "status": "ready",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Publish": {
                "requiredForTestable": false,
                "requiredForPublish": true,
                "status": "locked",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Marketplace": {
                "requiredForTestable": false,
                "requiredForPublish": false,
                "status": "ready",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Community": {
                "requiredForTestable": false,
                "requiredForPublish": false,
                "status": "ready",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Languages": {
                "requiredForTestable": false,
                "requiredForPublish": false,
                "status": "ready",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Achievements": {
                "requiredForTestable": false,
                "requiredForPublish": false,
                "status": "ready",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Ratings": {
                "requiredForTestable": false,
                "requiredForPublish": false,
                "status": "ready",
                "progressChecklist": [
                        "Review readiness",
                        "Static wireframe text only"
                ]
        },
        "Cloud": {
                "requiredForTestable": false,
                "requiredForPublish": false,
                "status": "locked",
                "progressChecklist": [
                        "Hidden planned capability",
                        "Static wireframe text only"
                ]
        },
        "Custom Extensions": {
                "requiredForTestable": false,
                "requiredForPublish": false,
                "status": "locked",
                "progressChecklist": [
                        "Hidden planned capability",
                        "Static wireframe text only"
                ]
        },
        "Creator Learning": {
                "requiredForTestable": false,
                "requiredForPublish": false,
                "status": "locked",
                "progressChecklist": [
                        "Hidden planned capability",
                        "Static wireframe text only"
                ]
        },
        "MIDI": {
                "requiredForTestable": false,
                "requiredForPublish": false,
                "status": "locked",
                "progressChecklist": [
                        "Hidden planned capability",
                        "Static wireframe text only"
                ]
        },
        "Particles": {
                "requiredForTestable": false,
                "requiredForPublish": false,
                "status": "locked",
                "progressChecklist": [
                        "Hidden planned capability",
                        "Static wireframe text only"
                ]
        },
        "Audio Effects": {
                "requiredForTestable": false,
                "requiredForPublish": false,
                "status": "locked",
                "progressChecklist": [
                        "Hidden planned capability",
                        "Static wireframe text only"
                ]
        },
        "Voice Capture": {
                "requiredForTestable": false,
                "requiredForPublish": false,
                "status": "locked",
                "progressChecklist": [
                        "Hidden planned capability",
                        "Static wireframe text only"
                ]
        },
        "Voice Output": {
                "requiredForTestable": false,
                "requiredForPublish": false,
                "status": "locked",
                "progressChecklist": [
                        "Hidden planned capability",
                        "Static wireframe text only"
                ]
        },
        "Users": {
                "requiredForTestable": false,
                "requiredForPublish": false,
                "status": "locked",
                "progressChecklist": [
                        "Admin-only planned tool",
                        "Static wireframe text only"
                ]
        },
        "Environments": {
                "requiredForTestable": false,
                "requiredForPublish": false,
                "status": "locked",
                "progressChecklist": [
                        "Admin-only planned tool",
                        "Static wireframe text only"
                ]
        },
        "Game Migration": {
                "requiredForTestable": false,
                "requiredForPublish": false,
                "status": "locked",
                "progressChecklist": [
                        "Admin-only planned tool",
                        "Static wireframe text only"
                ]
        },
        "Platform Settings": {
                "requiredForTestable": false,
                "requiredForPublish": false,
                "status": "locked",
                "progressChecklist": [
                        "Admin-only planned tool",
                        "Static wireframe text only"
                ]
        }
};
    const buildPathGroups = [
        {
                "title": "Project Workspace",
                "groupClass": "tool-group-ai-learning",
                "note": "Start with the single project surface that coordinates current focus, readiness, and recommended next tool.",
                "tools": [
                        "Project Workspace"
                ]
        },
        {
                "title": "Game Design",
                "groupClass": "tool-group-development-system",
                "note": "Define gameplay, rules, player experience, and the requirements that shape the build path.",
                "tools": [
                        "Game Design"
                ]
        },
        {
                "title": "Game Configuration",
                "groupClass": "tool-group-development-system",
                "note": "Set the release profile, debug policy, and playable gate before the required tool path is treated as ready.",
                "tools": [
                        "Game Configuration"
                ]
        },
        {
                "title": "Required Tool Path",
                "groupClass": "tool-group-build-create",
                "note": "Use readiness fields to identify creator-facing blockers before a playable build.",
                "tools": [
                        "Colors",
                        "Controls",
                        "Assets",
                        "Sprites",
                        "Characters",
                        "Objects",
                        "Worlds",
                        "Animations",
                        "Audio"
                ]
        },
        {
                "title": "Build Game",
                "groupClass": "tool-group-development-system",
                "note": "Build Game is the package and playable-output checkpoint for this wireframe.",
                "tools": [
                        "Build Game"
                ]
        },
        {
                "title": "Game Testing",
                "groupClass": "tool-group-development-system",
                "note": "Game Testing collects test readiness, hitboxes, debug policy, performance checks, and event review.",
                "tools": [
                        "Game Testing",
                        "Hitboxes",
                        "Debug",
                        "Performance",
                        "Events"
                ]
        },
        {
                "title": "Publish",
                "groupClass": "tool-group-community-marketplace",
                "note": "Publish is required for public release; Marketplace, Community, Languages, Achievements, and Ratings support Share readiness.",
                "tools": [
                        "Publish",
                        "Marketplace",
                        "Community",
                        "Languages",
                        "Achievements",
                        "Ratings"
                ]
        }
];
    const progressOrder = ["complete", "in-progress", "ready", "locked"];

    function isVisibleForRole(tool) {
        if (toolboxRole === "admin") {
            return true;
        }
        return tool.adminOnly !== true && tool.hidden !== true && tool.planned !== true;
    }

    function visibleToolGroups() {
        return toolGroups.map((toolGroup) => ({
            ...toolGroup,
            tools: toolGroup.tools.filter(isVisibleForRole)
        })).filter((toolGroup) => toolGroup.tools.length > 0);
    }

    function roleAwareTools() {
        return visibleToolGroups().flatMap((group) => group.tools.map((tool) => ({
            ...tool,
            group: group.group,
            ...(progressModel[tool.title] || defaultProgress)
        })));
    }

    function configureRoleBanner() {
        if (!roleBanner) {
            return;
        }
        const nextRole = toolboxRole === "admin" ? "user" : toolboxRole === "creator" ? "admin" : "user";
        const nextUrl = new URL(window.location.href);
        nextUrl.searchParams.set("role", nextRole);
        roleBanner.href = nextUrl.pathname + nextUrl.search + nextUrl.hash;
        if (toolboxRole === "admin") {
            roleBanner.textContent = "ADMIN VIEW • Planned tools visible • Switch to Creator View";
        } else if (toolboxRole === "creator") {
            roleBanner.textContent = "CREATOR VIEW • Project tools enabled • Switch to Admin View";
        } else {
            roleBanner.textContent = "GUEST VIEW • Preview only • Sign in to create";
        }
    }

    function groupClass(groupName) {
        return groupClassMap[groupName] || "";
    }

    function groupSwatch(groupName) {
        return groupSwatchMap[groupName] || "swatch-orange";
    }

    function badgeName(tool) {
        if (badgeMap[tool.title]) {
            return badgeMap[tool.title];
        }
        return "index";
    }

    function setActiveButton(mode) {
        if (orderButton) {
            orderButton.setAttribute("aria-pressed", String(mode === "ascending" || mode === "descending"));
            orderButton.textContent = `Order ${orderButton.dataset.toolsOrder === "ascending" ? "A-Z" : "Z-A"}`;
        }
        if (groupedButton) {
            groupedButton.setAttribute("aria-pressed", String(mode === "grouped"));
        }
        if (progressButton) {
            progressButton.setAttribute("aria-pressed", String(mode === "progress"));
        }
        if (buildPathButton) {
            buildPathButton.setAttribute("aria-pressed", String(mode === "build-path"));
        }
    }

    function getOrderedTools(mode) {
        const tools = roleAwareTools();
        tools.sort((left, right) => left.title.localeCompare(right.title));
        if (mode === "descending") {
            tools.reverse();
        }
        return tools;
    }

    function getGroupedTools() {
        return visibleToolGroups().map((toolGroup) => ({
            title: toolGroup.group,
            tools: toolGroup.tools.map((tool) => ({
                ...tool,
                group: toolGroup.group
            })),
            groupClass: groupClass(toolGroup.group)
        }));
    }

    function getProgressGroups() {
        return progressOrder.map((status) => ({
            title: status,
            tools: getOrderedTools("ascending").filter((tool) => tool.status === status),
            groupClass: "tool-group-development-system"
        })).filter((group) => group.tools.length > 0);
    }

    function getBuildPathGroups() {
        const availableTools = roleAwareTools();
        return buildPathGroups.map((group) => ({
            title: group.title,
            tools: group.tools.map((title) => availableTools.find((tool) => tool.title === title)).filter(Boolean),
            groupClass: group.groupClass,
            note: group.note
        }));
    }

    function createProgressSummary() {
        const article = document.createElement("article");
        article.className = "callout";

        const title = document.createElement("h3");
        title.textContent = "Project Progress";

        const projectProgress = document.createElement("p");
        projectProgress.textContent = "Project Progress: " + projectProgressSummary.projectProgress;

        const publishingProgress = document.createElement("p");
        publishingProgress.textContent = "Publishing Progress: " + projectProgressSummary.publishingProgress;

        const currentFocus = document.createElement("p");
        currentFocus.textContent = "Current Focus: " + projectProgressSummary.currentFocus;

        const nextTool = document.createElement("p");
        nextTool.textContent = "Recommended Next Tool: " + projectProgressSummary.recommendedNextTool;

        article.append(title, projectProgress, publishingProgress, currentFocus, nextTool);
        return article;
    }

    function updateToolCount() {
        if (!toolCount) {
            return;
        }
        const visibleCount = roleAwareTools().length;
        const totalCount = toolGroups.flatMap((group) => group.tools).length;
        toolCount.textContent = `Tool Count: ${visibleCount}/${totalCount}`;
    }

    function createGroupLabel(groupName, visibleText = groupName) {
        const label = document.createElement("span");
        label.className = "content-cluster";

        const swatch = document.createElement("span");
        swatch.className = "brand-color-swatch " + groupSwatch(groupName);
        swatch.setAttribute("role", "img");
        swatch.setAttribute("aria-label", groupName + " group color");
        swatch.title = groupName + " color";

        const text = document.createElement("span");
        text.textContent = visibleText;

        label.append(swatch, text);
        return label;
    }

    function createToolCard(tool, options = {}) {
        const article = document.createElement("article");
        article.className = `control-card ${groupClass(tool.group)}`;
        article.dataset.mascot = tool.mascot;
        article.dataset.toolboxRole = tool.adminOnly ? "admin" : tool.hidden ? "hidden" : tool.planned ? "planned" : "creator";

        const media = document.createElement("div");
        media.className = "card-media";
        const mediaLink = document.createElement("a");
        mediaLink.className = "card-media-link";
        mediaLink.href = tool.href;
        mediaLink.setAttribute("aria-label", "Open " + tool.title);
        const image = document.createElement("img");
        image.src = tool.image;
        image.alt = tool.title + " preview";
        mediaLink.append(image);
        media.append(mediaLink);

        const body = document.createElement("div");
        body.className = "card-body";

        const categoryText = tool.subgroup ? `${tool.group} - ${tool.subgroup}` : tool.group;
        const badgeCluster = createGroupLabel(tool.group, categoryText);
        const badge = document.createElement("object");
        badge.data = "../assets/theme-v2/images/badges/" + badgeName(tool) + ".png";
        badge.type = "image/png";
        badge.width = 48;
        badge.height = 48;
        badge.setAttribute("aria-label", tool.title + " badge");
        badge.textContent = tool.title + " badge";
        badgeCluster.append(badge);

        const readiness = document.createElement("span");
        readiness.className = "pill";
        readiness.dataset.toolboxReadiness = tool.status;
        readiness.textContent = tool.status;

        const title = document.createElement("h3");
        title.textContent = tool.title;

        const description = document.createElement("p");
        description.textContent = tool.description;

        const link = document.createElement("a");
        link.className = "btn";
        link.href = tool.href;
        link.textContent = tool.href.indexOf("toolbox/") === 0 || tool.href.indexOf("../toolbox/") === 0 ? "Open Tool" : "Open Page";

        if (options.showReadiness) {
            const requirements = document.createElement("p");
            requirements.textContent = `requiredForTestable: ${tool.requiredForTestable ? "yes" : "no"} | requiredForPublish: ${tool.requiredForPublish ? "yes" : "no"}`;

            const checklist = document.createElement("ul");
            tool.progressChecklist.forEach((item) => {
                const entry = document.createElement("li");
                entry.textContent = item;
                checklist.append(entry);
            });

            body.append(readiness, title, description, requirements, checklist, link, badgeCluster);
        } else {
            body.append(title, description, link, badgeCluster);
        }
        article.append(media, body);
        return article;
    }

    function createAccordion(group, isOpen, options = {}) {
        const details = document.createElement("details");
        details.className = `vertical-accordion ${group.groupClass}`;
        details.dataset.toolsAccordion = group.title;
        details.open = isOpen;

        const summary = document.createElement("summary");
        summary.append(createGroupLabel(group.title));

        const body = document.createElement("div");
        body.className = "accordion-body";

        if (group.note) {
            const note = document.createElement("p");
            note.textContent = group.note;
            body.append(note);
        }

        const grid = document.createElement("div");
        grid.className = "card-grid";

        group.tools.forEach((tool) => {
            grid.append(createToolCard(tool, options));
        });

        if (group.tools.length) {
            body.append(grid);
        }
        details.append(summary, body);
        return details;
    }

    function createToolGrid(tools) {
        const grid = document.createElement("div");
        grid.className = "card-grid";
        tools.forEach((tool) => {
            grid.append(createToolCard(tool));
        });
        return grid;
    }

    function render(mode) {
        if (mode === "grouped") {
            const accordions = getGroupedTools().map((group, position) => createAccordion(group, position === 0));
            list.replaceChildren(...accordions);
        } else if (mode === "progress") {
            const accordions = getProgressGroups().map((group) => createAccordion(group, true, { showReadiness: true }));
            list.replaceChildren(createProgressSummary(), ...accordions);
        } else if (mode === "build-path") {
            const accordions = getBuildPathGroups().map((group) => createAccordion(group, true));
            list.replaceChildren(...accordions);
        } else {
            list.replaceChildren(createToolGrid(getOrderedTools(mode)));
        }
        currentMode = mode;
        setActiveButton(mode);
        updateToolCount();
    }

    if (orderButton) {
        orderButton.addEventListener("click", () => {
            const nextOrder = currentMode === "grouped"
                ? orderButton.dataset.toolsOrder
                : orderButton.dataset.toolsOrder === "ascending" ? "descending" : "ascending";
            orderButton.dataset.toolsOrder = nextOrder;
            render(nextOrder);
        });
    }

    if (groupedButton) {
        groupedButton.addEventListener("click", () => {
            render("grouped");
        });
    }

    if (progressButton) {
        progressButton.addEventListener("click", () => {
            render("progress");
        });
    }

    if (buildPathButton) {
        buildPathButton.addEventListener("click", () => {
            render("build-path");
        });
    }

    configureRoleBanner();
    render("ascending");
}());
