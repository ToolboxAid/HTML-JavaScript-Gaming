\
        # Apply the roadmap update from this ZIP, then run:
        git diff -- docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md

        Select-String -Path docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md -Pattern "templates/` folder evaluated for keep vs move vs future-delete","Future: relocate `templates/vector-native-arcade` to `tools/templates/`"

        git status --short -- docs/dev/roadmaps/MASTER_ROADMAP_ENGINE.md docs/pr/ROADMAP_UPDATE_TEMPLATES_EVALUATED_AND_DEFERRED_RELOCATION.md docs/dev/commit_comment.txt
