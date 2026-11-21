#!/usr/bin/env node
// QUADRO DE PRODUÇÃO + WATCHDOG ANTI-TRAVAMENTO (sem dependências).
// Estado em ./.studio/board.json (por projeto). Logs em ./.studio/log.txt.
import fs from 'node:fs';
import path from 'node:path';

const DIR = path.resolve('.studio');
const FILE = path.join(DIR, 'board.json');
const STATES = ['PENDENTE', 'EM EXECUÇÃO', 'AGUARDANDO DEPENDÊNCIA', 'EM TESTE', 'BLOQUEADO', 'FALHOU', 'APROVADO', 'CONCLUÍDO'];
const GATES = {A: 'pré-produção', B: 'assets', C: 'animação', D: 'áudio', E: 'pré-render', F: 'render final', G: 'auditoria final'};
const MAX_ATTEMPTS = 3;

const [cmd, ...rest] = process.argv.slice(2);
const flag = (n, d) => (rest.includes(`--${n}`) ? rest[rest.indexOf(`--${n}`) + 1] : d);
const has = (n) => rest.includes(`--${n}`);
const now = () => new Date().toISOString();
const load = () => (fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, 'utf8')) : null);
const save = (b) => {
  fs.mkdirSync(DIR, {recursive: true});
  fs.writeFileSync(FILE, JSON.stringify(b, null, 2));
};
const log = (m) => {
  fs.mkdirSync(DIR, {recursive: true});
  fs.appendFileSync(path.join(DIR, 'log.txt'), `[${now()}] ${m}\n`);
};
const need = () => {
  const b = load();
  if (!b) {
    console.error('Quadro não iniciado. Rode: studio-board.mjs init "<projeto>"');
    process.exit(2);
  }
  return b;
};

function check(b, stallMin) {
  const alerts = [];
  const byId = Object.fromEntries(b.tasks.map((t) => [t.id, t]));
  for (const t of b.tasks) {
    if (t.status === 'EM EXECUÇÃO') {
      const pending = (t.deps ?? []).filter((d) => !['CONCLUÍDO', 'APROVADO'].includes(byId[d]?.status));
      if (pending.length) alerts.push(`⚠ ${t.id} em execução antes das dependências: ${pending.join(', ')}`);
      let last = Date.parse(t.updated);
      if (t.heartbeat && fs.existsSync(t.heartbeat)) last = Math.max(last, fs.statSync(t.heartbeat).mtimeMs);
      const idle = (Date.now() - last) / 60000;
      if (idle > stallMin) alerts.push(`⏸ ${t.id} SUSPEITA DE TRAVAMENTO: ${idle.toFixed(0)} min sem progresso (heartbeat: ${t.heartbeat ?? 'nenhum'}) — peça diagnóstico ao ${t.owner}`);
    }
    if (t.status === 'BLOQUEADO' && !t.note) alerts.push(`⛔ ${t.id} bloqueado SEM diagnóstico registrado`);
    if (t.status === 'FALHOU' && (t.attempts ?? 0) < MAX_ATTEMPTS) alerts.push(`✗ ${t.id} falhou (tentativa ${t.attempts}/${MAX_ATTEMPTS}): ${t.note ?? 'sem nota'} — diagnosticar antes de repetir`);
  }
  return alerts;
}

switch (cmd) {
  case 'init': {
    const b = load() ?? {project: rest[0] ?? path.basename(process.cwd()), created: now(), tasks: [], gates: {}};
    save(b);
    log(`init ${b.project}`);
    console.log(`Quadro: ${FILE}`);
    break;
  }
  case 'add': {
    const b = need();
    const id = rest[0];
    if (b.tasks.some((t) => t.id === id)) throw new Error(`tarefa ${id} já existe`);
    const t = {
      id,
      owner: flag('owner', 'diretor'),
      goal: flag('goal', ''),
      files: (flag('files', '') || '').split(',').filter(Boolean),
      deps: (flag('deps', '') || '').split(',').filter(Boolean),
      done: flag('done', ''),
      heartbeat: flag('heartbeat'),
      status: 'PENDENTE',
      attempts: 0,
      created: now(),
      updated: now(),
    };
    b.tasks.push(t);
    save(b);
    log(`add ${id} (${t.owner}) ${t.goal}`);
    console.log(`+ ${id} [${t.owner}] ${t.goal}`);
    break;
  }
  case 'set': {
    const b = need();
    const [id, status] = rest;
    const t = b.tasks.find((x) => x.id === id);
    if (!t) throw new Error(`tarefa ${id} não existe`);
    if (!STATES.includes(status)) throw new Error(`estado inválido. Use: ${STATES.join(' | ')}`);
    if (status === 'CONCLUÍDO' && !flag('evidence')) {
      console.error('✗ CONCLUÍDO exige --evidence "<prova de execução>" (arquivo, teste, métrica).');
      process.exit(1);
    }
    if (status === 'EM EXECUÇÃO') {
      const pend = t.deps.filter((d) => !['CONCLUÍDO', 'APROVADO'].includes(b.tasks.find((x) => x.id === d)?.status));
      if (pend.length && !has('force')) {
        t.status = 'AGUARDANDO DEPENDÊNCIA';
        t.updated = now();
        save(b);
        console.log(`… ${id} aguardando: ${pend.join(', ')} (use --force para ignorar)`);
        break;
      }
    }
    if (status === 'FALHOU') t.attempts = (t.attempts ?? 0) + 1;
    t.status = status === 'FALHOU' && t.attempts >= MAX_ATTEMPTS ? 'BLOQUEADO' : status;
    if (flag('note')) t.note = flag('note');
    if (flag('evidence')) t.evidence = flag('evidence');
    if (flag('test')) t.test = flag('test');
    t.updated = now();
    save(b);
    log(`set ${id} ${t.status}${t.note ? ' — ' + t.note : ''}`);
    if (t.status === 'BLOQUEADO' && status === 'FALHOU') console.log(`⛔ ${id} falhou ${t.attempts}× → BLOQUEADO. Escale ao Diretor-Geral com diagnóstico e alternativas.`);
    else console.log(`${id} → ${t.status}`);
    break;
  }
  case 'list': {
    const b = need();
    console.log(`Projeto: ${b.project}`);
    for (const t of b.tasks) console.log(`  ${t.id.padEnd(6)} ${t.status.padEnd(24)} ${t.owner.padEnd(22)} ${t.goal}${t.note ? `  (${t.note})` : ''}`);
    const gs = Object.entries(b.gates ?? {});
    if (gs.length) console.log('Gates: ' + gs.map(([g, v]) => `${g}:${v.pass ? '✓' : '✗'}`).join(' '));
    break;
  }
  case 'watch': {
    const b = need();
    const alerts = check(b, Number(flag('stall-min', '10')));
    const counts = STATES.map((s) => [s, b.tasks.filter((t) => t.status === s).length]).filter(([, n]) => n);
    console.log(`${b.project}: ` + counts.map(([s, n]) => `${s} ${n}`).join(' · '));
    alerts.forEach((a) => console.log(a));
    if (!alerts.length) console.log('✓ sem travamentos ou bloqueios');
    process.exit(alerts.length ? 3 : 0);
  }
  case 'gate': {
    const b = need();
    const g = rest[0];
    if (!GATES[g]) throw new Error(`gate inválido (${Object.keys(GATES).join(',')})`);
    b.gates[g] = {pass: has('pass'), reason: flag('fail') ?? flag('pass') ?? '', at: now()};
    save(b);
    log(`gate ${g} ${b.gates[g].pass ? 'APROVADO' : 'REPROVADO'} ${b.gates[g].reason}`);
    console.log(`Gate ${g} (${GATES[g]}): ${b.gates[g].pass ? '✓ aprovado' : '✗ reprovado'}`);
    break;
  }
  case 'log':
    console.log(fs.existsSync(path.join(DIR, 'log.txt')) ? fs.readFileSync(path.join(DIR, 'log.txt'), 'utf8').split('\n').slice(-30).join('\n') : '(vazio)');
    break;
  case 'summary': {
    // usado pelo hook SessionStart: silencioso se não houver quadro
    const b = load();
    if (!b) process.exit(0);
    const open = b.tasks.filter((t) => !['CONCLUÍDO', 'APROVADO'].includes(t.status));
    const alerts = check(b, 10);
    if (!open.length && !alerts.length) process.exit(0);
    console.log(`[video-pov-studio] Quadro "${b.project}": ${open.length} tarefa(s) abertas.`);
    open.slice(0, 8).forEach((t) => console.log(`  ${t.id} ${t.status} — ${t.goal}`));
    alerts.forEach((a) => console.log('  ' + a));
    break;
  }
  default:
    console.log(`studio-board.mjs — quadro de produção do video-pov-studio
  init "<projeto>"
  add <id> --owner <agente> --goal "<objetivo>" [--deps A,B] [--files x,y] [--done "<critério>"] [--heartbeat <arquivo>]
  set <id> "<ESTADO>" [--note "..."] [--evidence "..."] [--test "..."] [--force]
  list | watch [--stall-min 10] | gate <A-G> --pass|--fail "<motivo>" | log | summary
Estados: ${STATES.join(' · ')}`);
}
