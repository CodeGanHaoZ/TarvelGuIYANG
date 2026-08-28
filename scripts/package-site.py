"""Windows equivalent of the Sites Bash packaging helper (no Bash on host).

Stages only successful dist output plus exact .openai/hosting.json, never source.
Keeps the same required archive entries as package-site.sh.
"""
from pathlib import Path
import sys
import tarfile

project = Path(__file__).resolve().parents[1]
archive = Path(sys.argv[1]).resolve()
build = project / 'dist'
hosting = project / '.openai' / 'hosting.json'
assert (build / 'server' / 'index.js').is_file(), 'Missing server build'
assert hosting.is_file(), 'Missing hosting metadata'
archive.parent.mkdir(parents=True, exist_ok=True)
with tarfile.open(archive, 'w:gz') as output:
    for entry in build.rglob('*'):
        if entry.is_file() and entry.relative_to(build).as_posix() != '.openai/hosting.json':
            output.add(entry, arcname='dist/' + entry.relative_to(build).as_posix())
    output.add(hosting, arcname='dist/.openai/hosting.json')
    if (project / 'drizzle').is_dir():
        output.add(project / 'drizzle', arcname='dist/.openai/drizzle')
with tarfile.open(archive) as output:
    names = set(output.getnames())
    assert 'dist/server/index.js' in names
    assert 'dist/.openai/hosting.json' in names
print(str(archive))
