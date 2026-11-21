import React from 'react';
import {mat, PAL} from '../../library/materials';
import * as F from '../../library/furniture';
import {Slab, Wall} from './Walls';
import {Door, Window} from './Door';

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
};

export const Apartment: React.FC<{state?: ApartmentState}> = ({state = {}}) => {
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
  } = state;
  const wallL = mat(PAL.wallWarm, {rough: 0.95});
  const wallH = mat(PAL.wallCool, {rough: 0.95});
  const wallB = mat(PAL.wallBath, {rough: 0.6});
  const wood = mat(PAL.floorWood, {rough: 0.75});
  const tile = mat(PAL.tile, {rough: 0.5});
  const ceil = mat(PAL.ceiling, {rough: 1});
  const H = 2.7;
  return (
    <group>
      {/* pisos e teto */}
      <Slab x={[-6, 4]} z={[-8, -3]} material={wood} />
      <Slab x={[1.5, 4]} z={[-3, 0]} material={wood} />
      <Slab x={[-2.5, 1.5]} z={[-3, 0]} material={mat(PAL.floorWoodDark, {rough: 0.8})} />
      <Slab x={[-6, -2.5]} z={[-3, 0]} material={tile} y={0.002} />
      <Slab x={[-6, 4]} z={[-8, 0]} y={H} material={ceil} ceiling />

      {/* paredes externas */}
      <Wall a={[-6, -8]} b={[4, -8]} material={wallL} openings={[{from: 1.2, to: 4.0, bottom: 0.85, top: 2.35}, {from: 8.2, to: 9.2, bottom: 0.9, top: 2.2}]} />
      <Wall a={[-6, 0]} b={[4, 0]} material={wallH} openings={[{from: 4.6, to: 5.8, bottom: 0.9, top: 2.1}, {from: 8.3, to: 9.2, bottom: 0, top: 2.1}, {from: 1.2, to: 1.8, bottom: 1.6, top: 2.2}]} />
      <Wall a={[-6, -8]} b={[-6, 0]} material={wallL} />
      <Wall a={[4, -8]} b={[4, 0]} material={wallH} />
      {/* internas */}
      <Wall a={[1.5, -8]} b={[1.5, 0]} material={wallH} openings={[{from: 0.8, to: 4.2, bottom: 0, top: 2.3}]} />
      <Wall a={[-6, -3]} b={[1.5, -3]} material={wallL} openings={[{from: 1.8, to: 2.7, bottom: 0, top: 2.1}, {from: 3.6, to: 4.5, bottom: 0, top: 2.1}]} />
      <Wall a={[-2.5, -3]} b={[-2.5, 0]} material={wallB} />

      {/* portas */}
      <Door position={[2.75, 0, 0]} rotY={180} open={-entranceOpen} shake={entranceShake} color="#6f5440" peephole locks={entranceLocks} chain={chain} />
      <Door position={[-1.95, 0, -3]} rotY={180} open={-bedroomDoorOpen} />
      <Door position={[-3.75, 0, -3]} rotY={0} open={-bathroomDoorOpen} />

      {/* janelas */}
      <Window position={[-3.4, 1.6, -8]} width={2.8} height={1.5} blinds={blinds} />
      <Window position={[2.7, 1.55, -8]} width={1.0} height={1.3} />
      <Window position={[-0.8, 1.5, 0]} rotY={180} width={1.2} height={1.2} blinds={0.6} />

      {/* sala */}
      <F.Rug position={[0.0, 0, -5.1]} />
      <F.Sofa position={[0.0, 0, -3.55]} rotY={180} />
      <F.CoffeeTable position={[0.0, 0, -4.9]} />
      <F.TvStand position={[0.0, 0, -7.7]} tvOn={tvOn} />
      <F.Bookshelf position={[1.2, 0, -7.75]} />
      <F.FloorLamp position={[1.15, 0, -3.4]} on={lightsOn} />
      <F.Plant position={[-1.6, 0, -7.6]} />
      <F.PictureFrame position={[-0.5, 1.6, -3.07]} rotY={180} />
      <F.PictureFrame position={[0.9, 1.7, -3.07]} rotY={180} w={0.35} h={0.45} color="#7b6a55" />
      <F.CeilingLamp position={[-0.2, 0, -5.4]} on={lightsOn} />

      {/* cozinha / jantar */}
      <F.KitchenRun position={[-5.68, 0, -6.1]} rotY={90} length={3.4} />
      <F.Fridge position={[-5.62, 0, -3.65]} rotY={90} />
      <F.DiningSet position={[-3.6, 0, -4.7]} />
      <F.CeilingLamp position={[-4.2, 0, -5.4]} on={lightsOn} />
      {/* suprimentos organizados na mesa (cresce com o progresso da preparação) */}
      {Array.from({length: Math.round(supplies * 12)}).map((_, i) => (
        i % 3 === 0 ? (
          <F.WaterBottle key={i} position={[-4.05 + (i % 6) * 0.16, 0.76, -4.85 + Math.floor(i / 6) * 0.2]} />
        ) : (
          <F.Can key={i} position={[-4.05 + (i % 6) * 0.16, 0.76, -4.85 + Math.floor(i / 6) * 0.2]} color={i % 2 ? '#9b2e24' : '#6a7a3a'} />
        )
      ))}

      {/* corredor */}
      <F.Cardboard position={[3.6, 0, -2.2]} />
      <F.Cardboard position={[3.6, 0.4, -2.2]} s={[0.4, 0.3, 0.35]} />
      <F.CeilingLamp position={[2.75, 0, -2]} on={lightsOn} />
      <F.PictureFrame position={[3.93, 1.6, -4.5]} rotY={-90} w={0.6} />
      {/* barricada: estante empurrada contra a porta */}
      {barricade > 0 && <F.Wardrobe position={[2.75 + (1 - barricade) * 0.9, 0, -0.45]} rotY={180} />}

      {/* quarto de hóspedes */}
      <F.Bed position={[0.6, 0, -1.1]} rotY={-90} />
      <F.Nightstand position={[0.95, 0, -2.6]} />
      <F.Wardrobe position={[-2.15, 0, -0.9]} rotY={90} />

      {/* banheiro */}
      <F.Toilet position={[-5.6, 0, -1.0]} rotY={90} />
      <F.BathSink position={[-4.4, 0, -0.3]} rotY={180} />
      <F.Shower position={[-5.5, 0, -2.5]} />

      {/* bolsa do protagonista */}
      {bagAt === 'entrance' && <F.DuffelBag position={[3.3, 0, -0.9]} rotY={20} />}
      {bagAt === 'sofa' && <F.DuffelBag position={[0.75, 0.45, -3.65]} rotY={-5} />}
      {bagAt === 'bedroom' && <F.DuffelBag position={[0.3, 0, -2.5]} rotY={40} />}
    </group>
  );
};
