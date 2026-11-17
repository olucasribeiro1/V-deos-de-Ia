import { E, registerShot, clamp } from '/engine/core.js';
import { palco } from '/series/semmarca/turbo.js';
import { MODO } from '/series/semmarca/tres.js';
import { fogo, agua, muralha, navio, monstro, raio, aura, biblioteca3D, lago3D } from '/series/semmarca/magia3d.js';
registerShot('R', { kind: '3d',
  init(T) { MODO.pbr = true; const st = palco(T, { sky: ['#0a4ad0', '#3aa8ff', '#d8f4ff'], fog: [80, 300], fogColor: '#bfe4ff', keyColor: '#fff2d8', keyIntensity: 3.0, keyPos: [-20, 30, 25], ambient: 1.1, ambientSky: '#bfe0ff', shadowSize: 30, fov: 46, abertura: 0.0004, bloom: 0.45, bloomLimiar: 0.85, sat: 1.15, env: 0.4, exposicao: 0.95 });
    const ch = new T.THREE.Mesh(new T.THREE.PlaneGeometry(200, 200), new T.THREE.MeshStandardMaterial({ color: '#5ab84a' })); ch.rotation.x = -Math.PI / 2; ch.receiveShadow = true; st.add(ch);
    const f = fogo(T, [0, 1.4, 0], [4, 1.4, 0]); const a = agua(T, [10, 1.2, 0]); const mu = muralha(T, 20, 0); const nv = navio(T, 30, 0); const mo = monstro(T, 44, -2, 0.8); const ra = raio(T, [44, 30, -2], [44, 7, -2]); const au = aura(T, [52, 0, 2]);
    st.add(f, a, mu, nv, mo, ra, au); const bib = biblioteca3D(T); bib.position.set(0, 0, -60); st.add(bib); return { stage: st, st, f, a, mu, nv, mo, ra, au, bib }; },
  draw(s, lt, info, T) { const c = s.st.camera; const cams = [[2, 2, 8, 2, 1.5, 0], [10, 2, 6, 10, 1.4, 0], [20, 3, 10, 20, 1.6, 0], [30, 3, 12, 30, 2.5, 0], [44, 8, 26, 44, 7, -2], [0, 2.5, -52, 0, 3, -60]];
    const i = Math.min(5, Math.floor(lt / 0.667)); const k = cams[i]; c.position.set(k[0], k[1], k[2]); c.lookAt(k[3], k[4], k[5]); c.fov = 46; c.updateProjectionMatrix();
    s.f.update(lt, 1); s.a.update(lt, 1); s.mu.update(lt, clamp(lt / 1.3)); s.nv.update(lt, 1); s.mo.update(lt, 1); s.ra.update(lt, 1); s.au.update(lt, 1); s.bib.update(lt); s.st.foco(8, 0.0003); s.st.tick(lt); } });
