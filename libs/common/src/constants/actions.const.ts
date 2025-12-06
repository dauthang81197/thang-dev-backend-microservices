import {
  ActionEnum,
  MedicalCycleActionEnum,
  PatientsActionEnum,
  SysBulletinActionEnum,
  TaskActionEnum,
} from '../enum/action.enum';

export const ACTIONS = [
  // NORMAL - MODULE
  { name: 'View', code: ActionEnum.VIEW },
  { name: 'View document', code: ActionEnum.VIEW_DOCUMENT },
  { name: 'Add', code: ActionEnum.CREATE },
  { name: 'Update', code: ActionEnum.EDIT },
  { name: 'Delete', code: ActionEnum.DELETE },
  { name: 'Import', code: ActionEnum.IMPORT },
  { name: 'Export', code: ActionEnum.EXPORT },
];

export const BULLETINS_ACTIONS = [
  // BULLETINS --- MODULE
  // Announcements tab
  { name: 'View', code: SysBulletinActionEnum.B_A_TAB_VIEW },
  { name: 'Add', code: SysBulletinActionEnum.B_A_TAB_CREATE },
  { name: 'Update', code: SysBulletinActionEnum.B_A_TAB_EDIT },
  { name: 'Delete', code: SysBulletinActionEnum.B_A_TAB_DELETE },
  // Notifications tab
  { name: 'View', code: SysBulletinActionEnum.B_N_TAB_VIEW },
  { name: 'Add', code: SysBulletinActionEnum.B_N_TAB_CREATE },
  { name: 'Update', code: SysBulletinActionEnum.B_N_TAB_EDIT },
  { name: 'Delete', code: SysBulletinActionEnum.B_N_TAB_DELETE },
];

export const MEDICAL_CYCLE_ACTIONS = [
  // MEDICAL CYCLE --- MODULE
  // Medical cycle - Listing
  {
    name: 'View List',
    code: MedicalCycleActionEnum.MC_L_VIEW_LIST,
  },
  {
    name: 'Export',
    code: MedicalCycleActionEnum.MC_L_EXPORT,
  },
  {
    name: 'Add Patient Note',
    code: MedicalCycleActionEnum.MC_L_ADD_PATIENT_NOTE,
  },
  {
    name: 'Close Cycle',
    code: MedicalCycleActionEnum.MC_L_CLOSE_CYCLE,
  },
  // Medical cycle - Overview Tab
  {
    name: 'View Overview',
    code: MedicalCycleActionEnum.MC_O_TAB_VIEW_OVERVIEW,
  },
  {
    name: 'Update BSA Report',
    code: MedicalCycleActionEnum.MC_O_TAB_UPDATE_BSA_REPORT,
  },
  {
    name: 'Update Initial Consult',
    code: MedicalCycleActionEnum.MC_O_TAB_UPDATE_INITIAL_CONSULT,
  },
  {
    name: 'Update Patient Information',
    code: MedicalCycleActionEnum.MC_O_TAB_UPDATE_PATIENT_INFORMATION,
  },
  // Medical cycle - Cycle Progress Tab
  {
    name: 'View Cycle Progress',
    code: MedicalCycleActionEnum.MC_CP_TAB_VIEW_CYCLE_PROGRESS,
  },
  {
    name: 'Update BSA Report',
    code: MedicalCycleActionEnum.MC_CP_TAB_UPDATE_BSA_REPORT,
  },
  {
    name: 'Update Test Result',
    code: MedicalCycleActionEnum.MC_CP_TAB_UPDATE_TEST_RESULT,
  },
  {
    name: 'Add Treatment Component',
    code: MedicalCycleActionEnum.MC_CP_TAB_ADD_TREATMENT_COMPONENT,
  },
  {
    name: 'Update Treatment Component',
    code: MedicalCycleActionEnum.MC_CP_TAB_UPDATE_TREATMENT_COMPONENT,
  },
  {
    name: 'Add Patient Note',
    code: MedicalCycleActionEnum.MC_CP_TAB_ADD_PATIENT_NOTE,
  },
  {
    name: 'Run Calculation Logic',
    code: MedicalCycleActionEnum.MC_CP_TAB_RUN_CALCULATION_LOGIC,
  },
  {
    name: 'Close Cycle',
    code: MedicalCycleActionEnum.MC_CP_TAB_CLOSE_CYCLE,
  },
  // Medical cycle - Symptom Tab
  {
    name: 'View Symptom',
    code: MedicalCycleActionEnum.MC_S_TAB_VIEW_SYMPTOM,
  },
  {
    name: 'Update Symptom',
    code: MedicalCycleActionEnum.MC_S_TAB_UPDATE_SYMPTOM,
  },
  // Medical cycle - Medical Test Tab
  {
    name: 'View List Medical Test',
    code: MedicalCycleActionEnum.MC_MT_TAB_VIEW_LIST_MEDICAL_TEST,
  },
  {
    name: 'View Detail Medical Test',
    code: MedicalCycleActionEnum.MC_MT_TAB_VIEW_DETAIL_MEDICAL_TEST,
  },
  {
    name: 'Update Initial Consult',
    code: MedicalCycleActionEnum.MC_MT_TAB_UPDATE_INITIAL_CONSULT,
  },
  {
    name: 'Update Patient Information',
    code: MedicalCycleActionEnum.MC_MT_TAB_UPDATE_PATIENT_INFORMATION,
  },
  {
    name: 'Update Test Result',
    code: MedicalCycleActionEnum.MC_MT_TAB_UPDATE_TEST_RESULT,
  },
  {
    name: 'Export Medical Test',
    code: MedicalCycleActionEnum.MC_MT_TAB_EXPORT_MEDICAL_TEST,
  },
  // Medical cycle - Treatment Tab
  {
    name: 'View Treatment',
    code: MedicalCycleActionEnum.MC_T_TAB_VIEW_TREATMENT,
  },
  {
    name: 'View Detail Treatment Component',
    code: MedicalCycleActionEnum.MC_T_TAB_VIEW_DETAIL_TREATMENT_COMPONENT,
  },
  {
    name: 'Update Treatment Component',
    code: MedicalCycleActionEnum.MC_T_TAB_UPDATE_TREATMENT_COMPONENT,
  },
];
export const PATIENTS_ACTIONS = [
  // PATIENTS --- MODULE
  //   Patients - Listing
  {
    name: 'View List',
    code: PatientsActionEnum.P_L_VIEW_LIST,
  },
  { name: 'Add', code: PatientsActionEnum.P_L_CREATE },
  { name: 'Export', code: PatientsActionEnum.P_L_EXPORT },
  // Patients - Main Detail Tab
  {
    name: 'View Main detail',
    code: PatientsActionEnum.P_MD_TAB_VIEW_MAIN_DETAIL,
  },
  {
    name: 'Update Patient Information',
    code: PatientsActionEnum.P_MD_TAB_UPDATE_PATIENT_INFORMATION,
  },
  // Patients - Initial Consult Tab
  {
    name: 'View Initial Consult',
    code: PatientsActionEnum.P_IC_TAB_VIEW_INITIAL_CONSULT,
  },
  {
    name: 'Update Initial Consult',
    code: PatientsActionEnum.P_IC_TAB_UPDATE_INITIAL_CONSULT,
  },
  // Patients - BSA Report Tab
  {
    name: 'View BSA Report',
    code: PatientsActionEnum.P_BR_TAB_VIEW_BSA_REPORT,
  },
  {
    name: 'Update BSA Report',
    code: PatientsActionEnum.P_BR_TAB_UPDATE_BSA_REPORT,
  },
  // Patients - Medical Cycle Tab
  {
    name: 'View Overview',
    code: PatientsActionEnum.P_MC_TAB_VIEW_OVERVIEW,
  },
  {
    name: 'Create Patient Cycle',
    code: PatientsActionEnum.P_MC_TAB_CREATE_PATIENT_CYCLE,
  },
  // Patients - Symptom Tab
  {
    name: 'View Symptom',
    code: PatientsActionEnum.P_S_TAB_VIEW_SYMPTOM,
  },
  // Patients - Medical Test Tab
  {
    name: 'View List Medical Test ',
    code: PatientsActionEnum.P_MT_TAB_VIEW_LIST_MEDICAL_TEST,
  },
  {
    name: 'View Detail Medical Test',
    code: PatientsActionEnum.P_MT_TAB_VIEW_DETAIL_MEDICAL_TEST,
  },
  // Patients - Patient Note Tab
  {
    name: 'View Patient Note',
    code: PatientsActionEnum.P_PN_TAB_VIEW_PATIENT_NOTE,
  },
  {
    name: 'Add Patient Note',
    code: PatientsActionEnum.P_PN_TAB_ADD_PATIENT_NOTE,
  },
];

export const TASKS_ACTIONS = [
  {
    name: 'View',
    code: TaskActionEnum.OVERVIEW_TAB_VIEW,
  },
  { name: 'View', code: TaskActionEnum.TASK_LIST_TAB_VIEW },
  { name: 'Add', code: TaskActionEnum.TASK_LIST_TAB_ADD },
  { name: 'Update ', code: TaskActionEnum.TASK_LIST_TAB_UPDATE },
  { name: 'Delete', code: TaskActionEnum.TASK_LIST_TAB_DELETE },

  { name: 'View', code: TaskActionEnum.TEMPLATE_TAB_VIEW },
  { name: 'Add', code: TaskActionEnum.TEMPLATE_TAB_ADD },
  { name: 'Update', code: TaskActionEnum.TEMPLATE_TAB_UPDATE },
  { name: 'Delete', code: TaskActionEnum.TEMPLATE_TAB_DELETE },

  { name: 'View', code: TaskActionEnum.CATEGORY_TAB_VIEW },
  { name: 'Add', code: TaskActionEnum.CATEGORY_TAB_ADD },
  {
    name: 'Update',
    code: TaskActionEnum.CATEGORY_TAB_UPDATE,
  },
  {
    name: 'Delete',
    code: TaskActionEnum.CATEGORY_TAB_DELETE,
  },
];
