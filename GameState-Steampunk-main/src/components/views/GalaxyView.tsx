import React, { useMemo, useState } from 'react';
import { BIOME_STYLES, GALAXY_SNAPSHOT } from '@/constants';
import { Planet } from '@/types';
import GalaxyActionModal from '@/components/views/GalaxyActionModal';
import GalaxyHexMap from '@/components/views/GalaxyHexMap';

const GalaxyView: React.FC = () => {
  const [modalPlanet, setModalPlanet] = useState<Planet | null>(null);
  const [focusedPlanet, setFocusedPlanet] = useState<string | null>(null);

  const sortedPlanets = useMemo(
    () => [...GALAXY_SNAPSHOT].sort((a, b) => a.coordinates.localeCompare(b.coordinates, 'de-DE')),
    []
  );

  const handleActionClick = (planet: Planet) => {
    if (!planet.isOwnPlanet) {
      setModalPlanet(planet);
      setFocusedPlanet(planet.coordinates);
    }
  };

  const handleSelectOnMap = (planet: Planet) => {
    setFocusedPlanet(planet.coordinates);
    if (!planet.isOwnPlanet) {
      setModalPlanet(planet);
    } else {
      setModalPlanet(null);
    }
  };

  const handleCloseModal = () => {
    setModalPlanet(null);
  };

  return (
    <div>
      <h2 className="text-4xl font-cinzel text-yellow-400 mb-6 border-b-2 border-yellow-800/50 pb-2">Galaxie</h2>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="steampunk-glass steampunk-border rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-black bg-opacity-30">
              <tr>
                <th className="p-4 font-cinzel text-yellow-400">Koordinaten</th>
                <th className="p-4 font-cinzel text-yellow-400">Planetenname</th>
                <th className="p-4 font-cinzel text-yellow-400">Spieler</th>
                <th className="p-4 font-cinzel text-yellow-400">Biome</th>
                <th className="p-4 font-cinzel text-yellow-400 text-center">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {sortedPlanets.map((planet) => {
                const biome = BIOME_STYLES[planet.biome];
                const isHighlighted =
                  focusedPlanet === planet.coordinates || modalPlanet?.coordinates === planet.coordinates;

                return (
                  <tr
                    key={planet.coordinates}
                    className={`border-t border-yellow-800/30 transition-colors ${
                      isHighlighted ? 'bg-yellow-800/20' : 'hover:bg-yellow-800/10'
                    }`}
                    onMouseEnter={() => setFocusedPlanet(planet.coordinates)}
                    onMouseLeave={() => setFocusedPlanet(null)}
                  >
                    <td className="p-4">{planet.coordinates}</td>
                    <td className="p-4">{planet.name}</td>
                    <td className={`p-4 ${planet.isOwnPlanet ? 'text-green-400 font-semibold' : ''}`}>{planet.player}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="inline-block h-3 w-3 rounded-full"
                          style={{ backgroundColor: biome.fill }}
                          aria-hidden
                        />
                        {biome.label}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleActionClick(planet)}
                        disabled={planet.isOwnPlanet}
                        className="px-4 py-2 text-sm font-cinzel steampunk-button rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Aktionen
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="space-y-4">
          <GalaxyHexMap
            planets={sortedPlanets}
            selectedPlanet={focusedPlanet}
            onSelect={handleSelectOnMap}
            onHover={(planet) => setFocusedPlanet(planet?.coordinates ?? null)}
          />
          <div className="steampunk-glass steampunk-border rounded-lg p-4">
            <h3 className="text-xl font-cinzel text-yellow-400 mb-3">Biom-Legende</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(BIOME_STYLES).map(([key, biome]) => (
                <div key={key} className="flex items-center gap-3">
                  <span
                    className="h-4 w-4 rounded-full border border-yellow-200/50"
                    style={{ backgroundColor: biome.fill, boxShadow: `0 0 6px ${biome.stroke}` }}
                    aria-hidden
                  />
                  <span className="text-sm text-gray-200">{biome.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {modalPlanet && <GalaxyActionModal planet={modalPlanet} onClose={handleCloseModal} />}
    </div>
  );
};

export default GalaxyView;
