"""Validación estructural sin dependencias; no prueba integración con Copilot."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
agent_files = sorted((ROOT / '.github/agents').glob('*.agent.md'))
skill_files = sorted((ROOT / '.github/skills').glob('*/SKILL.md'))
errors = []
names = set()
texts = []
for path in agent_files + skill_files:
    text = path.read_text(encoding='utf-8')
    match = re.match(r'^---\n(.*?)\n---\n', text, re.S)
    if not match:
        errors.append(f'{path.name}: frontmatter ausente')
        continue
    header = match.group(1)
    for key in ('name', 'description'):
        if not re.search(rf'^{key}: .+', header, re.M):
            errors.append(f'{path.name}: falta {key}')
    if path in agent_files:
        name_match = re.search(r'^name: (.+)$', header, re.M)
        if name_match:
            name = name_match.group(1).strip()
            if name in names:
                errors.append(f'Nombre duplicado: {name}')
            names.add(name)
            if path.name != f'{name}.agent.md':
                errors.append(f'{path.name}: nombre no coincide')
        texts.append((path, header))
    else:
        if f'name: {path.parent.name}\n' not in header + '\n':
            errors.append(f'{path}: nombre de skill no coincide')
for path, header in texts:
    targets = re.findall(r'^\s+agent: (.+)$', header, re.M)
    allowed = re.search(r'^agents: \[(.*?)\]$', header, re.M)
    if allowed:
        targets += re.findall(r"'([^']+)'", allowed.group(1))
    for target in targets:
        if target.strip() not in names:
            errors.append(f'{path.name}: destino inexistente {target}')
if len(agent_files) != 8 or len(skill_files) != 9:
    errors.append(f'Conteo inesperado: {len(agent_files)} agentes, {len(skill_files)} skills')
if errors:
    raise SystemExit('\n'.join(errors))
print(f'OK: {len(agent_files)} agentes, {len(skill_files)} skills y destinos resueltos.')
print('No valida esquema YAML completo, herramientas ni descubrimiento en VS Code.')
