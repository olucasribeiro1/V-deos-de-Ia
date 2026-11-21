import React from 'react';
import {mat, PAL} from '../../library/materials';
import * as F from '../../library/furniture';
import {Slab, Wall} from './Walls';
import {Door, Window} from './Door';
import {StaticBatch} from '../effects/StaticBatch';
import {TvScreen, type TvKind} from '../props/TvScreen';

/**
 * CENÁRIO REUTILIZÁVEL: apartamento do Rafael (7º andar).
 * Planta (metros, Y para cima, olhar padrão para -Z = norte):
 *   Corredor  x[1.5,4]  z[-8,0]   — porta de entrada na parede sul (z=0)
 *   Sala+cozinha x[-6,1.5] z[-8,-3] — janela grande na parede norte
 *   Quarto de hóspedes x[-2.5,1.5] z[-3,0]
 *   Banheiro x[-6,-2.5] z[-3,0]
 * Pontos nomeados, navegação e alvos de olhar ficam em apartmentData.ts.
 */
export {SPOTS, LOOKS} from './apartmentData';

export type ApartmentState = {
  entranceOpen?: number;
  entranceShake?: number;
  entranceLocks?: number;
  chain?: boolean;
  bedroomDoorOpen?: number;
  bathroomDoorOpen?: number;
  lightsOn?: number; // 0..1
  tvOn?: number;
  bagAt?: 'entrance' | 'sofa' | 'bedroom' | 'hidden';
  supplies?: number; // 0..1 quantidade de suprimentos organizados na mesa
  barricade?: number; // 0..1 móvel empurrado contra a porta
  blinds?: number;
  tv?: TvKind;
  knifeTaken?: boolean;
  crash?: number; // batida na rua 0..1 (undefined = já aconteceu se caos ≥ 0.3)
  faucet?: number; // 0..1 água saindo
  fill?: number; // 0..1 garrafa sob a torneira
  filled?: number; // garrafas cheias na bancada
  keysOnMat?: boolean; // chave reserva sob o capacho (corredor)
};

export const Apartment: React.FC<{state?: ApartmentState; t?: number}> = React.memo(({state = {}, t = 0}) => {
  const {
    entranceOpen = 0,
    entranceShake = 0,
    entranceLocks = 1,
    chain = false,
    bedroomDoorOpen = 75,
    bathroomDoorOpen = 60,
    lightsOn = 1,
    tvOn = 0,
    bagAt = 'sofa',
    supplies = 0,
    barricade = 0,
    blinds = 0.25,
    tv = 'off',
    keysOnMat = false,
    knifeTaken = false,
    faucet = 0,
    fill = 0,
    filled = 0,
  } = state;
  return (
    <group>
      <ApartmentStatic />
      {/* ---- partes dinâmicas (fora do batch) ---- */}
      <Door position={[2.75, 0, 0]} rotY={180} open={-entranceOpen} shake={entranceShake * Math.sin(t * 31) * Math.max(0, Math.sin(t * 4.2))} color="#6f5440" peephole locks={entranceLocks} chain={chain} />
      <Door position={[-1.95, 0, -3]} rotY={180} open={-bedroomDoorOpen} />
      <Door position={[-3.75, 0, -3]} rotY={0} open={-bathroomDoorOpen} />
      <Door position={[4.5, 0, 2.3]} rotY={180} color="#5e6a72" />
      <F.CeilingLamp position={[2.9, 0, 1.15]} on={lightsOn} />
      <F.BrothersPhoto position={[-0.5, 1.55, -3.08]} rotY={180} />
      <F.KnifeBlock position={[-5.58, 0.915, -4.75]} rotY={90} taken={knifeTaken} />
      <F.SinkWater faucet={faucet} fill={fill} filled={filled} />
      <Window position={[-3.4, 1.6, -8]} width={2.8} height={1.5} blinds={blinds} />
      <Window position={[2.7, 1.55, -8]} width={1.0} height={1.3} />
      <Window position={[-0.8, 1.5, 0]} rotY={180} width={1.2} height={1.2} blinds={0.6} />
      <F.TvStand position={[-0.4, 0, -7.7]} tvOn={tv === 'off' ? tvOn : 0} />
      <group position={[-0.4, 0.88, -7.715]}>
        <TvScreen kind={tv} t={t} />
      </group>
      <F.FloorLamp position={[1.15, 0, -3.4]} on={lightsOn} />
      <F.CeilingLamp position={[-0.2, 0, -5.4]} on={lightsOn} />
      <F.CeilingLamp position={[-4.2, 0, -5.4]} on={lightsOn} />
      <F.CeilingLamp position={[2.75, 0, -2]} on={lightsOn} />
      {/* suprimentos organizados na mesa (cresce com o progresso da preparação) */}
      {Array.from({length: Math.round(supplies * 12)}).map((_, i) =>
        i % 3 === 0 ? (
          <F.WaterBottle key={i} position={[-4.05 + (i % 6) * 0.16, 0.76, -4.85 + Math.floor(i / 6) * 0.2]} />
        ) : (
          <F.Can key={i} position={[-4.05 + (i % 6) * 0.16, 0.76, -4.85 + Math.floor(i / 6) * 0.2]} color={i % 2 ? '#9b2e24' : '#6a7a3a'} />
        ),
      )}
      {/* cômoda do corredor → barricada: desliza da parede leste até a frente da porta (barricade 0..1) */}
      <F.Dresser
        position={[3.62 + (2.75 - 3.62) * barricade, 0, -1.5 + (-0.42 + 1.5) * barricade]}
        rotY={-90 + 270 * barricade}
      />
      {/* capacho do corredor + chave reserva */}
      <F.Rug position={[2.75, 0, 0.55]} w={0.9} d={0.55} color="#5a4a3a" />
      {keysOnMat && <F.Keys position={[2.9, 0.012, 0.5]} rotY={30} />}
      {/* bolsa do protagonista */}
      {bagAt === 'entrance' && <F.DuffelBag position={[3.3, 0, -0.9]} rotY={20} />}
      {bagAt === 'sofa' && <F.DuffelBag position={[0.75, 0.45, -3.65]} rotY={-5} />}
      {bagAt === 'bedroom' && <F.DuffelBag position={[-0.6, 0, -2.5]} rotY={40} />}
    </group>
  );
}, (a, b) => JSON.stringify(a.state) === JSON.stringify(b.state) && (a.state?.tv ?? 'off') === 'off' && (b.state?.tv ?? 'off') === 'off' && !a.state?.entranceShake && !b.state?.entranceShake);

/** Tudo que nunca se move: fundido em poucos draw calls (StaticBatch). Memo → nunca re-renderiza. */
const ApartmentStatic = React.memo(() => {
  const wallL = mat(PAL.wallWarm);
  const wallH = mat(PAL.wallCool);
  const wallB = mat(PAL.wallBath);
  const wood = mat(PAL.floorWood);
  const tile = mat(PAL.tile);
  const ceil = mat(PAL.ceiling);
  const H = 2.7;
  return (
    <StaticBatch>
      <Slab x={[-6, 4]} z={[-8, -3]} material={wood} />
      <Slab x={[1.5, 4]} z={[-3, 0]} material={wood} />
      <Slab x={[-2.5, 1.5]} z={[-3, 0]} material={mat(PAL.floorWoodDark)} />
      <Slab x={[-6, -2.5]} z={[-3, 0]} material={tile} y={0.002} />
      <Slab x={[-6, 4]} z={[-8, 0]} y={H} material={ceil} ceiling />
      <Wall a={[-6, -8]} b={[4, -8]} material={wallL} openings={[{from: 1.2, to: 4.0, bottom: 0.85, top: 2.35}, {from: 8.2, to: 9.2, bottom: 0.9, top: 2.2}]} />
      <Wall a={[-6, 0]} b={[4, 0]} material={wallH} openings={[{from: 4.6, to: 5.8, bottom: 0.9, top: 2.1}, {from: 8.3, to: 9.2, bottom: 0, top: 2.1}, {from: 1.2, to: 1.8, bottom: 1.6, top: 2.2}]} />
      <Wall a={[-6, -8]} b={[-6, 0]} material={wallL} />
      <Wall a={[4, -8]} b={[4, 0]} material={wallH} />
      <Wall a={[1.5, -8]} b={[1.5, 0]} material={wallH} openings={[{from: 0.8, to: 4.2, bottom: 0, top: 2.3}]} />
      <Wall a={[-6, -3]} b={[1.5, -3]} material={wallL} openings={[{from: 1.8, to: 2.7, bottom: 0, top: 2.1}, {from: 3.6, to: 4.5, bottom: 0, top: 2.1}]} />
      <Wall a={[-2.5, -3]} b={[-2.5, 0]} material={wallB} />
      {/* ---- corredor do prédio (fora do apartamento) ---- */}
      <Slab x={[0.5, 6.5]} z={[0, 2.3]} material={mat('#8f9493')} />
      <Slab x={[0.5, 6.5]} z={[0, 2.3]} y={H} material={ceil} ceiling />
      <Wall a={[0.5, 2.3]} b={[6.5, 2.3]} material={mat('#b8c2bf')} openings={[{from: 3.55, to: 4.45, bottom: 0, top: 2.1}]} />
      <Wall a={[0.5, 0]} b={[0.5, 2.3]} material={mat('#b8c2bf')} />
      <Wall a={[6.5, 0]} b={[6.5, 2.3]} material={mat('#b8c2bf')} />
      <F.ElevatorDoor position={[1.6, 0, 2.24]} rotY={180} />
      <F.PictureFrame position={[5.4, 1.5, 2.235]} rotY={180} w={0.45} h={0.3} color="#c81e22" />
      {/* sala */}
      <F.Rug position={[0.0, 0, -5.1]} />
      <F.Sofa position={[0.0, 0, -3.55]} rotY={180} />
      <F.CoffeeTable position={[0.0, 0, -4.9]} />
      <F.Bookshelf position={[0.96, 0, -7.75]} />
      <F.Plant position={[-1.6, 0, -7.6]} />
      <F.PictureFrame position={[0.9, 1.7, -3.085]} rotY={180} w={0.35} h={0.45} color="#7b6a55" />
      {/* cozinha / jantar */}
      <F.KitchenRun position={[-5.68, 0, -6.1]} rotY={90} length={3.4} />
      <F.Fridge position={[-5.62, 0, -3.65]} rotY={90} />
      <F.DiningSet position={[-3.6, 0, -4.7]} />
      {/* corredor */}
      <F.Cardboard position={[3.6, 0, -2.2]} />
      <F.Cardboard position={[3.6, 0.4, -2.2]} s={[0.4, 0.3, 0.35]} />
      <F.PictureFrame position={[3.925, 1.6, -4.5]} rotY={-90} w={0.6} />
      {/* quarto de hóspedes */}
      <F.Bed position={[0.6, 0, -1.1]} rotY={-90} />
      <F.Nightstand position={[0.95, 0, -2.6]} />
      <F.Wardrobe position={[-2.15, 0, -0.9]} rotY={90} />
      {/* banheiro */}
      <F.Toilet position={[-5.6, 0, -1.0]} rotY={90} />
      <F.BathSink position={[-4.4, 0, -0.3]} rotY={180} />
      <F.Shower position={[-5.5, 0, -2.5]} />
    </StaticBatch>
  );
});
