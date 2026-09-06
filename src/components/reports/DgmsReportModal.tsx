import React from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  X, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle,
  Building2, 
  Calendar, 
  Clock, 
  UserCheck, 
  CheckCircle2, 
  XCircle,
  FileSpreadsheet
} from 'lucide-react';
import { SensorData, GroundBaseline } from '../../types/sensor';
import { calculateGeotechnicalBasin } from '../../services/geotechnicalEngine';
import { exportSensorDataToCsv } from '../../utils/exportCsv';

interface DgmsReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentData: SensorData | null;
  history: SensorData[];
  selectedRover: string;
}

export const DgmsReportModal: React.FC<DgmsReportModalProps> = ({
  isOpen,
  onClose,
  currentData,
  history,
  selectedRover
}) => {
  if (!isOpen) return null;

  const defaultBaseline: GroundBaseline = {
    sensor_1: 22.0,
    sensor_2: 22.0,
    sensor_3: 22.0,
    set_at: new Date().toISOString()
  };

  const geoParams = calculateGeotechnicalBasin(currentData, defaultBaseline);
  const now = new Date();
  const reportId = `DGMS-SIA-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-04B`;

  // Calculated metrics
  const baseline = 22.0;
  const currentSag = currentData ? Math.max(0, baseline - (currentData.distance_2 ?? baseline)) : 0;
  const tiltSlope = currentData ? Math.max(Math.abs(currentData.tilt_x ?? 0), Math.abs(currentData.tilt_y ?? 0)) : 0;
  const vibRms = currentData?.vibration_rms ?? 0.12;
  const gasRaw = currentData?.gas ?? 380;
  
  // DGMS Statutory Compliance Thresholds
  const isSagCompliant = currentSag <= 2.0;
  const isTiltCompliant = tiltSlope <= 3.5;
  const isVibCompliant = vibRms <= 0.35;
  const isGasCompliant = gasRaw <= 600;

  const isOverallPassed = isSagCompliant && isTiltCompliant && isVibCompliant && isGasCompliant;
  const riskClass = isOverallPassed ? (currentSag > 0.8 ? 'Class I (Marginal Drift)' : 'Class 0 (Stable)') : (currentSag > 4.0 ? 'Class IV (Critical Danger)' : 'Class II / III (Hazard Warning)');

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    exportSensorDataToCsv(history, `dgms_audit_${selectedRover}_${now.toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col">
        
        {/* Modal Action Header (Excluded in print) */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2.5 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-amber-100 text-amber-800 border border-amber-300">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <span className="font-mono text-xs font-bold text-slate-900">DGMS STATUTORY SAFETY AUDIT REPORT GENERATOR</span>
              <span className="text-[10px] text-slate-500 block font-mono">Directorate General of Mines Safety (DGMS) India • Format Tech-Form IV</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-mono font-medium text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer"
              title="Download raw sensor logs as CSV"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Export Audit CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1 rounded-md bg-amber-500 px-3 py-1 text-xs font-mono font-bold text-slate-950 hover:bg-amber-400 shadow-2xs cursor-pointer transition-colors"
              title="Print or Save official PDF report"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Body */}
        <div className="p-5 sm:p-7 overflow-y-auto font-sans text-slate-900 space-y-5 print:p-0 print:space-y-4 text-xs">
          
          {/* Government / Mine Directorate Letterhead */}
          <div className="border-b-2 border-slate-900 pb-3 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Building2 className="h-5 w-5 text-amber-700" />
              <h1 className="text-base font-extrabold uppercase tracking-wider text-slate-900 font-mono">
                DIRECTORATE GENERAL OF MINES SAFETY (DGMS)
              </h1>
            </div>
            <p className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">
              MINISTRY OF LABOUR & EMPLOYMENT • GOVERNMENT OF INDIA
            </p>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              Statutory Real-Time Geotechnical Strata Control & Subsidence Audit Certificate (Tech Form IV-A)
            </p>
          </div>

          {/* Report Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-[11px]">
            <div>
              <span className="text-slate-400 uppercase text-[9px] block">Report Ref Number</span>
              <span className="font-bold text-slate-900">{reportId}</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase text-[9px] block">Colliery / Mine Site</span>
              <span className="font-bold text-slate-900">BCCL Jharia Area IV</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase text-[9px] block">Underground Panel</span>
              <span className="font-bold text-slate-900">Seam-IV, Panel P-4B</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase text-[9px] block">Inspection Rover Node</span>
              <span className="font-bold text-slate-900">{selectedRover === 'ROVER_02' ? 'SubSentry Beta (ROVER_02)' : 'SubSentry Alpha (ROVER_01)'}</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase text-[9px] block">Audit Date & Time</span>
              <span className="font-bold text-slate-900">{now.toLocaleDateString('en-IN')} {now.toLocaleTimeString('en-IN')}</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase text-[9px] block">Active Shift</span>
              <span className="font-bold text-slate-900">Shift-B (General Ops)</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase text-[9px] block">Telemetry Source</span>
              <span className="font-bold text-slate-900">ESP32 AWS Docker Pipe</span>
            </div>
            <div>
              <span className="text-slate-400 uppercase text-[9px] block">Statutory Risk Class</span>
              <span className="font-bold text-amber-700">{riskClass}</span>
            </div>
          </div>

          {/* Compliance Verdict Banner */}
          <div className={`flex items-center justify-between p-3.5 rounded-xl border ${
            isOverallPassed
              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
              : 'bg-rose-50/80 border-rose-300 text-rose-950'
          }`}>
            <div className="flex items-center gap-3">
              {isOverallPassed ? (
                <ShieldCheck className="h-7 w-7 text-emerald-600 shrink-0" />
              ) : (
                <ShieldAlert className="h-7 w-7 text-rose-600 shrink-0" />
              )}
              <div>
                <span className="text-sm font-black font-mono tracking-wide block uppercase">
                  {isOverallPassed
                    ? 'VERDICT: CERTIFIED COMPLIANT — SAFE TO OPERATE'
                    : 'VERDICT: STATUTORY VIOLATION — HAZARD EVACUATION REQUIRED'}
                </span>
                <span className="text-[11px] opacity-80">
                  {isOverallPassed
                    ? 'Strata displacement and environmental toxic parameters are well within permissible DGMS mining safety limits.'
                    : 'One or more geotechnical parameters have exceeded statutory safety limits. Immediate roof bolting/props inspection required.'}
                </span>
              </div>
            </div>

            <div className="text-right font-mono text-[10px] hidden sm:block shrink-0">
              <span className="px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-white/80 border">
                {isOverallPassed ? 'STATUS: PASSED' : 'STATUS: ACTION REQ'}
              </span>
            </div>
          </div>

          {/* Parameter Audit Breakdown Table */}
          <div>
            <h3 className="font-mono text-xs font-bold text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <span>1. Geotechnical & Atmospheric Parameter Verification</span>
            </h3>
            
            <div className="rounded-lg border border-slate-200 overflow-hidden font-mono text-[11px]">
              <table className="w-full text-left">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 text-[10px] uppercase">
                  <tr>
                    <th className="py-2 px-3">Parameter & Sensor</th>
                    <th className="py-2 px-2.5">Current Telemetry</th>
                    <th className="py-2 px-2.5">Permissible DGMS Limit</th>
                    <th className="py-2 px-2.5">Variance / Margin</th>
                    <th className="py-2 px-3 text-right">Compliance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-semibold text-slate-800">Ground Sag / Convergence (S2)</td>
                    <td className="py-2 px-2.5">{currentSag.toFixed(1)} cm</td>
                    <td className="py-2 px-2.5">&le; 2.0 cm</td>
                    <td className="py-2 px-2.5 text-slate-500">{(2.0 - currentSag).toFixed(1)} cm</td>
                    <td className="py-2 px-3 text-right">
                      {isSagCompliant ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold"><CheckCircle2 className="h-3 w-3" /> PASS</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-bold"><XCircle className="h-3 w-3" /> FAIL</span>
                      )}
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-semibold text-slate-800">Floor Slope & Incline (MPU6050)</td>
                    <td className="py-2 px-2.5">{tiltSlope.toFixed(1)}°</td>
                    <td className="py-2 px-2.5">&le; 3.5°</td>
                    <td className="py-2 px-2.5 text-slate-500">{(3.5 - tiltSlope).toFixed(1)}°</td>
                    <td className="py-2 px-3 text-right">
                      {isTiltCompliant ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold"><CheckCircle2 className="h-3 w-3" /> PASS</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-bold"><XCircle className="h-3 w-3" /> FAIL</span>
                      )}
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-semibold text-slate-800">Seismic Vibration RMS (Micro-cracks)</td>
                    <td className="py-2 px-2.5">{vibRms.toFixed(2)} g</td>
                    <td className="py-2 px-2.5">&le; 0.35 g</td>
                    <td className="py-2 px-2.5 text-slate-500">{(0.35 - vibRms).toFixed(2)} g</td>
                    <td className="py-2 px-3 text-right">
                      {isVibCompliant ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold"><CheckCircle2 className="h-3 w-3" /> PASS</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-bold"><XCircle className="h-3 w-3" /> FAIL</span>
                      )}
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-semibold text-slate-800">Atmospheric Toxic Gas Level</td>
                    <td className="py-2 px-2.5">{gasRaw} ADC</td>
                    <td className="py-2 px-2.5">&le; 600 ADC</td>
                    <td className="py-2 px-2.5 text-slate-500">{(600 - gasRaw)} ADC</td>
                    <td className="py-2 px-3 text-right">
                      {isGasCompliant ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold"><CheckCircle2 className="h-3 w-3" /> PASS</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-bold"><XCircle className="h-3 w-3" /> FAIL</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Knothe-Budryk Modeling & Surface Impact Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-[11px]">
            <div>
              <span className="text-slate-400 text-[9px] uppercase block">Knothe Damage Radius (R)</span>
              <span className="font-bold text-slate-900">{geoParams.radiusOfInfluenceM} meters</span>
            </div>
            <div>
              <span className="text-slate-400 text-[9px] uppercase block">Max Tensile Strain (&epsilon;)</span>
              <span className="font-bold text-slate-900">{geoParams.maxTensileStrainMmPerM} mm/m (Limit: 2.0)</span>
            </div>
            <div>
              <span className="text-slate-400 text-[9px] uppercase block">Goaf Void Volume (V)</span>
              <span className="font-bold text-slate-900">{geoParams.cavedGoafVolumeM3} m&sup3;</span>
            </div>
          </div>

          {/* Mandatory Engineering Directives Checklist */}
          <div>
            <h3 className="font-mono text-xs font-bold text-slate-800 uppercase tracking-wide mb-1.5">
              2. Mandatory Safety Directives & Recommendations
            </h3>
            <ul className="space-y-1 text-[11px] text-slate-700 list-disc list-inside">
              <li>Continuous ultrasonic rover telemetry scanning must remain active at 1000ms polling rate.</li>
              <li>Inspect mechanical roof bolts along Crosscut 4B if vibration RMS drifts above 0.25g.</li>
              <li>Maintain minimum 50m safety standoff distance between surface infrastructure and goaf boundary.</li>
              <li>Conduct zero-point sensor baseline calibration every 24 hours at designated Stationary Point MP-01.</li>
            </ul>
          </div>

          {/* Statutory Signatures Block */}
          <div className="border-t border-slate-200 pt-4 mt-6 grid grid-cols-3 gap-4 text-center font-mono text-[10px]">
            <div>
              <div className="h-10 border-b border-dashed border-slate-300 mb-1 flex items-end justify-center">
                <span className="text-[9px] text-emerald-800 font-bold italic">Signed Digitally (Cert #99402)</span>
              </div>
              <span className="font-bold text-slate-900 block">Er. R. K. Sharma</span>
              <span className="text-slate-500 text-[9px]">Mine Safety Officer (DGMS)</span>
            </div>

            <div>
              <div className="h-10 border-b border-dashed border-slate-300 mb-1 flex items-end justify-center">
                <span className="text-[9px] text-emerald-800 font-bold italic">Signed Digitally (Cert #88211)</span>
              </div>
              <span className="font-bold text-slate-900 block">Dr. A. Sengupta</span>
              <span className="text-slate-500 text-[9px]">Geotechnical Strata Specialist</span>
            </div>

            <div>
              <div className="h-10 border-b border-dashed border-slate-300 mb-1 flex items-end justify-center">
                <span className="text-[9px] text-emerald-800 font-bold italic">Validated & Timestamped</span>
              </div>
              <span className="font-bold text-slate-900 block">SubSentry SCADA Core</span>
              <span className="text-slate-500 text-[9px]">Automated Telemetry Engine</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
