import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

import Document from '../models/Document.js';
import Entity from '../models/Entity.js';
import KnowledgeEdge from '../models/KnowledgeEdge.js';
import Embedding from '../models/Embedding.js';
import MaintenanceRecord from '../models/MaintenanceRecord.js';
import ComplianceRule from '../models/ComplianceRule.js';
import Incident from '../models/Incident.js';

/**
 * Seed Data for IntelliPlant
 * Realistic synthetic data for Bharat Petrochem Complex — Jamnagar Unit
 */

const documents = [
  { filename: 'pid_crude_distillation.pdf', originalName: 'P&ID — Crude Distillation Unit CDU-1', fileType: 'pdf', fileSize: 2456789, status: 'ready', category: 'engineering_drawing', pageCount: 12, entityCount: 34, chunkCount: 28, extractedText: 'Crude Distillation Unit CDU-1 Process Flow. Feed: Arabian Light Crude at 25°C enters desalter D-101 at 12 bar. Desalted crude flows to pre-heat train E-201A/B shell-and-tube heat exchangers. Pre-heated crude at 270°C enters atmospheric furnace H-101. Heated crude at 365°C enters atmospheric column T-101 (42 trays, operating pressure 1.5 bar). Products: Overhead — Naphtha (IBP-180°C) via condenser E-202. Side draws — Kerosene (180-250°C), Light Gas Oil (250-340°C), Heavy Gas Oil (340-370°C). Bottoms — Reduced Crude Oil to Vacuum Distillation Unit. Key instruments: TT-101 (furnace outlet temperature), PT-101 (column pressure), FT-101 (crude feed flow), LT-101 (column bottoms level). Safety: PSV-101 set at 3.5 bar on column overhead. Emergency shutdown ESD-101 on high temperature 390°C.' },
  { filename: 'pid_cooling_water.pdf', originalName: 'P&ID — Cooling Water System CWS', fileType: 'pdf', fileSize: 1834567, status: 'ready', category: 'engineering_drawing', pageCount: 8, entityCount: 22, chunkCount: 18, extractedText: 'Cooling Water System CWS. Cooling tower CT-501 capacity 15000 m³/h. Circulation pumps P-501A/B (1 running + 1 standby), each 560 kW centrifugal type. Supply header pressure 4.5 bar, return header 2.0 bar. Chemical dosing: Phosphonate inhibitor via dosing pump DP-501, biocide sodium hypochlorite via DP-502. Blowdown controlled by TDS analyzer AT-501. Make-up water from raw water treatment plant. Key users: E-201A/B crude pre-heat exchangers, E-202 overhead condenser, E-301 vacuum condenser. Temperature monitoring: TT-501 (supply 32°C), TT-502 (return 42°C). Differential pressure across each exchanger monitored by DPSH instruments.' },
  { filename: 'sop_pump_startup.pdf', originalName: 'SOP-MP-001 — Centrifugal Pump Startup Procedure', fileType: 'pdf', fileSize: 567890, status: 'ready', category: 'operating_instruction', pageCount: 6, entityCount: 15, chunkCount: 12, extractedText: 'Standard Operating Procedure SOP-MP-001: Centrifugal Pump Startup. Applicable to: P-101, P-102, P-201, P-501A/B. Prerequisites: 1. Ensure suction and discharge valves alignment per P&ID. 2. Check oil level in bearing housing — oil grade ISO VG 68. 3. Verify mechanical seal flush system operational. 4. Check coupling alignment records — max allowable 0.05mm. 5. Ensure motor starter and control circuit tested. Startup Steps: 1. Open suction valve fully. 2. Crack open discharge valve. 3. Start motor — check for abnormal vibration (limit 4.5 mm/s as per ISO 10816). 4. Gradually open discharge valve to achieve rated flow. 5. Monitor bearing temperature — max 80°C. 6. Record all parameters in startup log. Emergency Stop: If vibration exceeds 7.1 mm/s or bearing temp exceeds 95°C, initiate emergency shutdown immediately.' },
  { filename: 'inspection_hx_e201.pdf', originalName: 'Inspection Report — Heat Exchanger E-201A (Annual)', fileType: 'pdf', fileSize: 1234567, status: 'ready', category: 'inspection_report', pageCount: 15, entityCount: 18, chunkCount: 22, extractedText: 'Annual Inspection Report: Shell and Tube Heat Exchanger E-201A. Date: 15-Mar-2025. Inspector: Mr. R.K. Sharma, API-510 Certified. Equipment: E-201A (Crude Pre-heater, CS Shell / SS316L Tubes). Findings: 1. Shell side — Localised corrosion on lower shell nozzle N1, wall thickness reduced from 12.7mm to 10.2mm (minimum required 9.5mm). Rate: 0.5mm/year. 2. Tube bundle — 3 tubes plugged (out of 450 total) due to pitting corrosion on tube OD. Internal deposit — light fouling, cleaned during turnaround. 3. Channel cover gasket replaced — spiral wound SS316/graphite. 4. Hydro test at 25 bar — SATISFACTORY, no leaks observed. 5. Cathodic protection anodes replaced. Recommendation: Schedule next inspection within 12 months. Monitor shell corrosion rate — if accelerating, consider weld overlay repair. Next turnaround: Replace tube bundle if >5% tubes require plugging.' },
  { filename: 'wo_history_p101.xlsx', originalName: 'Work Order History — Pump P-101 (2023-2025)', fileType: 'xlsx', fileSize: 345678, status: 'ready', category: 'maintenance_record', pageCount: 3, entityCount: 12, chunkCount: 8, extractedText: 'Pump P-101 (Crude Feed Pump) Maintenance History. WO-2023-001: 15-Jan-2023, Preventive, Bearing replacement and alignment check. Cost ₹45,000. WO-2023-047: 28-Jun-2023, Corrective, Mechanical seal failure — crude leak from seal area. Emergency replacement. Downtime 18 hours. Cost ₹185,000. Root cause: Seal face damage due to dry running. WO-2023-089: 10-Oct-2023, Preventive, Annual overhaul — impeller inspection, wear ring measurement. Cost ₹125,000. WO-2024-012: 05-Feb-2024, Corrective, High vibration 8.2 mm/s — bearing failure. Replaced DE and NDE bearings SKF 6316. Downtime 24 hours. Cost ₹95,000. Root cause: Inadequate lubrication. WO-2024-056: 22-Jul-2024, Corrective, Mechanical seal failure again. Downtime 16 hours. Cost ₹195,000. Root cause: Flush plan inadequate — API Plan 11 insufficient for high temperature service. Recommendation: Upgrade to API Plan 53B. WO-2024-101: 15-Nov-2024, Preventive, Vibration analysis — 3.2 mm/s within limits. Oil analysis normal. WO-2025-008: 20-Jan-2025, Predictive, Thermography detected hot spot on coupling guard — misalignment confirmed 0.12mm. Realigned to 0.04mm.' },
  { filename: 'safety_hot_work_permit.pdf', originalName: 'Safety Procedure — Hot Work Permit System', fileType: 'pdf', fileSize: 456789, status: 'ready', category: 'safety_procedure', pageCount: 8, entityCount: 10, chunkCount: 14, extractedText: 'Hot Work Permit Procedure as per OISD-GDN-105. Scope: All welding, cutting, grinding, and other spark-producing activities within plant battery limits. Requirements: 1. Gas test mandatory — LEL must be below 1% (tested with calibrated combustible gas detector). 2. Fire watch to be posted with extinguisher during and 30 minutes after hot work. 3. Area within 15-meter radius to be free of flammable materials. 4. Permit valid for 8 hours maximum — must be renewed for extended work. 5. Emergency escape routes identified and communicated. 6. For work on or near equipment containing hydrocarbons — equipment must be isolated, depressurized, drained, and gas-freed. Refer to OISD-STD-105 for detailed isolation procedures. Approved by: Area-in-charge (minimum Shift Supervisor grade) and Fire & Safety Officer.' },
  { filename: 'oisd_144_compliance.pdf', originalName: 'OISD-144 Compliance Assessment — Pipeline Integrity', fileType: 'pdf', fileSize: 789012, status: 'ready', category: 'regulatory', pageCount: 20, entityCount: 25, chunkCount: 30, extractedText: 'OISD Standard 144: Pipeline Integrity Management System Compliance Assessment for Bharat Petrochem Complex. Assessment Date: 01-Apr-2025. Overall Status: PARTIALLY COMPLIANT. Clause 4.2: Risk Assessment — COMPLIANT. Risk assessment completed for all cross-country pipelines. Clause 5.1: In-Line Inspection — GAP. Intelligent pigging not performed on 8-inch crude oil transfer line within last 5 years (requirement: every 5 years). Due date exceeded by 8 months. Clause 5.3: Hydrostatic Testing — COMPLIANT. All critical pipelines tested within schedule. Clause 6.1: Cathodic Protection — GAP. CP survey shows 3 locations where pipe-to-soil potential below -850mV criterion. Rectifier output adjustments needed. Clause 7.2: Leak Detection — COMPLIANT. SCADA-based leak detection system operational. Clause 8.1: Emergency Response — GAP. Emergency response drill for pipeline rupture scenario not conducted in current year. Overdue since January 2025.' },
  { filename: 'incident_inv_2024_003.pdf', originalName: 'Incident Investigation Report — INV-2024-003 Hydrocarbon Leak', fileType: 'pdf', fileSize: 923456, status: 'ready', category: 'incident_report', pageCount: 18, entityCount: 20, chunkCount: 25, extractedText: 'Incident Investigation Report INV-2024-003. Date: 14-Aug-2024. Location: CDU-1 Pump Area. Classification: Process Safety Incident (Tier 2 per API 754). Description: At 0345 hours, night shift operator detected hydrocarbon odour near pump P-101. Upon investigation, found crude oil leaking from mechanical seal at estimated rate of 2 litres/minute. Area gas detectors GA-101 and GA-102 reading 15% LEL. Emergency procedures activated — pump isolated, area evacuated, fire tender on standby. Leak contained within 45 minutes. Total release approximately 90 litres, contained in pump bund. No injuries, no fire. Root Cause Analysis (5-Why): Why 1: Seal failed — secondary seal face cracked. Why 2: Face cracked due to thermal shock — flush system lost flow. Why 3: Flush flow lost because flush orifice plugged with debris. Why 4: Debris from corroded carbon steel flush piping. Why 5: Flush piping not included in corrosion monitoring program. Contributing Factors: 1. Repeated seal failures on P-101 (3rd failure in 18 months). 2. Flush system design inadequate for crude service at 280°C. 3. Nighttime — reduced staffing delayed initial detection by est. 20 minutes. Corrective Actions: CA-1: Replace carbon steel flush piping with SS316L (Due: 30-Sep-2024, Status: Completed). CA-2: Upgrade seal to API Plan 53B with barrier fluid (Due: Next turnaround). CA-3: Add dedicated seal leak detection instruments on all critical pumps (Due: 31-Dec-2024). CA-4: Include all seal flush piping in corrosion monitoring (Immediate). Lessons Learned: Small bore piping connected to critical safety systems must be included in integrity management scope. Repeated failures indicate systemic design issue — do not just replace, investigate and resolve root cause.' },
  { filename: 'compressor_manual_c301.pdf', originalName: 'OEM Manual — Reciprocating Compressor C-301', fileType: 'pdf', fileSize: 3456789, status: 'ready', category: 'operating_instruction', pageCount: 45, entityCount: 28, chunkCount: 40, extractedText: 'OEM Operation & Maintenance Manual: Reciprocating Compressor C-301 (Make: BHEL, Model: 4HB-3, Service: Hydrogen). Rated capacity: 5000 Nm³/h. Suction pressure: 22 bar. Discharge pressure: 55 bar. Driver: 800 kW synchronous motor M-301. Lubrication: Force-feed system with ISO VG 150 compressor oil, consumption max 15 ml/h per cylinder. Critical alarms: High discharge temperature >150°C (trip at 165°C), low oil pressure <1.5 bar (trip at 1.0 bar), high vibration on crosshead >50 μm (trip at 75 μm). Valve maintenance: Inspect suction and discharge valves every 8000 operating hours. Replace valve plates and springs if worn beyond limits. Piston ring replacement: Every 16000 hours or when rod drop exceeds 0.5mm. Packing replacement: Every 12000 hours. Foundation bolt torque check: Annually. Alignment check: After any maintenance involving driver removal.' },
  { filename: 'env_emission_monitoring.xlsx', originalName: 'Monthly Emission Monitoring Report — Q1 2025', fileType: 'xlsx', fileSize: 234567, status: 'ready', category: 'regulatory', pageCount: 4, entityCount: 14, chunkCount: 10, extractedText: 'Bharat Petrochem Complex — Emission Monitoring Report Q1 2025. Stack Emissions (CPCB Norms): Furnace H-101 Stack: SO2: 185 mg/Nm³ (limit 250), NOx: 320 mg/Nm³ (limit 450), PM: 42 mg/Nm³ (limit 50 — APPROACHING LIMIT). Flare System: Continuous monitoring — average combustion efficiency 98.2% (target >98%). Smokeless capacity verified. Fugitive Emissions: LDAR survey Q1-2025 — 2847 components surveyed, 12 leakers detected (leak rate 0.42%). Repaired 10, 2 pending next shutdown. Ambient Air Quality: SO2: 28 μg/m³ (NAAQS limit 80), NO2: 35 μg/m³ (limit 80), PM2.5: 52 μg/m³ (limit 60 — ELEVATED). Effluent: COD: 180 mg/L (limit 250), Oil & Grease: 8 mg/L (limit 10 — CLOSE TO LIMIT), pH: 7.2 (range 6.5-8.5).' }
];

const maintenanceRecords = [
  // Pump P-101 — Problematic pump with recurring seal failures
  { equipmentTag: 'P-101', equipmentName: 'Crude Feed Pump A', workOrderId: 'WO-2023-001', type: 'preventive', description: 'Scheduled bearing replacement and alignment check. DE and NDE bearings replaced (SKF 6316). Laser alignment performed.', priority: 'medium', status: 'completed', scheduledDate: new Date('2023-01-15'), completedDate: new Date('2023-01-16'), technicianName: 'Ravi Kumar', technicianNotes: 'Bearings showed normal wear. Alignment within 0.03mm. Oil changed to fresh ISO VG 68.', downtimeHours: 8, costINR: 45000, partsReplaced: ['DE Bearing SKF 6316', 'NDE Bearing SKF 6316', 'Lube oil 20L'], healthScore: 92 },
  { equipmentTag: 'P-101', equipmentName: 'Crude Feed Pump A', workOrderId: 'WO-2023-047', type: 'corrective', description: 'Emergency — Mechanical seal failure. Crude oil leaking from seal area. Pump tripped on high vibration.', failureMode: 'Mechanical Seal Failure', rootCause: 'Seal face damage due to dry running — suction strainer partially blocked, causing cavitation at seal faces', resolution: 'Replaced mechanical seal (John Crane Type 2800). Cleaned suction strainer. Installed differential pressure gauge across strainer.', priority: 'critical', status: 'completed', scheduledDate: new Date('2023-06-28'), completedDate: new Date('2023-06-29'), technicianName: 'Suresh Patil', technicianNotes: 'Seal faces showed severe heat checking. Primary seal face cracked. Suction strainer 60% blocked with debris. Recommend strainer DP alarm.', downtimeHours: 18, costINR: 185000, partsReplaced: ['Mechanical Seal JC-2800', 'Suction strainer mesh', 'Gasket set'], healthScore: 65 },
  { equipmentTag: 'P-101', equipmentName: 'Crude Feed Pump A', workOrderId: 'WO-2023-089', type: 'preventive', description: 'Annual overhaul — Complete pump disassembly, impeller inspection, wear ring measurement, casing inspection.', priority: 'medium', status: 'completed', scheduledDate: new Date('2023-10-10'), completedDate: new Date('2023-10-14'), technicianName: 'Ravi Kumar', technicianNotes: 'Impeller balance ok. Wear ring clearance 0.45mm (new: 0.35mm, max: 0.70mm). Casing no erosion. Shaft runout 0.02mm — good.', downtimeHours: 96, costINR: 125000, partsReplaced: ['Gasket set', 'O-rings', 'Lube oil 20L'], healthScore: 88 },
  { equipmentTag: 'P-101', equipmentName: 'Crude Feed Pump A', workOrderId: 'WO-2024-012', type: 'corrective', description: 'High vibration alarm at 8.2 mm/s — bearing failure on DE side. Immediate shutdown required.', failureMode: 'Bearing Failure', rootCause: 'Inadequate lubrication — oil level below minimum mark. Possible slow leak from oil drain plug not properly torqued.', resolution: 'Replaced both bearings. Replaced oil drain plug gasket. Topped up oil. Added oil level sight glass low-level alarm.', priority: 'high', status: 'completed', scheduledDate: new Date('2024-02-05'), completedDate: new Date('2024-02-06'), technicianName: 'Amit Desai', technicianNotes: 'DE bearing showed blue discoloration indicating overheating. Oil was dark and contained metal particles. Root cause: drain plug gasket deteriorated, slow oil loss over weeks.', downtimeHours: 24, costINR: 95000, partsReplaced: ['DE Bearing SKF 6316', 'NDE Bearing SKF 6316', 'Oil drain plug gasket', 'Lube oil 20L'], healthScore: 70 },
  { equipmentTag: 'P-101', equipmentName: 'Crude Feed Pump A', workOrderId: 'WO-2024-056', type: 'corrective', description: 'Mechanical seal failure — second failure in 12 months. Crude leak detected by area patrol.', failureMode: 'Mechanical Seal Failure', rootCause: 'Seal flush plan (API Plan 11) inadequate for high temperature crude service at 280°C. Flush orifice plugged with corrosion products from CS flush piping.', resolution: 'Replaced seal. Recommended upgrade to API Plan 53B with barrier fluid for next turnaround. Replaced CS flush piping section with SS316.', priority: 'critical', status: 'completed', scheduledDate: new Date('2024-07-22'), completedDate: new Date('2024-07-23'), technicianName: 'Suresh Patil', technicianNotes: 'Third seal failure on this pump. Flush piping internally corroded. This is a design issue — Plan 11 not suitable for this application. Must escalate for engineering change.', downtimeHours: 16, costINR: 195000, partsReplaced: ['Mechanical Seal JC-2800', 'SS316 flush piping 10m', 'Gasket set'], healthScore: 55 },
  { equipmentTag: 'P-101', equipmentName: 'Crude Feed Pump A', workOrderId: 'WO-2024-101', type: 'preventive', description: 'Routine vibration analysis and oil sampling.', priority: 'low', status: 'completed', scheduledDate: new Date('2024-11-15'), completedDate: new Date('2024-11-15'), technicianName: 'Ravi Kumar', technicianNotes: 'Vibration 3.2 mm/s — within acceptable limits. Oil analysis: normal wear metals, no water contamination. Next check in 3 months.', downtimeHours: 0, costINR: 5000, partsReplaced: [], healthScore: 78 },
  { equipmentTag: 'P-101', equipmentName: 'Crude Feed Pump A', workOrderId: 'WO-2025-008', type: 'predictive', description: 'Thermography survey detected hot spot on coupling guard — misalignment suspected.', priority: 'medium', status: 'completed', scheduledDate: new Date('2025-01-20'), completedDate: new Date('2025-01-21'), technicianName: 'Amit Desai', technicianNotes: 'Coupling guard temperature 15°C above ambient. Laser alignment showed 0.12mm offset. Realigned to 0.04mm. Hot spot resolved on follow-up thermography.', downtimeHours: 6, costINR: 15000, partsReplaced: ['Coupling guard gasket'], healthScore: 82 },

  // Pump P-102 — Standby pump, better condition
  { equipmentTag: 'P-102', equipmentName: 'Crude Feed Pump B (Standby)', workOrderId: 'WO-2024-033', type: 'preventive', description: 'Standby pump quarterly test run and inspection.', priority: 'low', status: 'completed', scheduledDate: new Date('2024-04-10'), completedDate: new Date('2024-04-10'), technicianName: 'Ravi Kumar', technicianNotes: 'Test run 2 hours. All parameters normal. Vibration 2.1 mm/s. Ready for service.', downtimeHours: 0, costINR: 8000, partsReplaced: [], healthScore: 95 },

  // Heat Exchanger E-201A
  { equipmentTag: 'E-201A', equipmentName: 'Crude Pre-heater A', workOrderId: 'WO-2024-045', type: 'preventive', description: 'Annual inspection and tube bundle cleaning during turnaround.', priority: 'medium', status: 'completed', scheduledDate: new Date('2024-06-01'), completedDate: new Date('2024-06-10'), technicianName: 'Manoj Singh', technicianNotes: 'Shell-side corrosion at N1 nozzle — UT showed 10.2mm (original 12.7mm). 3 tubes plugged. Hydrotest satisfactory at 25 bar. CP anodes replaced.', downtimeHours: 240, costINR: 450000, partsReplaced: ['Spiral wound gasket (shell-channel)', 'CP anodes x4', 'Tube plugs x3'], healthScore: 72 },

  // Compressor C-301
  { equipmentTag: 'C-301', equipmentName: 'Hydrogen Compressor', workOrderId: 'WO-2024-067', type: 'preventive', description: 'Scheduled valve inspection at 8000 hours. Suction and discharge valve check.', priority: 'high', status: 'completed', scheduledDate: new Date('2024-08-15'), completedDate: new Date('2024-08-18'), technicianName: 'Vikram Joshi', technicianNotes: 'Stage 1 discharge valve — plate worn, replaced. All other valves within limits. Piston rod drop 0.3mm (limit 0.5mm). Next packing replacement due at 12000 hours.', downtimeHours: 72, costINR: 380000, partsReplaced: ['Stage 1 discharge valve plate', 'Valve springs set', 'Gaskets'], healthScore: 80 },
  { equipmentTag: 'C-301', equipmentName: 'Hydrogen Compressor', workOrderId: 'WO-2025-015', type: 'corrective', description: 'High discharge temperature alarm — Stage 2 discharge temperature 158°C (trip: 165°C).', failureMode: 'High Discharge Temperature', rootCause: 'Stage 2 discharge valve leaking — plate cracked. Gas re-compression causing temperature rise.', resolution: 'Emergency valve replacement. Both suction and discharge valves of Stage 2 replaced.', priority: 'critical', status: 'completed', scheduledDate: new Date('2025-02-28'), completedDate: new Date('2025-03-02'), technicianName: 'Vikram Joshi', technicianNotes: 'Valve plate cracked — likely fatigue failure. Operated 6500 hours since last replacement (normally 8000 hours). Consider reducing inspection interval to 6000 hours for Stage 2 due to higher pressure ratio.', downtimeHours: 48, costINR: 520000, partsReplaced: ['Stage 2 SV plate', 'Stage 2 DV plate', 'Valve springs', 'Gaskets'], healthScore: 68 },

  // Cooling Water Pump P-501A
  { equipmentTag: 'P-501A', equipmentName: 'CW Circulation Pump A', workOrderId: 'WO-2024-078', type: 'corrective', description: 'Abnormal noise from pump. Investigation revealed impeller erosion.', failureMode: 'Impeller Erosion', rootCause: 'Cooling water chemistry not maintained — high chloride levels causing pitting on bronze impeller.', resolution: 'Impeller replaced. Water chemistry review initiated with chemical vendor.', priority: 'high', status: 'completed', scheduledDate: new Date('2024-09-20'), completedDate: new Date('2024-09-22'), technicianName: 'Suresh Patil', technicianNotes: 'Impeller had severe erosion-corrosion on blade leading edges. Water chloride was 380 ppm against target of <250 ppm. COC too high — blowdown valve faulty.', downtimeHours: 36, costINR: 280000, partsReplaced: ['Bronze impeller', 'Wear rings', 'Mechanical seal'], healthScore: 75 },

  // Control Valve CV-101
  { equipmentTag: 'CV-101', equipmentName: 'Crude Feed Flow Control Valve', workOrderId: 'WO-2025-022', type: 'preventive', description: 'Scheduled control valve maintenance — trim inspection and actuator calibration.', priority: 'medium', status: 'open', scheduledDate: new Date('2025-04-15'), technicianName: 'Amit Desai', downtimeHours: 0, costINR: 0, partsReplaced: [], healthScore: 85 },

  // Pressure Vessel V-201
  { equipmentTag: 'V-201', equipmentName: 'Crude Oil Desalter', workOrderId: 'WO-2024-090', type: 'preventive', description: 'Internal inspection during turnaround — vessel entry, UT thickness survey, electrode grid inspection.', priority: 'high', status: 'completed', scheduledDate: new Date('2024-10-05'), completedDate: new Date('2024-10-12'), technicianName: 'R.K. Sharma', technicianNotes: 'Min wall thickness 18.5mm (original 22mm, minimum required 16mm). Corrosion rate 0.7mm/year — accelerating. Electrode grid intact. Internal coating applied on bottom section. Scheduled weld overlay for next turnaround.', downtimeHours: 168, costINR: 650000, partsReplaced: ['Manway gasket', 'Internal coating 25m²'], healthScore: 65 },
];

const complianceRules = [
  // OISD Standards
  { regulation: 'OISD-116', section: '5.2', requirement: 'Fixed fire protection system for storage tanks — foam system with adequate foam stock for 65 minutes application', category: 'fire_safety', applicableEquipment: ['TK-601', 'TK-602', 'TK-603'], status: 'compliant', severity: 'critical', lastAuditDate: new Date('2025-01-15'), evidence: ['Foam stock inventory certificate', 'Foam system test report'], responsiblePerson: 'Fire & Safety Manager' },
  { regulation: 'OISD-116', section: '7.1', requirement: 'Firewater network ring main — minimum residual pressure 7 kg/cm² at the remotest hydrant with all monitors in operation', category: 'fire_safety', applicableEquipment: ['Firewater Network'], status: 'gap', severity: 'critical', lastAuditDate: new Date('2025-01-15'), gapDescription: 'Residual pressure measured at 5.8 kg/cm² at hydrant H-27 (remotest point). Firewater pump P-601B impeller worn, delivering 15% less than rated capacity.', recommendation: 'Immediate repair/replacement of P-601B impeller. Install jockey pump for pressure maintenance.', responsiblePerson: 'Fire & Safety Manager' },
  { regulation: 'OISD-144', section: '5.1', requirement: 'Intelligent pigging (In-Line Inspection) for all cross-country pipelines at intervals not exceeding 5 years', category: 'pipeline_safety', applicableEquipment: ['8-inch Crude Transfer Line', '6-inch Product Pipeline'], status: 'gap', severity: 'major', lastAuditDate: new Date('2025-04-01'), gapDescription: '8-inch crude oil transfer line — last ILI was June 2019. Over 5 years overdue. Pipeline carries crude at 25 bar, any failure could result in major spill.', recommendation: 'Schedule intelligent pigging within 30 days. Deploy temporary leak detection measures (increased patrol frequency) until completed.', responsiblePerson: 'Pipeline Integrity Manager' },
  { regulation: 'OISD-144', section: '6.1', requirement: 'Cathodic protection — pipe-to-soil potential of -850mV or more negative at all test stations', category: 'pipeline_safety', applicableEquipment: ['All buried pipelines'], status: 'gap', severity: 'major', lastAuditDate: new Date('2025-04-01'), gapDescription: '3 test stations showing inadequate CP: TS-12 (-780mV), TS-18 (-690mV), TS-25 (-810mV). Possible coating damage or depleted anodes.', recommendation: 'Adjust rectifier output. Conduct close interval potential survey (CIPS). Repair coating at identified locations.', responsiblePerson: 'Corrosion Engineer' },
  { regulation: 'OISD-144', section: '8.1', requirement: 'Emergency response drill for pipeline rupture scenario at least once per year', category: 'emergency_response', applicableEquipment: ['All pipelines'], status: 'gap', severity: 'major', lastAuditDate: new Date('2025-04-01'), gapDescription: 'Pipeline emergency drill not conducted since December 2023. Overdue by 4+ months.', recommendation: 'Schedule mock drill within 15 days. Coordinate with local emergency services.', responsiblePerson: 'HSE Manager' },

  // Factory Act 1948
  { regulation: 'Factory Act 1948', section: '36', requirement: 'Every pressure vessel to be examined by competent person at intervals not exceeding 12 months', category: 'pressure_vessel', applicableEquipment: ['V-201', 'V-202', 'T-101', 'D-101'], status: 'compliant', severity: 'critical', lastAuditDate: new Date('2024-11-20'), evidence: ['Form 12 certificates for all vessels', 'Third-party inspection reports'], responsiblePerson: 'Inspection Manager' },
  { regulation: 'Factory Act 1948', section: '40B', requirement: 'Safety committee to meet at least once every quarter with documented minutes', category: 'occupational_health', applicableEquipment: ['General'], status: 'compliant', severity: 'minor', lastAuditDate: new Date('2025-03-30'), evidence: ['Meeting minutes Q1-Q4 2024', 'Q1 2025 minutes'], responsiblePerson: 'HR Manager' },

  // PESO
  { regulation: 'PESO - SMPV Rules', section: '10(1)', requirement: 'Competency certificate for all personnel operating pressure vessels above 1 kg/cm²', category: 'pressure_vessel', applicableEquipment: ['All pressure vessels'], status: 'compliant', severity: 'critical', lastAuditDate: new Date('2025-02-10'), evidence: ['Operator competency certificates', 'Training records'], responsiblePerson: 'Training Manager' },
  { regulation: 'PESO - Petroleum Rules', section: '130', requirement: 'Static and Lightning Protection — all tanks and equipment properly earthed and tested annually', category: 'electrical', applicableEquipment: ['All storage tanks', 'All process equipment'], status: 'gap', severity: 'major', lastAuditDate: new Date('2024-12-15'), gapDescription: 'Earth resistance for TK-602 measured at 12 ohms (limit: 10 ohms). Earth pit needs maintenance — soil resistivity may have changed.', recommendation: 'Add supplementary earth pits around TK-602. Treat soil with earth enhancement compound.', responsiblePerson: 'Electrical Manager' },

  // CPCB
  { regulation: 'CPCB - Emission Standards', section: 'Schedule I', requirement: 'Particulate Matter emissions from process heaters shall not exceed 50 mg/Nm³', category: 'environmental', applicableEquipment: ['H-101'], status: 'pending_review', severity: 'major', lastAuditDate: new Date('2025-03-31'), gapDescription: 'Furnace H-101 PM emission at 42 mg/Nm³ — within limit but approaching threshold (84% of limit). Trend shows increase from 35 mg/Nm³ six months ago.', recommendation: 'Investigate burner condition. Consider soot blowing optimization. Monitor monthly instead of quarterly.', responsiblePerson: 'Environmental Manager' },
  { regulation: 'CPCB - Effluent Standards', section: 'Schedule VI', requirement: 'Oil & Grease in treated effluent shall not exceed 10 mg/L', category: 'environmental', applicableEquipment: ['ETP'], status: 'pending_review', severity: 'major', lastAuditDate: new Date('2025-03-31'), gapDescription: 'O&G in effluent at 8 mg/L — within limit but at 80%. Any process upset could cause exceedance. API separator performance has degraded.', recommendation: 'Refurbish API oil separator. Check coalescer plates. Consider additional polishing treatment.', responsiblePerson: 'Environmental Manager' },

  // BIS
  { regulation: 'BIS IS 2062', section: '4.1', requirement: 'All structural steel and pressure-containing parts to conform to IS 2062 Grade E250/E350 with valid MTCs', category: 'quality', applicableEquipment: ['All structural steel', 'Pipe supports'], status: 'compliant', severity: 'minor', lastAuditDate: new Date('2024-08-20'), evidence: ['MTC records', 'PMI test results'], responsiblePerson: 'QA Manager' },
];

const incidents = [
  { incidentId: 'INC-2023-001', type: 'near_miss', severity: 'medium', title: 'Gas Leak Detection at Compressor C-301 Seal', description: 'H2 gas detector GA-301 alarmed at 25% LEL near compressor C-301 distance piece vent. Investigation found minor hydrogen leak from packing. Leak rate estimated at 50 ppm by FLIR camera. No injuries, no evacuation required.', equipmentInvolved: ['C-301'], location: 'Hydrogen Compression Area', rootCause: 'Packing rings worn beyond permissible limit. Operated 11,500 hours against recommended 12,000 hours — close to limit.', contributingFactors: ['Packing near end-of-life', 'Condition monitoring for packing wear not systematic'], correctiveActions: [{ action: 'Replace packing rings', assignedTo: 'Vikram Joshi', dueDate: new Date('2023-04-15'), status: 'completed' }, { action: 'Implement packing leak rate monitoring procedure', assignedTo: 'Reliability Engineer', dueDate: new Date('2023-06-30'), status: 'completed' }], date: new Date('2023-04-01'), reportedBy: 'Shift Operator - Raj Nair', investigatedBy: 'Vikram Joshi', lessonsLearned: 'Compressor packing should be treated as a safety-critical element. Implement rod drop monitoring as leading indicator for packing condition.', patternTags: ['compressor_packing', 'gas_leak', 'h2_safety'], preventiveMeasures: ['Reduce packing inspection interval to 10,000 hours', 'Install continuous rod drop monitor'] },
  { incidentId: 'INC-2023-005', type: 'incident', severity: 'high', title: 'Pump P-101 Mechanical Seal Failure — Crude Oil Leak', description: 'Mechanical seal on pump P-101 failed during night shift. Crude oil leaking at approximately 2 litres/minute. Gas detectors GA-101 and GA-102 reading 15% LEL. Area evacuated, pump isolated. Leak contained in 45 minutes. Total release approximately 90 litres contained in pump bund.', equipmentInvolved: ['P-101'], location: 'CDU-1 Pump Area', rootCause: 'Seal flush system (API Plan 11) inadequate for service. Flush orifice blocked by corrosion products from carbon steel flush piping. Seal ran dry and primary face cracked.', contributingFactors: ['Third seal failure in 18 months', 'CS flush piping not in corrosion monitoring', 'Night shift — delayed detection', 'Design inadequacy for high temperature crude'], correctiveActions: [{ action: 'Replace CS flush piping with SS316L', assignedTo: 'Suresh Patil', dueDate: new Date('2024-09-30'), status: 'completed' }, { action: 'Upgrade to API Plan 53B with barrier fluid', assignedTo: 'Engineering Mgr', dueDate: new Date('2025-06-30'), status: 'in_progress' }, { action: 'Install dedicated seal leak detection on critical pumps', assignedTo: 'Instrument Mgr', dueDate: new Date('2024-12-31'), status: 'completed' }, { action: 'Include all small-bore piping in corrosion monitoring', assignedTo: 'Corrosion Engineer', dueDate: new Date('2024-10-31'), status: 'completed' }], date: new Date('2024-08-14'), reportedBy: 'Night Shift Operator', investigatedBy: 'HSE Manager + Reliability Engineer', lessonsLearned: 'Small bore piping connected to critical safety systems must be included in integrity management scope. Repeated failures indicate systemic design issue — do not just replace, investigate and resolve root cause.', patternTags: ['seal_failure', 'crude_leak', 'pump_failure', 'design_inadequacy', 'small_bore_piping'], preventiveMeasures: ['API Plan upgrade for all high-temp pump services', 'Small bore piping integrity program'], estimatedLossINR: 500000 },
  { incidentId: 'INC-2023-008', type: 'near_miss', severity: 'high', title: 'Scaffolding Collapse During Maintenance on Column T-101', description: 'During turnaround maintenance, a section of scaffolding (3 levels, approximately 8m height) collapsed on the west side of atmospheric column T-101. No personnel were on the collapsed section at the time — maintenance crew had left for tea break 10 minutes earlier. Two hard hats found crushed under fallen scaffold tubes.', equipmentInvolved: ['T-101'], location: 'CDU-1 Column Area', rootCause: 'Base plates of scaffold placed on uneven ground without adequate sole boards. Recent rain had softened the soil, causing one leg to sink.', contributingFactors: ['Scaffold inspection checklist not completed before use', 'Competent scaffolder not available — erected by general maintenance crew', 'Recent heavy rainfall softened ground conditions'], correctiveActions: [{ action: 'Mandatory scaffold inspection by certified scaffolder before use', assignedTo: 'Safety Officer', dueDate: new Date('2023-11-15'), status: 'completed' }, { action: 'Ground assessment procedure before scaffold erection', assignedTo: 'Civil Engineer', dueDate: new Date('2023-12-31'), status: 'completed' }], date: new Date('2023-11-02'), reportedBy: 'Maintenance Supervisor', investigatedBy: 'HSE Manager', lessonsLearned: 'Near-miss with potential fatal consequences. All scaffolding must be erected and inspected by certified competent persons. Weather conditions must be considered in work planning.', patternTags: ['scaffolding', 'working_at_height', 'turnaround_safety', 'weather_impact'], preventiveMeasures: ['Certified scaffolder requirement enforced', 'Daily scaffold inspection during turnaround'], injuriesCount: 0 },
  { incidentId: 'INC-2024-002', type: 'quality_ncr', severity: 'medium', title: 'NCR — Wrong Material Installed in Piping Modification', description: 'During routine PMI (Positive Material Identification) survey, discovered that a 6-inch pipe spool installed during last turnaround modification was Carbon Steel instead of specified SS316L. The spool is in crude service at 280°C in the furnace inlet piping to H-101.', equipmentInvolved: ['H-101'], location: 'CDU-1 Furnace Area', rootCause: 'Material traceability lost during warehouse issuance. Material requisition specified SS316L but CS pipe was issued from adjacent rack. No PMI verification at point of installation.', contributingFactors: ['Warehouse material storage layout — SS and CS stored in adjacent racks', 'No mandatory PMI at point of installation during turnaround', 'High workload during turnaround compressed QA activities'], correctiveActions: [{ action: 'Replace CS spool with correct SS316L material', assignedTo: 'Piping Supervisor', dueDate: new Date('2024-06-30'), status: 'completed' }, { action: 'Implement mandatory PMI verification before and after installation', assignedTo: 'QA Manager', dueDate: new Date('2024-05-31'), status: 'completed' }, { action: 'Reorganize warehouse — separate alloy and carbon steel storage with color coding', assignedTo: 'Stores Manager', dueDate: new Date('2024-07-31'), status: 'completed' }], date: new Date('2024-03-20'), reportedBy: 'QA Inspector', investigatedBy: 'QA Manager', lessonsLearned: 'Material verification (PMI) must be a mandatory hold point at installation, not just during material receipt. Warehouse layout is a contributing factor in material mix-ups.', patternTags: ['material_mixup', 'quality_control', 'pmi_verification', 'turnaround_quality'], preventiveMeasures: ['PMI hold point in work procedures', 'Color-coded material storage'] },
  { incidentId: 'INC-2024-005', type: 'audit_finding', severity: 'high', title: 'Management of Change (MOC) Process Bypass', description: 'External HSE audit discovered that 3 process modifications were implemented without completing the MOC process. Modifications: 1) PSV set pressure changed on V-202, 2) New chemical additive introduced in cooling water, 3) Operator procedure modified for furnace H-101 startup.', equipmentInvolved: ['V-202', 'CT-501', 'H-101'], location: 'Multiple locations', rootCause: 'MOC process perceived as too slow and bureaucratic. Operations team implemented changes as "minor adjustments" without triggering MOC.', contributingFactors: ['MOC approval cycle averaging 45 days', 'No clear criteria distinguishing MOC-required vs routine changes', 'Cultural issue — pressure to maintain production overriding process safety'], correctiveActions: [{ action: 'Review and streamline MOC process — target 15-day cycle for standard changes', assignedTo: 'Process Safety Manager', dueDate: new Date('2024-09-30'), status: 'completed' }, { action: 'Develop clear MOC trigger criteria with examples', assignedTo: 'Process Safety Manager', dueDate: new Date('2024-08-31'), status: 'completed' }, { action: 'Retrospective MOC and HAZOP for all 3 changes', assignedTo: 'Process Engineering', dueDate: new Date('2024-07-31'), status: 'completed' }], date: new Date('2024-06-15'), reportedBy: 'External Auditor (M/s SafetyFirst Consultants)', investigatedBy: 'Plant Manager', lessonsLearned: 'MOC bypass is a leading indicator of process safety culture erosion. The solution is not just enforcement but making the process practical and efficient while maintaining rigor.', patternTags: ['moc_bypass', 'process_safety_culture', 'audit_finding', 'procedure_violation'], preventiveMeasures: ['Streamlined MOC process', 'Monthly MOC compliance review'] },
  { incidentId: 'INC-2024-008', type: 'environmental', severity: 'medium', title: 'Elevated PM2.5 at Ambient Air Quality Station', description: 'CAAQMS (Continuous Ambient Air Quality Monitoring Station) recorded PM2.5 average of 62 μg/m³ for 3 consecutive days, exceeding NAAQS limit of 60 μg/m³. CPCB notified as per consent conditions.', equipmentInvolved: ['H-101', 'Flare System'], location: 'Plant Boundary - East', rootCause: 'Combination of furnace H-101 PM emission increase (42 mg/Nm³ vs normal 35 mg/Nm³) and unfavorable meteorological conditions (low wind speed, temperature inversion).', contributingFactors: ['Furnace burner tip erosion increasing PM', 'Seasonal weather pattern — winter inversions', 'Nearby construction activity contributing to ambient PM'], correctiveActions: [{ action: 'Furnace burner inspection and tip replacement', assignedTo: 'Operations Manager', dueDate: new Date('2024-12-15'), status: 'completed' }, { action: 'Install real-time stack PM monitor on H-101', assignedTo: 'Environmental Manager', dueDate: new Date('2025-03-31'), status: 'in_progress' }], date: new Date('2024-11-28'), reportedBy: 'Environmental Officer', investigatedBy: 'Environmental Manager', lessonsLearned: 'Need proactive emission management during adverse weather. Real-time monitoring enables early intervention before ambient standards are breached.', patternTags: ['air_quality', 'pm_emission', 'environmental_compliance', 'weather_impact'], preventiveMeasures: ['Weather-based emission management protocol', 'Real-time stack monitoring'], environmentalImpact: 'Ambient air quality exceedance — reported to CPCB' },
  { incidentId: 'INC-2025-001', type: 'near_miss', severity: 'medium', title: 'Pressure Safety Valve PSV-101 Failed to Lift During Test', description: 'During routine PSV testing, PSV-101 on atmospheric column T-101 overhead failed to lift at set pressure of 3.5 bar. Valve only lifted at 4.2 bar (20% above set pressure). This PSV is the primary overpressure protection for the column.', equipmentInvolved: ['PSV-101', 'T-101'], location: 'CDU-1 Column Overhead', rootCause: 'Valve internals (spring and disc) corroded due to moisture ingress in overhead vapour service. Last inspection 18 months ago — within 2-year inspection cycle but corrosion progressed faster than expected.', contributingFactors: ['Overhead service contains moisture and acid gases', 'Standard 2-year inspection cycle may be insufficient for this service', 'No online PSV monitoring system'], correctiveActions: [{ action: 'Replace PSV-101 with new valve — re-certify', assignedTo: 'Inspection Manager', dueDate: new Date('2025-02-15'), status: 'completed' }, { action: 'Reduce inspection interval to 12 months for all PSVs in wet/corrosive service', assignedTo: 'Inspection Manager', dueDate: new Date('2025-03-31'), status: 'completed' }], date: new Date('2025-01-10'), reportedBy: 'Instrument Technician', investigatedBy: 'Inspection Manager + Process Safety', lessonsLearned: 'PSV inspection intervals should be based on service severity, not just time-based. A PSV that fails to lift is a latent catastrophic hazard. Consider acoustic emission monitoring for critical PSVs.', patternTags: ['psv_failure', 'overpressure_protection', 'corrosion', 'inspection_frequency'], preventiveMeasures: ['Service-based PSV inspection scheduling', 'Acoustic emission monitoring evaluation'] },
  { incidentId: 'INC-2025-003', type: 'near_miss', severity: 'low', title: 'Cooling Water Chemistry Excursion — High Chloride', description: 'Cooling water chloride levels reached 380 ppm against target of <250 ppm. Blowdown valve BV-501 found stuck in partially closed position. Cycles of concentration reached 8 against target of 5. No immediate equipment impact observed.', equipmentInvolved: ['CT-501', 'BV-501'], location: 'Cooling Water System', rootCause: 'Blowdown control valve BV-501 stem corroded, preventing full opening. TDS-based automatic blowdown not functioning correctly.', contributingFactors: ['Valve stem corrosion in aggressive CW environment', 'Alarm for high TDS set too high — didnt activate early enough', 'Monthly water chemistry check — bi-weekly would have caught earlier'], correctiveActions: [{ action: 'Replace BV-501 with SS valve', assignedTo: 'Suresh Patil', dueDate: new Date('2025-04-15'), status: 'completed' }, { action: 'Revise TDS high alarm setpoint from 2500 to 2000 ppm', assignedTo: 'Instrument Dept', dueDate: new Date('2025-03-31'), status: 'completed' }], date: new Date('2025-03-05'), reportedBy: 'Chemical Treatment Operator', investigatedBy: 'Utilities Engineer', lessonsLearned: 'Cooling water chemistry excursions can cause cascading damage to heat exchangers and condensers. Automatic blowdown systems need regular maintenance and proper alarm settings.', patternTags: ['cooling_water', 'chemistry_excursion', 'valve_failure', 'corrosion'], preventiveMeasures: ['SS valve upgrade for CW blowdown', 'Bi-weekly chemistry monitoring'] },
];

// Build entities from all data sources
function buildEntities() {
  const entities = [
    // Equipment
    { name: 'P-101', type: 'equipment', subType: 'centrifugal_pump', description: 'Crude Feed Pump A — Main crude oil feed pump for CDU-1', attributes: { service: 'Crude Oil', capacity: '350 m³/h', power: '250 kW', speed: '2980 RPM', seal_type: 'Mechanical (John Crane 2800)', driver: 'Electric Motor M-101' } },
    { name: 'P-102', type: 'equipment', subType: 'centrifugal_pump', description: 'Crude Feed Pump B — Standby pump for CDU-1', attributes: { service: 'Crude Oil', capacity: '350 m³/h', power: '250 kW', status: 'Standby' } },
    { name: 'E-201A', type: 'equipment', subType: 'heat_exchanger', description: 'Crude Pre-heater A — Shell & tube heat exchanger', attributes: { type: 'Shell & Tube', shell_material: 'Carbon Steel', tube_material: 'SS316L', tubes: '450', area: '320 m²' } },
    { name: 'E-201B', type: 'equipment', subType: 'heat_exchanger', description: 'Crude Pre-heater B — Shell & tube heat exchanger', attributes: { type: 'Shell & Tube', status: 'Operational' } },
    { name: 'E-202', type: 'equipment', subType: 'heat_exchanger', description: 'Overhead Condenser — Air-cooled type', attributes: { type: 'Air Cooled', service: 'Naphtha Condensing' } },
    { name: 'T-101', type: 'equipment', subType: 'column', description: 'Atmospheric Distillation Column — 42 trays', attributes: { trays: '42', operating_pressure: '1.5 bar', height: '52 m', diameter: '5.2 m' } },
    { name: 'H-101', type: 'equipment', subType: 'furnace', description: 'Atmospheric Furnace — Crude heater', attributes: { duty: '85 MW', fuel: 'Refinery Fuel Gas', outlet_temp: '365°C' } },
    { name: 'C-301', type: 'equipment', subType: 'reciprocating_compressor', description: 'Hydrogen Compressor — BHEL 4HB-3', attributes: { make: 'BHEL', model: '4HB-3', capacity: '5000 Nm³/h', suction_pressure: '22 bar', discharge_pressure: '55 bar', driver: '800 kW Motor M-301' } },
    { name: 'V-201', type: 'equipment', subType: 'pressure_vessel', description: 'Crude Oil Desalter', attributes: { design_pressure: '15 bar', material: 'SA516 Gr70', wall_thickness: '22 mm' } },
    { name: 'D-101', type: 'equipment', subType: 'vessel', description: 'Desalter Vessel', attributes: { service: 'Crude Desalting', pressure: '12 bar' } },
    { name: 'P-501A', type: 'equipment', subType: 'centrifugal_pump', description: 'Cooling Water Circulation Pump A', attributes: { capacity: '7500 m³/h', power: '560 kW', service: 'Cooling Water' } },
    { name: 'P-501B', type: 'equipment', subType: 'centrifugal_pump', description: 'Cooling Water Circulation Pump B (Standby)', attributes: { capacity: '7500 m³/h', power: '560 kW', status: 'Standby' } },
    { name: 'CT-501', type: 'equipment', subType: 'cooling_tower', description: 'Cooling Tower — Natural draft', attributes: { capacity: '15000 m³/h' } },
    { name: 'CV-101', type: 'equipment', subType: 'control_valve', description: 'Crude Feed Flow Control Valve', attributes: { size: '8-inch', type: 'Globe', actuator: 'Pneumatic' } },
    { name: 'PSV-101', type: 'equipment', subType: 'safety_valve', description: 'Pressure Safety Valve — Column T-101 Overhead', attributes: { set_pressure: '3.5 bar', size: '6x8 inch' } },

    // Instruments
    { name: 'TT-101', type: 'instrument', subType: 'temperature_transmitter', description: 'Furnace H-101 outlet temperature transmitter', attributes: { range: '0-500°C', location: 'H-101 outlet' } },
    { name: 'PT-101', type: 'instrument', subType: 'pressure_transmitter', description: 'Column T-101 pressure transmitter', attributes: { range: '0-5 bar', location: 'T-101 top' } },
    { name: 'FT-101', type: 'instrument', subType: 'flow_transmitter', description: 'Crude feed flow transmitter', attributes: { range: '0-500 m³/h', type: 'Coriolis' } },
    { name: 'LT-101', type: 'instrument', subType: 'level_transmitter', description: 'Column T-101 bottoms level transmitter', attributes: { range: '0-100%', type: 'DP' } },
    { name: 'GA-101', type: 'instrument', subType: 'gas_detector', description: 'Hydrocarbon gas detector — CDU pump area', attributes: { type: 'Catalytic', alarm_1: '20% LEL', alarm_2: '40% LEL' } },
    { name: 'GA-301', type: 'instrument', subType: 'gas_detector', description: 'Hydrogen gas detector — Compressor area', attributes: { type: 'Electrochemical' } },

    // Personnel
    { name: 'Ravi Kumar', type: 'personnel', subType: 'technician', description: 'Senior Maintenance Technician — Rotating Equipment', attributes: { department: 'Mechanical Maintenance', experience: '15 years', specialization: 'Pumps & Compressors' } },
    { name: 'Suresh Patil', type: 'personnel', subType: 'technician', description: 'Maintenance Technician — Pumps & Piping', attributes: { department: 'Mechanical Maintenance', experience: '12 years' } },
    { name: 'Vikram Joshi', type: 'personnel', subType: 'technician', description: 'Compressor Specialist', attributes: { department: 'Mechanical Maintenance', experience: '20 years', specialization: 'Reciprocating Compressors' } },
    { name: 'R.K. Sharma', type: 'personnel', subType: 'inspector', description: 'Senior Inspector — API-510, API-570 Certified', attributes: { department: 'Inspection', certifications: 'API-510, API-570, NACE CIP-2' } },
    { name: 'Amit Desai', type: 'personnel', subType: 'technician', description: 'Instrument & Control Technician', attributes: { department: 'Instrument Maintenance', experience: '8 years' } },

    // Regulations
    { name: 'OISD-116', type: 'regulation', description: 'Fire Protection Facilities for Petroleum Refineries and Oil/Gas Processing Plants', attributes: { issuer: 'OISD', last_revision: '2020' } },
    { name: 'OISD-144', type: 'regulation', description: 'Pipeline Integrity Management System for Petroleum Industry', attributes: { issuer: 'OISD', last_revision: '2019' } },
    { name: 'Factory Act 1948', type: 'regulation', description: 'The Factories Act, 1948 — Occupational Health and Safety', attributes: { issuer: 'Government of India' } },
    { name: 'PESO Rules', type: 'regulation', description: 'Petroleum and Explosives Safety Organisation — SMPV and Petroleum Rules', attributes: { issuer: 'PESO/DPIIT' } },
    { name: 'CPCB Emission Standards', type: 'regulation', description: 'Central Pollution Control Board — Air Emission and Effluent Standards', attributes: { issuer: 'CPCB/MoEFCC' } },

    // Locations
    { name: 'CDU-1', type: 'location', description: 'Crude Distillation Unit 1 — Main process unit', attributes: { area: 'Process Block A' } },
    { name: 'Hydrogen Unit', type: 'location', description: 'Hydrogen Generation and Compression Area', attributes: { area: 'Process Block C' } },
    { name: 'CW System', type: 'location', description: 'Cooling Water System — Utilities Area', attributes: { area: 'Utilities Block' } },

    // Chemicals
    { name: 'Arabian Light Crude', type: 'chemical', description: 'Feed crude oil — Arabian Light grade', attributes: { API_gravity: '33', sulphur: '1.8%' } },
    { name: 'Hydrogen', type: 'chemical', description: 'Process hydrogen for hydroprocessing', attributes: { purity: '99.9%', pressure: '55 bar' } },
  ];

  return entities;
}

function buildEdges(entityMap) {
  const edges = [
    // Equipment connections
    { source: 'P-101', target: 'E-201A', relationship: 'feeds_into' },
    { source: 'P-102', target: 'E-201A', relationship: 'feeds_into' },
    { source: 'E-201A', target: 'H-101', relationship: 'feeds_into' },
    { source: 'E-201B', target: 'H-101', relationship: 'feeds_into' },
    { source: 'H-101', target: 'T-101', relationship: 'feeds_into' },
    { source: 'T-101', target: 'E-202', relationship: 'connected_to' },
    { source: 'D-101', target: 'P-101', relationship: 'feeds_into' },
    { source: 'P-501A', target: 'CT-501', relationship: 'part_of' },
    { source: 'P-501B', target: 'CT-501', relationship: 'part_of' },
    { source: 'CT-501', target: 'E-201A', relationship: 'feeds_into' },
    { source: 'CT-501', target: 'E-202', relationship: 'feeds_into' },
    { source: 'CV-101', target: 'P-101', relationship: 'controls' },
    { source: 'PSV-101', target: 'T-101', relationship: 'connected_to' },

    // Instruments monitoring equipment
    { source: 'TT-101', target: 'H-101', relationship: 'monitors' },
    { source: 'PT-101', target: 'T-101', relationship: 'monitors' },
    { source: 'FT-101', target: 'P-101', relationship: 'monitors' },
    { source: 'LT-101', target: 'T-101', relationship: 'monitors' },
    { source: 'GA-101', target: 'P-101', relationship: 'monitors' },
    { source: 'GA-301', target: 'C-301', relationship: 'monitors' },

    // Personnel maintaining equipment
    { source: 'Ravi Kumar', target: 'P-101', relationship: 'maintained_by' },
    { source: 'Suresh Patil', target: 'P-101', relationship: 'maintained_by' },
    { source: 'Suresh Patil', target: 'P-501A', relationship: 'maintained_by' },
    { source: 'Vikram Joshi', target: 'C-301', relationship: 'maintained_by' },
    { source: 'R.K. Sharma', target: 'E-201A', relationship: 'inspected_by' },
    { source: 'R.K. Sharma', target: 'V-201', relationship: 'inspected_by' },
    { source: 'Amit Desai', target: 'CV-101', relationship: 'maintained_by' },

    // Regulations applicable to equipment
    { source: 'OISD-116', target: 'CT-501', relationship: 'regulated_by' },
    { source: 'OISD-144', target: 'P-101', relationship: 'regulated_by' },
    { source: 'Factory Act 1948', target: 'V-201', relationship: 'regulated_by' },
    { source: 'Factory Act 1948', target: 'T-101', relationship: 'regulated_by' },
    { source: 'PESO Rules', target: 'V-201', relationship: 'regulated_by' },
    { source: 'CPCB Emission Standards', target: 'H-101', relationship: 'regulated_by' },

    // Equipment location
    { source: 'P-101', target: 'CDU-1', relationship: 'located_at' },
    { source: 'P-102', target: 'CDU-1', relationship: 'located_at' },
    { source: 'E-201A', target: 'CDU-1', relationship: 'located_at' },
    { source: 'T-101', target: 'CDU-1', relationship: 'located_at' },
    { source: 'H-101', target: 'CDU-1', relationship: 'located_at' },
    { source: 'C-301', target: 'Hydrogen Unit', relationship: 'located_at' },
    { source: 'P-501A', target: 'CW System', relationship: 'located_at' },
    { source: 'CT-501', target: 'CW System', relationship: 'located_at' },

    // Chemical associations
    { source: 'Arabian Light Crude', target: 'P-101', relationship: 'references' },
    { source: 'Arabian Light Crude', target: 'T-101', relationship: 'references' },
    { source: 'Hydrogen', target: 'C-301', relationship: 'references' },
  ];

  return edges.map(e => ({
    sourceEntityId: entityMap[e.source],
    targetEntityId: entityMap[e.target],
    relationship: e.relationship,
    confidence: 0.95
  })).filter(e => e.sourceEntityId && e.targetEntityId);
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/intelliplant');
    console.log('📦 Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      Document.deleteMany({}),
      Entity.deleteMany({}),
      KnowledgeEdge.deleteMany({}),
      Embedding.deleteMany({}),
      MaintenanceRecord.deleteMany({}),
      ComplianceRule.deleteMany({}),
      Incident.deleteMany({})
    ]);

    // Seed documents
    console.log('📄 Seeding documents...');
    const docs = await Document.insertMany(documents);
    console.log(`   ✅ ${docs.length} documents created`);

    // Seed entities
    console.log('🏷️  Seeding entities...');
    const entityData = buildEntities();
    const docIds = docs.map(d => d._id);
    const entityMap = {};

    for (const ent of entityData) {
      // Assign random documents to each entity
      const assignedDocs = docIds.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 3) + 1);
      const created = await Entity.create({
        ...ent,
        documentIds: assignedDocs,
        confidence: 0.85 + Math.random() * 0.15,
        attributes: ent.attributes || {}
      });
      entityMap[ent.name] = created._id;
    }
    console.log(`   ✅ ${entityData.length} entities created`);

    // Seed knowledge edges
    console.log('🔗 Seeding knowledge edges...');
    const edges = buildEdges(entityMap);
    await KnowledgeEdge.insertMany(edges);
    console.log(`   ✅ ${edges.length} relationships created`);

    // Seed maintenance records
    console.log('🔧 Seeding maintenance records...');
    const mRecords = await MaintenanceRecord.insertMany(maintenanceRecords);
    console.log(`   ✅ ${mRecords.length} maintenance records created`);

    // Seed compliance rules
    console.log('📋 Seeding compliance rules...');
    const cRules = await ComplianceRule.insertMany(complianceRules);
    console.log(`   ✅ ${cRules.length} compliance rules created`);

    // Seed incidents
    console.log('⚠️  Seeding incidents...');
    const incs = await Incident.insertMany(incidents);
    console.log(`   ✅ ${incs.length} incidents created`);

    console.log(`
╔══════════════════════════════════════════════════╗
║                                                  ║
║   🌱 Seed Data Complete!                         ║
║   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                  ║
║   Documents:    ${docs.length.toString().padEnd(6)}                        ║
║   Entities:     ${entityData.length.toString().padEnd(6)}                        ║
║   Relationships:${edges.length.toString().padEnd(6)}                        ║
║   Maintenance:  ${mRecords.length.toString().padEnd(6)}                        ║
║   Compliance:   ${cRules.length.toString().padEnd(6)}                        ║
║   Incidents:    ${incs.length.toString().padEnd(6)}                        ║
║                                                  ║
╚══════════════════════════════════════════════════╝
    `);

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Seed error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
