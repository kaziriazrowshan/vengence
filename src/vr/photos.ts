import howrahPhoto from '../assets/images/howrah_bridge_2050_1788943932870.jpg';
import skymetroPhoto from '../assets/images/kolkata_skymetro_2050_1788943946427.jpg';
import spongeCityPhoto from '../assets/images/hooghly_sponge_city_1788943963962.jpg';
import forestTowersPhoto from '../assets/images/vertical_forest_towers_1788943979447.jpg';

export interface ExhibitionPhoto {
  id: string;
  title: string;
  bengaliTitle: string;
  subtitle: string;
  category: string;
  imageSrc: string;
  description: string;
  engineeringSpecs: string[];
  waypointIndex: number;
  cameraPosition: [number, number, number];
  lookAtPosition: [number, number, number];
}

export const EXHIBITION_PHOTOS: ExhibitionPhoto[] = [
  {
    id: 'howrah_bridge',
    title: 'Howrah Smart Bridge 2.0 & Riverfront',
    bengaliTitle: 'হাওড়া সেতু ২.০ ও হুগলি নদীপ্রান্ত',
    subtitle: 'ICONIC CANTILEVER CARBON NANOTUBE RETROFIT',
    category: 'Architecture & Mobility',
    imageSrc: howrahPhoto,
    description:
      'The iconic 1943 balanced cantilever structure preserved and reinforced with ultra-high-tensile carbon nanotubes and acoustic wave dampers. Automated solar water catamarans glide below on the Hooghly River.',
    engineeringSpecs: [
      'Graphene-composite tensile reinforcement',
      'Dual-deck induction roadway with kinetic energy recovery',
      'Integrated tidal power micro-turbines in river pylons',
      'Continuous structural health piezoelectric sensor mesh'
    ],
    waypointIndex: 0,
    cameraPosition: [0, 24, 85],
    lookAtPosition: [0, 18, -40]
  },
  {
    id: 'skymetro_transit',
    title: 'Maglev Sky-Metro & Smart Promenade',
    bengaliTitle: 'ম্যাগলেভ আকাশ-মেট্রো ও পরিবেশ-বান্ধব সরণি',
    subtitle: 'REGENERATIVE MAGNETIC LEVITATION ARTERY',
    category: 'Clean Transit',
    imageSrc: skymetroPhoto,
    description:
      'Elevated regenerative magnetic levitation corridors linking Howrah to Salt Lake Sector V in 8 minutes. Below, pedestrian tree-canopied boulevards feature wireless induction paths for zero-emission trams.',
    engineeringSpecs: [
      'Zero-friction magnetic levitation running on 100% solar microgrid',
      'Pedestrian acoustic attenuation shielding beneath guidebeams',
      'Wireless in-road dynamic inductive charging for electric fleets',
      'Porous biophilic pavers absorbing 100% surface rainwater'
    ],
    waypointIndex: 2,
    cameraPosition: [-22, 16, -10],
    lookAtPosition: [0, 10, 25]
  },
  {
    id: 'sponge_city_flood',
    title: 'Hooghly Sponge-City & Tidal Aqueducts',
    bengaliTitle: 'হুগলি স্পঞ্জ-সিটি ও জোয়ার-ভাটা জলাশয়',
    subtitle: 'AUTOMATED 250MM/HR MONSOON SURGE RESILIENCE',
    category: 'Climate Defense',
    imageSrc: spongeCityPhoto,
    description:
      'Deployable graphene storm gates activate within 90 seconds during high-tide cyclones. Subterranean surge vaults and floating wetland bio-filters purify urban runoff while restoring river biodiversity.',
    engineeringSpecs: [
      'Autonomous deployable flood barriers powered by tidal pressure',
      'Floating East Kolkata Wetland bio-aqueducts for greywater purification',
      '4.2 million cubic meter subterranean surge storage chambers',
      'Salinity-resistant mangrove bio-embankments preventing river erosion'
    ],
    waypointIndex: 1,
    cameraPosition: [18, 14, -40],
    lookAtPosition: [-10, 10, 15]
  },
  {
    id: 'vertical_forest',
    title: 'Vertical Forest Towers & Helical Microgrid',
    bengaliTitle: 'উল্লম্ব অরণ্য অট্টালিকা ও বায়ুবিদ্যুৎ হাব',
    subtitle: 'NET-ZERO BIOPHILIC LIVING SKY-GARDENS',
    category: 'Sustainable Living',
    imageSrc: forestTowersPhoto,
    description:
      'Residential towers wrapped in over 15,000 native Bengali trees and cascading ferns. Rooftop vertical-axis helical wind turbines and transparent perovskite solar glazing generate 140% of building energy needs.',
    engineeringSpecs: [
      'Passive microclimate cooling dropping internal temperatures by 5.5°C',
      'Rooftop helical wind turbines functioning in low-velocity monsoon winds',
      'Integrated closed-loop hydroponic food and herbal gardens',
      'Autonomous drone landing sky-docks on cantilevered terraces'
    ],
    waypointIndex: 4,
    cameraPosition: [26, 26, -35],
    lookAtPosition: [-15, 20, -75]
  }
];
