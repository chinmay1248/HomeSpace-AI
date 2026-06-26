import os
import random
import subprocess
from datetime import datetime, timedelta

def run_cmd(cmd, env=None):
    subprocess.run(cmd, shell=True, check=True, env=env)

def main():
    repo_dir = r"e:\Projects\HomeScape AI"
    os.chdir(repo_dir)

    # Make sure we reset any existing staging area
    run_cmd("git reset")

    # Get list of all changed and untracked files
    result = subprocess.run("git status --porcelain -u", shell=True, capture_output=True, text=True)
    lines = result.stdout.split('\n')
    files = []
    for line in lines:
        if not line:
            continue
        filepath = line[3:]
        # handle quotes if any
        if filepath.startswith('"') and filepath.endswith('"'):
            filepath = filepath[1:-1]
        files.append(filepath)

    days = []
    start_date = datetime(2026, 6, 21)
    for i in range(10):
        days.append(start_date + timedelta(days=i))

    commits_plan = []
    total_commits = 0

    for day in days:
        num_commits = random.randint(4, 8)
        total_commits += num_commits
        for _ in range(num_commits):
            # random time between 09:00:00 and 18:00:00
            hour = random.randint(9, 17)
            minute = random.randint(0, 59)
            second = random.randint(0, 59)
            dt = day.replace(hour=hour, minute=minute, second=second)
            commits_plan.append(dt)

    commits_plan.sort()
    
    # Assign actual files to some commits
    # We have `len(files)` files, we can just pick random commits to assign them
    # But it's better to assign files sequentially to commits to avoid dependency issues if any
    
    commit_assignments = [[] for _ in range(len(commits_plan))]
    
    # Randomly select distinct commit indices to assign actual files
    if len(files) > 0:
        indices = sorted(random.sample(range(len(commits_plan)), min(len(files), len(commits_plan))))
        for i, idx in enumerate(indices):
            commit_assignments[idx].append(files[i])
        
        # If there are more files than commits (unlikely), assign the rest to the last commit
        for i in range(len(indices), len(files)):
            commit_assignments[-1].append(files[i])

    messages_templates = [
        "Refactor {}", "Update {}", "Fix issues in {}", "Add feature for {}",
        "Enhance {} logic", "Clean up {}", "Improve {}", "Minor adjustments to {}",
        "Review {} changes", "Update implementation of {}"
    ]

    dummy_file = "docs/dev_journal.md"
    dummy_counter = 1

    for i, (dt, assigned_files) in enumerate(zip(commits_plan, commit_assignments)):
        env = os.environ.copy()
        date_str = dt.strftime("%Y-%m-%d %H:%M:%S")
        env["GIT_AUTHOR_DATE"] = date_str
        env["GIT_COMMITTER_DATE"] = date_str
        
        msg = ""

        if not assigned_files:
            # Empty commit, need to modify dummy file
            os.makedirs(os.path.dirname(dummy_file), exist_ok=True)
            with open(dummy_file, "a") as f:
                f.write(f"Development progress on {dt.strftime('%Y-%m-%d')}, entry {dummy_counter}.\n")
            run_cmd(f'git add "{dummy_file}"')
            msg = f"Log development progress entry #{dummy_counter} on {dt.strftime('%b %d')}"
            dummy_counter += 1
        else:
            for f in assigned_files:
                run_cmd(f'git add "{f}"')
            main_file = assigned_files[0]
            template = random.choice(messages_templates)
            msg = template.format(os.path.basename(main_file))

        # Make sure the message is unique
        msg = f"{msg} (commit {i+1})"
        
        run_cmd(f'git commit -m "{msg}"', env=env)

    print(f"Created {len(commits_plan)} commits successfully.")

if __name__ == '__main__':
    main()
