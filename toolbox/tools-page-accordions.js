import { createProjectWorkspaceMockRepository } from "./project-workspace/project-workspace-mock-repository.js";

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
    const projectDataMenu = document.querySelector("[data-project-data-menu]");
    const projectDataStatus = document.querySelector("[data-project-data-status]");
    const toolCount = document.querySelector("[data-tools-count]");
    const urlRole = new URLSearchParams(window.location.search).get("role");
    const toolboxRole = urlRole === "admin" ? "admin" : urlRole === "user" ? "creator" : "guest";
    const projectWorkspaceRepository = createProjectWorkspaceMockRepository();
    projectWorkspaceRepository.resetProjectData();
    let currentMode = "ascending";
    const toolboxStatusModel = Object.freeze(["Ready", "Wireframe", "Under Construction", "Planned", "Hidden", "Deprecated"]);
    const statusLabelMap = Object.freeze({
        complete: "Ready",
        ready: "Wireframe",
        "in-progress": "Under Construction",
        locked: "Planned"
    });
    const progressRequirements = Object.freeze({
        "Game Design": ["Project Workspace"],
        "Game Configuration": ["Game Design"],
        "Build Game": ["Game Configuration"],
        "Game Testing": ["Build Game"],
        Publish: ["Game Testing"],
        Marketplace: ["Publish"],
        Community: ["Publish"],
        Languages: ["Publish"],
        Cloud: ["Publish"]
    });
    const toolGroups = [
        {
                "group": "Create",
                "tools": [
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
                                ],
                                "capabilityLabel": "Planned object types",
                                "childCapabilities": [
                                        "Vector",
                                        "Sprite",
                                        "Character",
                                        "Enemy",
                                        "Interactive"
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
                                ],
                                "capabilityLabel": "Planned world types",
                                "childCapabilities": [
                                        "Vector",
                                        "Tilemap",
                                        "Isometric",
                                        "Hex"
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
                        },
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
                "group": "Build",
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
                        },
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
                        }
                ]
        },
        {
                "group": "Media",
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
                "group": "Test",
                "tools": [
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
                "group": "Share",
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
                        }
                ]
        },
        {
                "group": "Account",
                "tools": [
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
        }
];
    const groupClassMap = {
        "Create": "tool-group-create",
        "Build": "tool-group-build",
        "Content": "tool-group-content",
        "Media": "tool-group-media",
        "Test": "tool-group-test",
        "Share": "tool-group-share",
        "Account": "tool-group-account"
};
    const groupSwatchMap = {
        "Create": "swatch-pink",
        "Build": "swatch-gray",
        "Content": "swatch-orange",
        "Media": "swatch-red",
        "Test": "swatch-blue",
        "Share": "swatch-gold",
        "Account": "swatch-blue"
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
    function getProjectProgressSummary() {
        const activeProject = projectWorkspaceRepository.getActiveProject();
        const progress = projectWorkspaceRepository.getProjectProgress();
        return {
            activeProjectName: activeProject?.name || "No active project",
            projectProgress: progress.projectProgress,
            publishingProgress: progress.publishingProgress,
            currentFocus: progress.currentFocus,
            recommendedNextTool: progress.recommendedNextTool
        };
    }
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
        }
};
    const buildPathGroups = [
        {
                "title": "Project Workspace",
                "groupClass": "tool-group-build",
                "note": "Start with the single project surface that coordinates current focus, readiness, and recommended next tool.",
                "tools": [
                        "Project Workspace"
                ]
        },
        {
                "title": "Game Design",
                "groupClass": "tool-group-build",
                "note": "Define gameplay, rules, player experience, and the requirements that shape the build path.",
                "tools": [
                        "Game Design"
                ]
        },
        {
                "title": "Game Configuration",
                "groupClass": "tool-group-build",
                "note": "Set the release profile, debug policy, and playable gate before the required tool path is treated as ready.",
                "tools": [
                        "Game Configuration"
                ]
        },
        {
                "title": "Required Tool Path",
                "groupClass": "tool-group-create",
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
                "groupClass": "tool-group-build",
                "note": "Build Game is the package and playable-output checkpoint for this wireframe.",
                "tools": [
                        "Build Game"
                ]
        },
        {
                "title": "Game Testing",
                "groupClass": "tool-group-test",
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
                "groupClass": "tool-group-share",
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
    const progressOrder = toolboxStatusModel;

    function compareByTitle(left, right) {
        return left.title.localeCompare(right.title);
    }

    function compareByGroup(left, right) {
        return left.group.localeCompare(right.group);
    }

    function normalizeToolStatus(tool) {
        if (tool.status === "Deprecated") {
            return "Deprecated";
        }
        if (tool.hidden === true) {
            return "Hidden";
        }
        return statusLabelMap[tool.status] || tool.status || "Wireframe";
    }

    function isVisibleForRole(tool) {
        if (toolboxRole === "admin") {
            return true;
        }
        return tool.adminOnly !== true && tool.hidden !== true && tool.planned !== true;
    }

    function visibleToolGroups() {
        return toolGroups.map((toolGroup) => ({
            ...toolGroup,
            tools: toolGroup.tools.filter(isVisibleForRole).sort(compareByTitle)
        })).filter((toolGroup) => toolGroup.tools.length > 0).sort(compareByGroup);
    }

    function roleAwareTools() {
        return visibleToolGroups().flatMap((group) => group.tools.map((tool) => {
            const progress = progressModel[tool.title] || defaultProgress;
            const mergedTool = {
                ...tool,
                group: group.group,
                ...progress
            };
            return {
                ...mergedTool,
                requires: progressRequirements[tool.title] || [],
                status: normalizeToolStatus(mergedTool)
            };
        }));
    }

    function configureRoleBanner() {
        if (!roleBanner) {
            return;
        }
        const nextRole = toolboxRole === "admin" ? "user" : toolboxRole === "creator" ? "admin" : "user";
        const nextUrl = new URL(window.location.href);
        nextUrl.searchParams.set("role", nextRole);
        roleBanner.href = nextUrl.pathname + nextUrl.search + nextUrl.hash;
        if (projectDataMenu) {
            projectDataMenu.hidden = toolboxRole !== "admin";
            if (toolboxRole !== "admin") {
                projectDataMenu.removeAttribute("open");
            }
        }
        if (toolboxRole === "admin") {
            roleBanner.textContent = "ADMIN VIEW • Planned tools visible • Switch to Creator View";
        } else if (toolboxRole === "creator") {
            roleBanner.textContent = "CREATOR VIEW • Project tools enabled • Switch to Admin View";
        } else {
            roleBanner.textContent = "GUEST VIEW • Preview only • Sign in to create";
        }
    }

    function configureProjectDataActions() {
        if (!projectDataMenu || toolboxRole !== "admin") {
            return;
        }

        projectDataMenu.addEventListener("click", (event) => {
            const actionButton = event.target.closest("[data-project-data-action]");
            if (!actionButton) {
                return;
            }

            let actionLabel = "Project Data updated";

            if (actionButton.dataset.projectDataAction === "reset") {
                projectWorkspaceRepository.resetProjectData();
                actionLabel = "Project Data reset";
            } else if (actionButton.dataset.projectDataAction === "seed") {
                projectWorkspaceRepository.seedDemoProject();
                actionLabel = "Demo Project seeded";
            } else if (actionButton.dataset.projectDataAction === "clear") {
                projectWorkspaceRepository.clearTestData();
                actionLabel = "Test data cleared";
            }

            if (projectDataStatus) {
                const activeProject = projectWorkspaceRepository.getActiveProject();
                projectDataStatus.textContent = `${actionLabel}. Active project: ${activeProject?.name || "none"}.`;
            }

            render(currentMode);
        });
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
            groupClass: "tool-group-build"
        })).filter((group) => group.tools.length > 0);
    }

    function getBuildPathGroups() {
        const availableTools = roleAwareTools();
        const activeProject = projectWorkspaceRepository.getActiveProject();
        return buildPathGroups.map((group) => ({
            title: group.title,
            tools: group.tools.map((title) => availableTools.find((tool) => tool.title === title)).filter(Boolean),
            groupClass: group.groupClass,
            note: group.title === "Project Workspace"
                ? `${group.note} Active mock project: ${activeProject?.name || "none"}.`
                : group.note
        }));
    }

    function createProgressSummary() {
        const projectProgressSummary = getProjectProgressSummary();
        const article = document.createElement("article");
        article.className = "callout";

        const title = document.createElement("h3");
        title.textContent = "Project Progress";

        const activeProject = document.createElement("p");
        activeProject.textContent = "Active Project: " + projectProgressSummary.activeProjectName;

        const projectProgress = document.createElement("p");
        projectProgress.textContent = "Project Progress: " + projectProgressSummary.projectProgress;

        const publishingProgress = document.createElement("p");
        publishingProgress.textContent = "Publishing Progress: " + projectProgressSummary.publishingProgress;

        const currentFocus = document.createElement("p");
        currentFocus.textContent = "Current Focus: " + projectProgressSummary.currentFocus;

        const nextTool = document.createElement("p");
        nextTool.textContent = "Recommended Next Tool: " + projectProgressSummary.recommendedNextTool;

        article.append(title, activeProject, projectProgress, publishingProgress, currentFocus, nextTool);
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

    function createChildCapabilities(tool) {
        if (!Array.isArray(tool.childCapabilities) || tool.childCapabilities.length === 0) {
            return null;
        }
        const capabilities = document.createElement("div");
        capabilities.className = "content-stack content-stack--compact";
        capabilities.dataset.childCapabilities = tool.title;

        const label = document.createElement("p");
        label.textContent = tool.capabilityLabel || "Planned child capabilities";

        const list = document.createElement("ul");
        list.setAttribute("aria-label", tool.title + " child capabilities");
        tool.childCapabilities.forEach((capability) => {
            const item = document.createElement("li");
            item.textContent = capability;
            list.append(item);
        });

        capabilities.append(label, list);
        return capabilities;
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
        const childCapabilities = createChildCapabilities(tool);

        const link = document.createElement("a");
        link.className = "btn";
        link.href = tool.href;
        link.textContent = tool.href.indexOf("toolbox/") === 0 || tool.href.indexOf("../toolbox/") === 0 ? "Open Tool" : "Open Page";

        if (options.showReadiness) {
            const requirements = document.createElement("p");
            requirements.textContent = `requiredForTestable: ${tool.requiredForTestable ? "yes" : "no"} | requiredForPublish: ${tool.requiredForPublish ? "yes" : "no"}`;

            const requires = document.createElement("p");
            requires.textContent = `requires: ${tool.requires.length ? tool.requires.join(", ") : "none"}`;

            const checklist = document.createElement("ul");
            tool.progressChecklist.forEach((item) => {
                const entry = document.createElement("li");
                entry.textContent = item;
                checklist.append(entry);
            });

            const progressParts = [readiness, title, description];
            if (childCapabilities) {
                progressParts.push(childCapabilities);
            }
            progressParts.push(requirements, requires, checklist, link, badgeCluster);
            body.append(...progressParts);
        } else {
            const cardParts = [title, description];
            if (childCapabilities) {
                cardParts.push(childCapabilities);
            }
            cardParts.push(link, badgeCluster);
            body.append(...cardParts);
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
    configureProjectDataActions();
    render("ascending");
}());
