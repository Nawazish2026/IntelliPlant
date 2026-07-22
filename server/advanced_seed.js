import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Entity from './models/Entity.js';
import Incident from './models/Incident.js';
import MaintenanceRecord from './models/MaintenanceRecord.js';
import ComplianceRule from './models/ComplianceRule.js';
import KnowledgeEdge from './models/KnowledgeEdge.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

// --- HYPER-REALISTIC INDUSTRIAL DATASET ---

const equipmentList = [
  { name: 'P-101A', type: 'equipment', subType: 'Centrifugal Pump', description: 'Main crude feed pump, Stage 1' },
  { name: 'P-101B', type: 'equipment', subType: 'Centrifugal Pump', description: 'Standby crude feed pump, Stage 1' },
  { name: 'C-201', type: 'equipment', subType: 'Centrifugal Compressor', description: 'Recycle gas compressor for hydrotreater' },
  { name: 'HX-301', type: 'equipment', subType: 'Heat Exchanger', description: 'Crude pre-heat train exchanger, Shell & Tube' },
  { name: 'V-401', type: 'equipment', subType: 'Distillation Column', description: 'Primary atmospheric distillation tower' },
  { name: 'XV-1011', type: 'instrument', subType: 'Control Valve', description: 'Feed flow control valve to V-401' },
  { name: 'VT-101A', type: 'instrument', subType: 'Vibration Transmitter', description: 'P-101A inboard bearing vibration monitor' },
];

const personnelList = [
  { name: 'Rajesh Kumar', type: 'personnel', subType: 'Reliability Engineer' },
  { name: 'Anita Desai', type: 'personnel', subType: 'Maintenance Supervisor' },
  { name: 'Vikram Singh', type: 'personnel', subType: 'Process Operator' },
];

const processList = [
  { name: 'Atmospheric Distillation', type: 'process' },
  { name: 'Hydrotreating', type: 'process' }
];

const incidentsList = [
  {
    incidentId: 'INC-2026-001',
    type: 'incident',
    title: 'High Vibration on P-101A Leading to Seal Leak',
    description: 'At 04:30 hours, vibration transmitter VT-101A spiked to 12mm/s RMS. Shortly after, the mechanical seal failed, resulting in a minor crude oil leak.',
    severity: 'high',
    location: 'Unit 1 - Distillation Area',
    equipmentInvolved: ['P-101A', 'VT-101A'],
    reportedBy: 'Vikram Singh',
    rootCause: 'Bearing degradation',
    date: new Date()
  },
  {
    incidentId: 'INC-2026-002',
    type: 'near_miss',
    title: 'HX-301 Fouling Causing Furnace Temperature Spike',
    description: 'Gradual increase in differential pressure across HX-301 over 3 weeks indicating severe tube-side fouling.',
    severity: 'medium',
    location: 'Unit 1 - Pre-heat Train',
    equipmentInvolved: ['HX-301'],
    reportedBy: 'Rajesh Kumar',
    date: new Date()
  },
  {
    incidentId: 'INC-2026-003',
    type: 'incident',
    title: 'C-201 Surge Event During Startup',
    description: 'During compressor C-201 startup sequence, the anti-surge valve failed to open sufficiently due to a sticky positioner.',
    severity: 'critical',
    location: 'Unit 2 - Hydrotreater',
    equipmentInvolved: ['C-201'],
    reportedBy: 'Anita Desai',
    date: new Date()
  },
  {
    incidentId: 'INC-2026-004',
    type: 'environmental',
    title: 'H2S Alarm near XV-1011',
    description: 'Personal gas monitor alarmed for H2S (15ppm) near control valve XV-1011. Area evacuated.',
    severity: 'high',
    location: 'Unit 1',
    equipmentInvolved: ['XV-1011'],
    reportedBy: 'Vikram Singh',
    date: new Date()
  }
];

const maintenanceList = [
  {
    workOrderId: 'WO-100234',
    equipmentTag: 'P-101A',
    equipmentName: 'Crude Feed Pump',
    type: 'corrective',
    description: 'Emergency Seal Replacement on P-101A. Replaced mechanical seal and inboard thrust bearing.',
    failureMode: 'Mechanical Seal Failure',
    rootCause: 'Bearing Vibration',
    priority: 'critical',
    status: 'completed',
    technicianName: 'Anita Desai',
    downtimeHours: 12,
    costINR: 450000,
    partsReplaced: ['Mech Seal', 'Inboard Bearing']
  },
  {
    workOrderId: 'WO-100235',
    equipmentTag: 'C-201',
    equipmentName: 'Recycle Gas Compressor',
    type: 'predictive',
    description: 'Monthly Vibration Route - C-201. Trend shows slight increase in 1X RPM amplitude.',
    priority: 'medium',
    status: 'completed',
    technicianName: 'Rajesh Kumar',
    costINR: 30000,
  },
  {
    workOrderId: 'WO-100236',
    equipmentTag: 'XV-1011',
    equipmentName: 'Control Valve',
    type: 'preventive',
    description: 'Overhaul of XV-1011. Replaced packing with low-emission graphite set.',
    priority: 'medium',
    status: 'completed',
    technicianName: 'Maintenance Team',
    downtimeHours: 4,
    costINR: 120000,
  }
];

const complianceList = [
  {
    regulation: 'OSHA 1910.119',
    section: 'Process Safety Management',
    requirement: 'Management of Highly Hazardous Chemicals',
    category: 'occupational_health',
    status: 'compliant',
    severity: 'major',
    evidence: ['PHA completed for Unit 1 in Q2. Mechanical integrity program covers 100% of critical pumps.'],
    applicableEquipment: ['P-101A', 'C-201']
  },
  {
    regulation: 'API RP 686',
    section: 'Machinery Installation',
    requirement: 'Installation Design and Setup',
    category: 'quality',
    status: 'gap',
    severity: 'critical',
    evidence: ['Baseplate grouting for C-201 does not meet API-686 void criteria.'],
    gapDescription: 'Baseplate grouting fails resonance standards.',
    applicableEquipment: ['C-201']
  },
  {
    regulation: 'EPA Method 21',
    section: 'Leak Detection',
    requirement: 'LDAR Monitoring',
    category: 'environmental',
    status: 'compliant',
    severity: 'major',
    evidence: ['Quarterly LDAR monitoring completed.'],
    applicableEquipment: ['XV-1011']
  }
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully. Wiping old data...');

    await Entity.deleteMany({});
    await Incident.deleteMany({});
    await MaintenanceRecord.deleteMany({});
    await ComplianceRule.deleteMany({});
    await KnowledgeEdge.deleteMany({});
    console.log('Old data wiped.');

    // 1. Seed Entities
    const allEntities = [...equipmentList, ...personnelList, ...processList];
    const insertedEntities = await Entity.insertMany(allEntities);
    console.log(`Inserted ${insertedEntities.length} entities.`);

    const entityMap = {};
    insertedEntities.forEach(e => { entityMap[e.name] = e._id; });

    // 2. Seed Incidents
    incidentsList.forEach((inc, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (i * 12 + 2));
        inc.date = d;
    });
    const insertedIncidents = await Incident.insertMany(incidentsList);
    console.log(`Inserted ${insertedIncidents.length} incidents.`);

    // 3. Seed Maintenance
    maintenanceList[0].scheduledDate = insertedIncidents[0].date;
    maintenanceList[1].scheduledDate = new Date(new Date().setDate(new Date().getDate() - 10));
    maintenanceList[2].scheduledDate = insertedIncidents[3].date;

    const insertedMaintenance = await MaintenanceRecord.insertMany(maintenanceList);
    console.log(`Inserted ${insertedMaintenance.length} maintenance records.`);

    // 4. Seed Compliance
    const insertedCompliance = await ComplianceRule.insertMany(complianceList);
    console.log(`Inserted ${insertedCompliance.length} compliance rules.`);

    // 5. Seed Knowledge Graph Edges (Entity to Entity only)
    const edges = [
      { sourceEntityId: entityMap['P-101A'], targetEntityId: entityMap['Atmospheric Distillation'], relationship: 'part_of', confidence: 1.0 },
      { sourceEntityId: entityMap['P-101B'], targetEntityId: entityMap['Atmospheric Distillation'], relationship: 'part_of', confidence: 1.0 },
      { sourceEntityId: entityMap['V-401'], targetEntityId: entityMap['Atmospheric Distillation'], relationship: 'part_of', confidence: 1.0 },
      { sourceEntityId: entityMap['C-201'], targetEntityId: entityMap['Hydrotreating'], relationship: 'part_of', confidence: 1.0 },
      
      { sourceEntityId: entityMap['VT-101A'], targetEntityId: entityMap['P-101A'], relationship: 'monitors', confidence: 1.0 },
      { sourceEntityId: entityMap['XV-1011'], targetEntityId: entityMap['V-401'], relationship: 'controls', confidence: 1.0 },
      
      { sourceEntityId: entityMap['P-101A'], targetEntityId: entityMap['Anita Desai'], relationship: 'maintained_by', confidence: 0.9 },
      { sourceEntityId: entityMap['C-201'], targetEntityId: entityMap['Rajesh Kumar'], relationship: 'inspected_by', confidence: 0.95 }
    ];

    const insertedEdges = await KnowledgeEdge.insertMany(edges);
    console.log(`Inserted ${insertedEdges.length} knowledge graph edges.`);

    console.log('\n✅ Highly realistic industrial dataset successfully seeded!');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedDatabase();
