export type License =
  | 'Process Modeler'
  | 'Collaboration Hub'
  | 'Workflow Accelerator'
  | 'Process Transformation Manager'
  | 'JM Advanced'
  | 'Process Intelligence'
  | 'Process Transformation Manager Insights and Initiatives'

export type User = {
  id: string
  initials: string
  colorScheme: string
  name: string
  email: string
  title: string
  firstName: string
  lastName: string
  phone: string
  company: string
  lastLogin: string
  memberSince: string
  status: 'Active' | 'Suspended' | 'Invited'
  authMethod: 'SSO' | 'Local'
  isAdmin: boolean
  licenses: License[]
  groups: string[]
  accessRights: string[]
}

export const ALL_LICENSES: License[] = [
  'Process Modeler',
  'Collaboration Hub',
  'Workflow Accelerator',
  'Process Transformation Manager',
  'JM Advanced',
  'Process Intelligence',
  'Process Transformation Manager Insights and Initiatives',
]

export const USERS: User[] = [
  {
    id: '1', initials: 'AS', colorScheme: 'Accent1',
    name: 'Anna Smidth', email: 'anna.smidth@acme.com',
    title: 'Miss', firstName: 'Anna', lastName: 'Schmidth', phone: '012938118344', company: 'Acme Blue',
    lastLogin: '2026-06-10', isAdmin: true, memberSince: '2021-03-15', status: 'Active', authMethod: 'SSO',
    licenses: ['Process Modeler', 'Collaboration Hub', 'Process Transformation Manager', 'Process Intelligence', 'Process Transformation Manager Insights and Initiatives'],
    groups: ['Administrators', 'Human Resources'],
    accessRights: ['Shared documents: Hide, Read, Write, Delete, Print', 'Dictionary: Hide, Read, Write, Delete, Print'],
  },
  {
    id: '2', initials: 'MR', colorScheme: 'Accent2',
    name: 'Marco Rossi', email: 'marco.rossi@acme.com',
    title: 'Mr', firstName: 'Marco', lastName: 'Rossi', phone: '0301234567', company: 'Acme Blue',
    lastLogin: '2026-06-11', isAdmin: false, memberSince: '2022-07-01', status: 'Active', authMethod: 'Local',
    licenses: ['Process Modeler', 'Collaboration Hub'],
    groups: ['Modelers'],
    accessRights: ['Shared documents: Read, Write', 'Dictionary: Read'],
  },
  {
    id: '3', initials: 'LF', colorScheme: 'Accent3',
    name: 'Lena Fischer', email: 'lena.fischer@acme.com',
    title: 'Ms', firstName: 'Lena', lastName: 'Fischer', phone: '0691234567', company: 'TechCorp',
    lastLogin: '2026-05-28', isAdmin: false, memberSince: '2023-01-10', status: 'Active', authMethod: 'SSO',
    licenses: ['Process Modeler', 'Process Intelligence'],
    groups: ['Analysts'],
    accessRights: ['Shared documents: Read', 'Dictionary: Read'],
  },
  {
    id: '4', initials: 'JP', colorScheme: 'Accent4',
    name: 'James Park', email: 'james.park@acme.com',
    title: 'Mr', firstName: 'James', lastName: 'Park', phone: '0211234567', company: 'InnovateCo',
    lastLogin: '2026-06-09', isAdmin: true, memberSince: '2020-11-20', status: 'Active', authMethod: 'SSO',
    licenses: ['Process Modeler', 'Collaboration Hub', 'Process Transformation Manager'],
    groups: ['Administrators'],
    accessRights: ['Shared documents: Hide, Read, Write, Delete, Print', 'Dictionary: Read, Write'],
  },
  {
    id: '5', initials: 'SL', colorScheme: 'Accent5',
    name: 'Sara López', email: 'sara.lopez@acme.com',
    title: 'Ms', firstName: 'Sara', lastName: 'López', phone: '0891234567', company: 'GlobalCo',
    lastLogin: '2026-04-15', isAdmin: false, memberSince: '2023-09-05', status: 'Suspended', authMethod: 'Local',
    licenses: ['Collaboration Hub'],
    groups: ['Human Resources'],
    accessRights: ['Shared documents: Read', 'Dictionary: Hide'],
  },
  {
    id: '6', initials: 'YT', colorScheme: 'Accent6',
    name: 'Yuki Tanaka', email: 'yuki.tanaka@acme.com',
    title: '', firstName: 'Yuki', lastName: 'Tanaka', phone: '0711234567', company: 'Acme Blue',
    lastLogin: '2026-06-12', isAdmin: false, memberSince: '2022-04-18', status: 'Active', authMethod: 'SSO',
    licenses: ['Process Modeler', 'Process Intelligence'],
    groups: ['Modelers'],
    accessRights: ['Shared documents: Read, Write', 'Dictionary: Read'],
  },
  {
    id: '7', initials: 'EM', colorScheme: 'Accent7',
    name: 'Elena Müller', email: 'elena.mueller@acme.com',
    title: 'Dr', firstName: 'Elena', lastName: 'Müller', phone: '0612345678', company: 'ConsultPro',
    lastLogin: '2026-06-01', isAdmin: true, memberSince: '2019-06-01', status: 'Active', authMethod: 'SSO',
    licenses: ['Process Modeler', 'Collaboration Hub', 'JM Advanced'],
    groups: ['Administrators', 'Analysts'],
    accessRights: ['Shared documents: Hide, Read, Write, Delete, Print', 'Dictionary: Hide, Read, Write, Delete, Print'],
  },
  {
    id: '8', initials: 'DC', colorScheme: 'Accent8',
    name: 'David Chen', email: 'david.chen@acme.com',
    title: 'Mr', firstName: 'David', lastName: 'Chen', phone: '0312345678', company: 'DataViz Inc',
    lastLogin: '2026-05-20', isAdmin: false, memberSince: '2024-02-12', status: 'Active', authMethod: 'Local',
    licenses: ['Process Intelligence', 'Workflow Accelerator'],
    groups: ['Analysts'],
    accessRights: ['Shared documents: Read', 'Dictionary: Read'],
  },
  {
    id: '9', initials: 'PS', colorScheme: 'Accent9',
    name: 'Priya Sharma', email: 'priya.sharma@acme.com',
    title: 'Ms', firstName: 'Priya', lastName: 'Sharma', phone: '0412345678', company: 'TechCorp',
    lastLogin: '2026-06-08', isAdmin: false, memberSince: '2023-05-22', status: 'Active', authMethod: 'SSO',
    licenses: ['Process Modeler', 'Collaboration Hub'],
    groups: ['Modelers', 'Human Resources'],
    accessRights: ['Shared documents: Read, Write', 'Dictionary: Read'],
  },
  {
    id: '10', initials: 'TB', colorScheme: 'Accent10',
    name: 'Tom Becker', email: 'tom.becker@acme.com',
    title: 'Mr', firstName: 'Tom', lastName: 'Becker', phone: '0512345678', company: 'Acme Blue',
    lastLogin: '2026-03-30', isAdmin: false, memberSince: '2021-08-30', status: 'Suspended', authMethod: 'Local',
    licenses: ['Process Modeler'],
    groups: ['Modelers'],
    accessRights: ['Shared documents: Read', 'Dictionary: Hide'],
  },
  {
    id: '11', initials: 'AN', colorScheme: 'Accent1',
    name: 'Aisha Nkosi', email: 'aisha.nkosi@acme.com',
    title: 'Ms', firstName: 'Aisha', lastName: 'Nkosi', phone: '0612367890', company: 'GlobalCo',
    lastLogin: '2026-06-05', isAdmin: false, memberSince: '2022-12-01', status: 'Active', authMethod: 'SSO',
    licenses: ['Collaboration Hub', 'Process Intelligence'],
    groups: ['Analysts'],
    accessRights: ['Shared documents: Read', 'Dictionary: Read'],
  },
  {
    id: '12', initials: 'CV', colorScheme: 'Accent2',
    name: 'Carlos Vega', email: 'carlos.vega@acme.com',
    title: 'Mr', firstName: 'Carlos', lastName: 'Vega', phone: '0223456789', company: 'InnovateCo',
    lastLogin: '2026-06-07', isAdmin: true, memberSince: '2020-03-08', status: 'Active', authMethod: 'SSO',
    licenses: ['Process Modeler', 'Process Transformation Manager'],
    groups: ['Administrators'],
    accessRights: ['Shared documents: Hide, Read, Write, Delete, Print', 'Dictionary: Read, Write'],
  },
  {
    id: '13', initials: 'RK', colorScheme: 'Accent3',
    name: 'Raj Kumar', email: 'raj.kumar@acme.com',
    title: 'Mr', firstName: 'Raj', lastName: 'Kumar', phone: '', company: 'TechCorp',
    lastLogin: '2026-06-11', isAdmin: false, memberSince: '2024-05-10', status: 'Active', authMethod: 'Local',
    licenses: ['Process Modeler', 'Collaboration Hub', 'Workflow Accelerator'],
    groups: ['Modelers'],
    accessRights: ['Shared documents: Read, Write', 'Dictionary: Read'],
  },
  {
    id: '14', initials: 'OF', colorScheme: 'Accent4',
    name: 'Olivia Foster', email: 'olivia.foster@acme.com',
    title: 'Ms', firstName: 'Olivia', lastName: 'Foster', phone: '0713456789', company: 'GlobalCo',
    lastLogin: '2026-05-30', isAdmin: false, memberSince: '2023-11-14', status: 'Active', authMethod: 'SSO',
    licenses: ['Collaboration Hub'],
    groups: ['Human Resources'],
    accessRights: ['Shared documents: Read', 'Dictionary: Read'],
  },
  {
    id: '15', initials: 'NK', colorScheme: 'Accent5',
    name: 'Nikita Kozlov', email: 'nikita.kozlov@partner.com',
    title: '', firstName: 'Nikita', lastName: 'Kozlov', phone: '', company: 'PartnerCo',
    lastLogin: '—', isAdmin: false, memberSince: '2026-06-10', status: 'Invited', authMethod: 'Local',
    licenses: ['Collaboration Hub'],
    groups: [],
    accessRights: [],
  },
  {
    id: '16', initials: 'MB', colorScheme: 'Accent6',
    name: 'Mia Braun', email: 'mia.braun@newco.com',
    title: 'Ms', firstName: 'Mia', lastName: 'Braun', phone: '', company: 'NewCo',
    lastLogin: '—', isAdmin: false, memberSince: '2026-06-11', status: 'Invited', authMethod: 'SSO',
    licenses: ['Process Modeler', 'Process Intelligence'],
    groups: ['Analysts'],
    accessRights: [],
  },
  {
    id: '17', initials: 'FO', colorScheme: 'Accent7',
    name: 'Felix Ortega', email: 'felix.ortega@acme.com',
    title: 'Mr', firstName: 'Felix', lastName: 'Ortega', phone: '', company: 'Acme Blue',
    lastLogin: '—', isAdmin: false, memberSince: '2026-06-09', status: 'Invited', authMethod: 'Local',
    licenses: ['Process Modeler'],
    groups: ['Modelers'],
    accessRights: [],
  },
  {
    id: '18', initials: 'SW', colorScheme: 'Accent8',
    name: 'Sophie Wilson', email: 'sophie.wilson@consultpro.com',
    title: 'Ms', firstName: 'Sophie', lastName: 'Wilson', phone: '', company: 'ConsultPro',
    lastLogin: '—', isAdmin: false, memberSince: '2026-06-12', status: 'Invited', authMethod: 'SSO',
    licenses: ['Collaboration Hub', 'JM Advanced'],
    groups: [],
    accessRights: [],
  },
  // ids 19–100: Analysts group members (lightweight — no full profile yet)
  { id: '19', initials: 'KP', colorScheme: 'Accent9',  name: 'Kevin Patel',      email: 'kevin.patel@acme.com',       title: '', firstName: 'Kevin',    lastName: 'Patel',      phone: '', company: 'Acme Blue',   lastLogin: '2026-06-01', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '20', initials: 'MK', colorScheme: 'Accent10', name: 'Maria Kim',        email: 'maria.kim@acme.com',         title: '', firstName: 'Maria',    lastName: 'Kim',        phone: '', company: 'TechCorp',   lastLogin: '2026-05-15', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '21', initials: 'NB', colorScheme: 'Accent1',  name: 'Noah Brown',       email: 'noah.brown@acme.com',        title: '', firstName: 'Noah',     lastName: 'Brown',      phone: '', company: 'Acme Blue',   lastLogin: '2026-05-20', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'Local', licenses: ['Process Modeler'],   groups: ['Analysts'], accessRights: [] },
  { id: '22', initials: 'IL', colorScheme: 'Accent2',  name: 'Isabel Lima',      email: 'isabel.lima@acme.com',       title: '', firstName: 'Isabel',   lastName: 'Lima',       phone: '', company: 'GlobalCo',   lastLogin: '2026-06-03', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '23', initials: 'AT', colorScheme: 'Accent3',  name: 'Ahmed Taha',       email: 'ahmed.taha@acme.com',        title: '', firstName: 'Ahmed',    lastName: 'Taha',       phone: '', company: 'InnovateCo', lastLogin: '2026-05-28', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '24', initials: 'CL', colorScheme: 'Accent4',  name: 'Claire Laurent',   email: 'claire.laurent@acme.com',    title: '', firstName: 'Claire',   lastName: 'Laurent',    phone: '', company: 'ConsultPro', lastLogin: '2026-06-10', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '25', initials: 'BG', colorScheme: 'Accent5',  name: 'Ben Green',        email: 'ben.green@acme.com',         title: '', firstName: 'Ben',      lastName: 'Green',      phone: '', company: 'Acme Blue',   lastLogin: '2026-05-05', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'Local', licenses: ['Process Modeler'],   groups: ['Analysts'], accessRights: [] },
  { id: '26', initials: 'NA', colorScheme: 'Accent6',  name: 'Nina Andersen',    email: 'nina.andersen@acme.com',     title: '', firstName: 'Nina',     lastName: 'Andersen',   phone: '', company: 'TechCorp',   lastLogin: '2026-06-08', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '27', initials: 'DM', colorScheme: 'Accent7',  name: 'Diego Morales',    email: 'diego.morales@acme.com',     title: '', firstName: 'Diego',    lastName: 'Morales',    phone: '', company: 'GlobalCo',   lastLogin: '2026-05-22', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '28', initials: 'YS', colorScheme: 'Accent8',  name: 'Yuna Sato',        email: 'yuna.sato@acme.com',         title: '', firstName: 'Yuna',     lastName: 'Sato',       phone: '', company: 'Acme Blue',   lastLogin: '2026-06-05', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Process Modeler'],   groups: ['Analysts'], accessRights: [] },
  { id: '29', initials: 'PB', colorScheme: 'Accent9',  name: 'Pavel Bauer',      email: 'pavel.bauer@acme.com',       title: '', firstName: 'Pavel',    lastName: 'Bauer',      phone: '', company: 'InnovateCo', lastLogin: '2026-05-18', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'Local', licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '30', initials: 'AO', colorScheme: 'Accent10', name: 'Amara Osei',       email: 'amara.osei@acme.com',        title: '', firstName: 'Amara',    lastName: 'Osei',       phone: '', company: 'TechCorp',   lastLogin: '2026-06-11', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '31', initials: 'JH', colorScheme: 'Accent1',  name: 'Julia Hoffmann',   email: 'julia.hoffmann@acme.com',    title: '', firstName: 'Julia',    lastName: 'Hoffmann',   phone: '', company: 'ConsultPro', lastLogin: '2026-05-30', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Process Modeler'],   groups: ['Analysts'], accessRights: [] },
  { id: '32', initials: 'OR', colorScheme: 'Accent2',  name: 'Omar Rashid',      email: 'omar.rashid@acme.com',       title: '', firstName: 'Omar',     lastName: 'Rashid',     phone: '', company: 'GlobalCo',   lastLogin: '2026-06-02', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '33', initials: 'TN', colorScheme: 'Accent3',  name: 'Tina Nguyen',      email: 'tina.nguyen@acme.com',       title: '', firstName: 'Tina',     lastName: 'Nguyen',     phone: '', company: 'Acme Blue',   lastLogin: '2026-05-25', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'Local', licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '34', initials: 'SR', colorScheme: 'Accent4',  name: 'Stefan Richter',   email: 'stefan.richter@acme.com',    title: '', firstName: 'Stefan',   lastName: 'Richter',    phone: '', company: 'InnovateCo', lastLogin: '2026-06-07', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Process Modeler'],   groups: ['Analysts'], accessRights: [] },
  { id: '35', initials: 'MO', colorScheme: 'Accent5',  name: 'Mia Olsen',        email: 'mia.olsen@acme.com',         title: '', firstName: 'Mia',      lastName: 'Olsen',      phone: '', company: 'TechCorp',   lastLogin: '2026-05-12', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '36', initials: 'VG', colorScheme: 'Accent6',  name: 'Victor Gomes',     email: 'victor.gomes@acme.com',      title: '', firstName: 'Victor',   lastName: 'Gomes',      phone: '', company: 'GlobalCo',   lastLogin: '2026-06-09', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '37', initials: 'EK', colorScheme: 'Accent7',  name: 'Emma König',       email: 'emma.koenig@acme.com',       title: '', firstName: 'Emma',     lastName: 'König',      phone: '', company: 'Acme Blue',   lastLogin: '2026-05-08', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Process Modeler'],   groups: ['Analysts'], accessRights: [] },
  { id: '38', initials: 'CI', colorScheme: 'Accent8',  name: 'Chen Ito',         email: 'chen.ito@acme.com',          title: '', firstName: 'Chen',     lastName: 'Ito',        phone: '', company: 'ConsultPro', lastLogin: '2026-06-06', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'Local', licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '39', initials: 'RP', colorScheme: 'Accent9',  name: 'Rosa Pérez',       email: 'rosa.perez@acme.com',        title: '', firstName: 'Rosa',     lastName: 'Pérez',      phone: '', company: 'InnovateCo', lastLogin: '2026-05-20', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '40', initials: 'FD', colorScheme: 'Accent10', name: 'Finn Dahl',        email: 'finn.dahl@acme.com',         title: '', firstName: 'Finn',     lastName: 'Dahl',       phone: '', company: 'TechCorp',   lastLogin: '2026-06-04', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Process Modeler'],   groups: ['Analysts'], accessRights: [] },
  { id: '41', initials: 'ZA', colorScheme: 'Accent1',  name: 'Zara Ali',         email: 'zara.ali@acme.com',          title: '', firstName: 'Zara',     lastName: 'Ali',        phone: '', company: 'GlobalCo',   lastLogin: '2026-05-15', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '42', initials: 'MB', colorScheme: 'Accent2',  name: 'Max Braun',        email: 'max.braun@acme.com',         title: '', firstName: 'Max',      lastName: 'Braun',      phone: '', company: 'Acme Blue',   lastLogin: '2026-06-11', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'Local', licenses: ['Process Modeler'],   groups: ['Analysts'], accessRights: [] },
  { id: '43', initials: 'LV', colorScheme: 'Accent3',  name: 'Lea Villanueva',   email: 'lea.villanueva@acme.com',    title: '', firstName: 'Lea',      lastName: 'Villanueva', phone: '', company: 'ConsultPro', lastLogin: '2026-05-28', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '44', initials: 'SO', colorScheme: 'Accent4',  name: 'Samuel Owusu',     email: 'samuel.owusu@acme.com',      title: '', firstName: 'Samuel',   lastName: 'Owusu',      phone: '', company: 'TechCorp',   lastLogin: '2026-06-03', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '45', initials: 'AW', colorScheme: 'Accent5',  name: 'Anya Weber',       email: 'anya.weber@acme.com',        title: '', firstName: 'Anya',     lastName: 'Weber',      phone: '', company: 'InnovateCo', lastLogin: '2026-05-22', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Process Modeler'],   groups: ['Analysts'], accessRights: [] },
  { id: '46', initials: 'TM', colorScheme: 'Accent6',  name: 'Tariq Malik',      email: 'tariq.malik@acme.com',       title: '', firstName: 'Tariq',    lastName: 'Malik',      phone: '', company: 'GlobalCo',   lastLogin: '2026-06-08', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '47', initials: 'GS', colorScheme: 'Accent7',  name: 'Giulia Santoro',   email: 'giulia.santoro@acme.com',    title: '', firstName: 'Giulia',   lastName: 'Santoro',    phone: '', company: 'Acme Blue',   lastLogin: '2026-05-18', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '48', initials: 'BL', colorScheme: 'Accent8',  name: 'Boris Levin',      email: 'boris.levin@acme.com',       title: '', firstName: 'Boris',    lastName: 'Levin',      phone: '', company: 'ConsultPro', lastLogin: '2026-06-05', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'Local', licenses: ['Process Modeler'],   groups: ['Analysts'], accessRights: [] },
  { id: '49', initials: 'NJ', colorScheme: 'Accent9',  name: 'Nadia Johansson',  email: 'nadia.johansson@acme.com',   title: '', firstName: 'Nadia',    lastName: 'Johansson',  phone: '', company: 'TechCorp',   lastLogin: '2026-05-30', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '50', initials: 'HM', colorScheme: 'Accent10', name: 'Hiro Matsuda',     email: 'hiro.matsuda@acme.com',      title: '', firstName: 'Hiro',     lastName: 'Matsuda',    phone: '', company: 'InnovateCo', lastLogin: '2026-06-10', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '51', initials: 'RF', colorScheme: 'Accent1',  name: 'Rachel Flynn',     email: 'rachel.flynn@acme.com',      title: '', firstName: 'Rachel',   lastName: 'Flynn',      phone: '', company: 'Acme Blue',   lastLogin: '2026-05-25', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Process Modeler'],   groups: ['Analysts'], accessRights: [] },
  { id: '52', initials: 'KN', colorScheme: 'Accent2',  name: 'Kai Nakamura',     email: 'kai.nakamura@acme.com',      title: '', firstName: 'Kai',      lastName: 'Nakamura',   phone: '', company: 'GlobalCo',   lastLogin: '2026-06-07', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '53', initials: 'PM', colorScheme: 'Accent3',  name: 'Petra Mayer',      email: 'petra.mayer@acme.com',       title: '', firstName: 'Petra',    lastName: 'Mayer',      phone: '', company: 'ConsultPro', lastLogin: '2026-05-12', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'Local', licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '54', initials: 'JO', colorScheme: 'Accent4',  name: "Jonas O'Brien",    email: 'jonas.obrien@acme.com',      title: '', firstName: 'Jonas',    lastName: "O'Brien",    phone: '', company: 'TechCorp',   lastLogin: '2026-06-09', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Process Modeler'],   groups: ['Analysts'], accessRights: [] },
  { id: '55', initials: 'SY', colorScheme: 'Accent5',  name: 'Selin Yilmaz',     email: 'selin.yilmaz@acme.com',      title: '', firstName: 'Selin',    lastName: 'Yilmaz',     phone: '', company: 'InnovateCo', lastLogin: '2026-05-20', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '56', initials: 'AC', colorScheme: 'Accent6',  name: 'André Costa',      email: 'andre.costa@acme.com',       title: '', firstName: 'André',    lastName: 'Costa',      phone: '', company: 'GlobalCo',   lastLogin: '2026-06-04', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '57', initials: 'IL', colorScheme: 'Accent7',  name: 'Ingrid Larsen',    email: 'ingrid.larsen@acme.com',     title: '', firstName: 'Ingrid',   lastName: 'Larsen',     phone: '', company: 'Acme Blue',   lastLogin: '2026-05-28', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Process Modeler'],   groups: ['Analysts'], accessRights: [] },
  { id: '58', initials: 'WC', colorScheme: 'Accent8',  name: 'Wei Chang',        email: 'wei.chang@acme.com',         title: '', firstName: 'Wei',      lastName: 'Chang',      phone: '', company: 'ConsultPro', lastLogin: '2026-06-11', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'Local', licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '59', initials: 'KS', colorScheme: 'Accent9',  name: 'Kofi Sarkodie',    email: 'kofi.sarkodie@acme.com',     title: '', firstName: 'Kofi',     lastName: 'Sarkodie',   phone: '', company: 'TechCorp',   lastLogin: '2026-05-15', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '60', initials: 'MH', colorScheme: 'Accent10', name: 'Marie Hubert',     email: 'marie.hubert@acme.com',      title: '', firstName: 'Marie',    lastName: 'Hubert',     phone: '', company: 'InnovateCo', lastLogin: '2026-06-03', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Process Modeler'],   groups: ['Analysts'], accessRights: [] },
  { id: '61', initials: 'DP', colorScheme: 'Accent1',  name: 'Dmitri Petrov',    email: 'dmitri.petrov@acme.com',     title: '', firstName: 'Dmitri',   lastName: 'Petrov',     phone: '', company: 'GlobalCo',   lastLogin: '2026-05-22', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '62', initials: 'BM', colorScheme: 'Accent2',  name: 'Beatriz Mendes',   email: 'beatriz.mendes@acme.com',    title: '', firstName: 'Beatriz',  lastName: 'Mendes',     phone: '', company: 'Acme Blue',   lastLogin: '2026-06-08', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '63', initials: 'LH', colorScheme: 'Accent3',  name: 'Lars Hansen',      email: 'lars.hansen@acme.com',       title: '', firstName: 'Lars',     lastName: 'Hansen',     phone: '', company: 'ConsultPro', lastLogin: '2026-05-18', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'Local', licenses: ['Process Modeler'],   groups: ['Analysts'], accessRights: [] },
  { id: '64', initials: 'NC', colorScheme: 'Accent4',  name: 'Nour Chakroun',    email: 'nour.chakroun@acme.com',     title: '', firstName: 'Nour',     lastName: 'Chakroun',   phone: '', company: 'TechCorp',   lastLogin: '2026-06-06', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '65', initials: 'ES', colorScheme: 'Accent5',  name: 'Eva Schulz',       email: 'eva.schulz@acme.com',        title: '', firstName: 'Eva',      lastName: 'Schulz',     phone: '', company: 'InnovateCo', lastLogin: '2026-05-30', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Process Modeler'],   groups: ['Analysts'], accessRights: [] },
  { id: '66', initials: 'AK', colorScheme: 'Accent6',  name: 'Ali Khan',         email: 'ali.khan@acme.com',          title: '', firstName: 'Ali',      lastName: 'Khan',       phone: '', company: 'GlobalCo',   lastLogin: '2026-06-10', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '67', initials: 'VN', colorScheme: 'Accent7',  name: 'Valentina Nero',   email: 'valentina.nero@acme.com',    title: '', firstName: 'Valentina',lastName: 'Nero',       phone: '', company: 'Acme Blue',   lastLogin: '2026-05-25', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '68', initials: 'TY', colorScheme: 'Accent8',  name: 'Takeshi Yamamoto', email: 'takeshi.yamamoto@acme.com',  title: '', firstName: 'Takeshi',  lastName: 'Yamamoto',   phone: '', company: 'ConsultPro', lastLogin: '2026-06-07', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'Local', licenses: ['Process Modeler'],   groups: ['Analysts'], accessRights: [] },
  { id: '69', initials: 'CR', colorScheme: 'Accent9',  name: 'Chloe Roberts',    email: 'chloe.roberts@acme.com',     title: '', firstName: 'Chloe',    lastName: 'Roberts',    phone: '', company: 'TechCorp',   lastLogin: '2026-05-12', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '70', initials: 'FO', colorScheme: 'Accent10', name: 'Felix Otto',       email: 'felix.otto@acme.com',        title: '', firstName: 'Felix',    lastName: 'Otto',       phone: '', company: 'InnovateCo', lastLogin: '2026-06-04', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '71', initials: 'IA', colorScheme: 'Accent1',  name: 'Ifeoma Adeyemi',   email: 'ifeoma.adeyemi@acme.com',    title: '', firstName: 'Ifeoma',   lastName: 'Adeyemi',    phone: '', company: 'GlobalCo',   lastLogin: '2026-05-20', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Process Modeler'],   groups: ['Analysts'], accessRights: [] },
  { id: '72', initials: 'PC', colorScheme: 'Accent2',  name: 'Pierre Chevalier', email: 'pierre.chevalier@acme.com',  title: '', firstName: 'Pierre',   lastName: 'Chevalier',  phone: '', company: 'Acme Blue',   lastLogin: '2026-06-09', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '73', initials: 'SB', colorScheme: 'Accent3',  name: 'Sofia Bianchi',    email: 'sofia.bianchi@acme.com',     title: '', firstName: 'Sofia',    lastName: 'Bianchi',    phone: '', company: 'ConsultPro', lastLogin: '2026-05-28', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '74', initials: 'JL', colorScheme: 'Accent4',  name: 'Jin-ho Lee',       email: 'jinho.lee@acme.com',         title: '', firstName: 'Jin-ho',   lastName: 'Lee',        phone: '', company: 'TechCorp',   lastLogin: '2026-06-05', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'Local', licenses: ['Process Modeler'],   groups: ['Analysts'], accessRights: [] },
  { id: '75', initials: 'MV', colorScheme: 'Accent5',  name: 'Marina Vasquez',   email: 'marina.vasquez@acme.com',    title: '', firstName: 'Marina',   lastName: 'Vasquez',    phone: '', company: 'InnovateCo', lastLogin: '2026-05-18', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '76', initials: 'TD', colorScheme: 'Accent6',  name: 'Thomas Dubois',    email: 'thomas.dubois@acme.com',     title: '', firstName: 'Thomas',   lastName: 'Dubois',     phone: '', company: 'GlobalCo',   lastLogin: '2026-06-11', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '77', initials: 'GN', colorScheme: 'Accent7',  name: 'Grace Nwosu',      email: 'grace.nwosu@acme.com',       title: '', firstName: 'Grace',    lastName: 'Nwosu',      phone: '', company: 'Acme Blue',   lastLogin: '2026-05-22', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Process Modeler'],   groups: ['Analysts'], accessRights: [] },
  { id: '78', initials: 'AH', colorScheme: 'Accent8',  name: 'Axel Holm',        email: 'axel.holm@acme.com',         title: '', firstName: 'Axel',     lastName: 'Holm',       phone: '', company: 'ConsultPro', lastLogin: '2026-06-03', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'Local', licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '79', initials: 'RG', colorScheme: 'Accent9',  name: 'Rania Ghali',      email: 'rania.ghali@acme.com',       title: '', firstName: 'Rania',    lastName: 'Ghali',      phone: '', company: 'TechCorp',   lastLogin: '2026-05-15', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '80', initials: 'LP', colorScheme: 'Accent10', name: 'Luca Pellegrini',  email: 'luca.pellegrini@acme.com',   title: '', firstName: 'Luca',     lastName: 'Pellegrini', phone: '', company: 'InnovateCo', lastLogin: '2026-06-08', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Process Modeler'],   groups: ['Analysts'], accessRights: [] },
  { id: '81', initials: 'YK', colorScheme: 'Accent1',  name: 'Yoko Kobayashi',   email: 'yoko.kobayashi@acme.com',    title: '', firstName: 'Yoko',     lastName: 'Kobayashi',  phone: '', company: 'GlobalCo',   lastLogin: '2026-05-30', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '82', initials: 'AE', colorScheme: 'Accent2',  name: 'Arjun Eswaran',    email: 'arjun.eswaran@acme.com',     title: '', firstName: 'Arjun',    lastName: 'Eswaran',    phone: '', company: 'Acme Blue',   lastLogin: '2026-06-06', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '83', initials: 'ME', colorScheme: 'Accent3',  name: 'Maja Eriksson',    email: 'maja.eriksson@acme.com',     title: '', firstName: 'Maja',     lastName: 'Eriksson',   phone: '', company: 'ConsultPro', lastLogin: '2026-05-25', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'Local', licenses: ['Process Modeler'],   groups: ['Analysts'], accessRights: [] },
  { id: '84', initials: 'OA', colorScheme: 'Accent4',  name: 'Obinna Achebe',    email: 'obinna.achebe@acme.com',     title: '', firstName: 'Obinna',   lastName: 'Achebe',     phone: '', company: 'TechCorp',   lastLogin: '2026-06-10', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '85', initials: 'KF', colorScheme: 'Accent5',  name: 'Katja Fischer',    email: 'katja.fischer@acme.com',     title: '', firstName: 'Katja',    lastName: 'Fischer',    phone: '', company: 'InnovateCo', lastLogin: '2026-05-18', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '86', initials: 'JC', colorScheme: 'Accent6',  name: 'Juan Castro',      email: 'juan.castro@acme.com',       title: '', firstName: 'Juan',     lastName: 'Castro',     phone: '', company: 'GlobalCo',   lastLogin: '2026-06-07', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Process Modeler'],   groups: ['Analysts'], accessRights: [] },
  { id: '87', initials: 'LZ', colorScheme: 'Accent7',  name: 'Lin Zhao',         email: 'lin.zhao@acme.com',          title: '', firstName: 'Lin',      lastName: 'Zhao',       phone: '', company: 'Acme Blue',   lastLogin: '2026-05-20', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '88', initials: 'ES', colorScheme: 'Accent8',  name: 'Elif Sahin',       email: 'elif.sahin@acme.com',        title: '', firstName: 'Elif',     lastName: 'Sahin',      phone: '', company: 'ConsultPro', lastLogin: '2026-06-04', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'Local', licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '89', initials: 'PL', colorScheme: 'Accent9',  name: 'Patrice Lefebvre', email: 'patrice.lefebvre@acme.com',  title: '', firstName: 'Patrice',  lastName: 'Lefebvre',   phone: '', company: 'TechCorp',   lastLogin: '2026-05-28', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Process Modeler'],   groups: ['Analysts'], accessRights: [] },
  { id: '90', initials: 'NE', colorScheme: 'Accent10', name: 'Nkechi Eze',       email: 'nkechi.eze@acme.com',        title: '', firstName: 'Nkechi',   lastName: 'Eze',        phone: '', company: 'InnovateCo', lastLogin: '2026-06-11', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '91', initials: 'HB', colorScheme: 'Accent1',  name: 'Henrik Berg',      email: 'henrik.berg@acme.com',       title: '', firstName: 'Henrik',   lastName: 'Berg',       phone: '', company: 'GlobalCo',   lastLogin: '2026-05-15', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Process Modeler'],   groups: ['Analysts'], accessRights: [] },
  { id: '92', initials: 'ZM', colorScheme: 'Accent2',  name: 'Zeynep Mercan',    email: 'zeynep.mercan@acme.com',     title: '', firstName: 'Zeynep',   lastName: 'Mercan',     phone: '', company: 'Acme Blue',   lastLogin: '2026-06-08', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '93', initials: 'RD', colorScheme: 'Accent3',  name: 'Rina Das',         email: 'rina.das@acme.com',          title: '', firstName: 'Rina',     lastName: 'Das',        phone: '', company: 'ConsultPro', lastLogin: '2026-05-22', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'Local', licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '94', initials: 'GR', colorScheme: 'Accent4',  name: 'Gael Reyes',       email: 'gael.reyes@acme.com',        title: '', firstName: 'Gael',     lastName: 'Reyes',      phone: '', company: 'TechCorp',   lastLogin: '2026-06-05', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Process Modeler'],   groups: ['Analysts'], accessRights: [] },
  { id: '95', initials: 'AS', colorScheme: 'Accent5',  name: 'Astrid Svensson',  email: 'astrid.svensson@acme.com',   title: '', firstName: 'Astrid',   lastName: 'Svensson',   phone: '', company: 'InnovateCo', lastLogin: '2026-05-30', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '96', initials: 'MN', colorScheme: 'Accent6',  name: 'Mohamed Nour',     email: 'mohamed.nour@acme.com',      title: '', firstName: 'Mohamed',  lastName: 'Nour',       phone: '', company: 'GlobalCo',   lastLogin: '2026-06-09', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Process Modeler'],   groups: ['Analysts'], accessRights: [] },
  { id: '97', initials: 'CB', colorScheme: 'Accent7',  name: 'Claudia Brandt',   email: 'claudia.brandt@acme.com',    title: '', firstName: 'Claudia',  lastName: 'Brandt',     phone: '', company: 'Acme Blue',   lastLogin: '2026-05-20', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '98', initials: 'JT', colorScheme: 'Accent8',  name: 'Ji-woo Tak',       email: 'jiwoo.tak@acme.com',         title: '', firstName: 'Ji-woo',   lastName: 'Tak',        phone: '', company: 'ConsultPro', lastLogin: '2026-06-03', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'Local', licenses: ['Process Modeler'],   groups: ['Analysts'], accessRights: [] },
  { id: '99', initials: 'MF', colorScheme: 'Accent9',  name: 'Miriam Ferreira',  email: 'miriam.ferreira@acme.com',   title: '', firstName: 'Miriam',   lastName: 'Ferreira',   phone: '', company: 'TechCorp',   lastLogin: '2026-05-25', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
  { id: '100',initials: 'RH', colorScheme: 'Accent10', name: 'Ruben Herrera',    email: 'ruben.herrera@acme.com',     title: '', firstName: 'Ruben',    lastName: 'Herrera',    phone: '', company: 'InnovateCo', lastLogin: '2026-06-11', isAdmin: false, memberSince: '2024-01-01', status: 'Active', authMethod: 'SSO',   licenses: ['Collaboration Hub'], groups: ['Analysts'], accessRights: [] },
]

// ── Shared feature + content data ────────────────────────────────────────────

export const ALL_FEATURES = [
  { id: 'bpmn',          name: 'Modeling: Create and Edit BPMN Models' },
  { id: 'import_export', name: 'Modeling: Import/Export Models' },
  { id: 'dict',          name: 'Modeling: Import/Export Dictionary Entries' },
  { id: 'upload',        name: 'Modeling: Upload Files' },
  { id: 'joule_desc',    name: 'Modeling – Joule: Generate Process Description' },
  { id: 'dmn',           name: 'Modeling – Decision Manager: Create DMN Models' },
  { id: 'dmn_req',       name: 'Modeling – Decision Manager: Create DMN Requirements Models' },
  { id: 'dmn_drools',    name: 'Modeling – Decision Manager: Export Drools' },
  { id: 'my_overview',   name: 'Browsing: Access My Process Overview' },
  { id: 'joule_questions',name: 'Browsing – Joule: Ask Specific Questions About Processes' },
  { id: 'joule_compare', name: 'Browsing – Joule: Compare Two Processes' },
  { id: 'pi_access',     name: 'Access SAP Signavio Process Intelligence' },
  { id: 'pi_create',     name: 'SAP Signavio Process Intelligence: Create Process' },
  { id: 'pi_data_int',   name: 'SAP Signavio Process Intelligence: Access Data Integration' },
  { id: 'pi_data_mod',   name: 'SAP Signavio Process Intelligence: Access Data Modeling' },
  { id: 'pi_odata',      name: 'SAP Signavio Process Intelligence: Access SIGNAL OData API' },
  { id: 'pi_widget',     name: 'SAP Signavio Process Intelligence: Export Widget Data' },
  { id: 'governance',    name: 'Access SAP Signavio Process Governance' },
  { id: 'collaboration', name: 'Collaboration: Comment on Diagrams' },
  { id: 'publish',       name: 'Publishing: Publish Diagrams to Hub' },
]

const BUSINESS_ARCHITECTS_FEATURES = new Set(['bpmn', 'import_export', 'upload', 'dmn', 'dmn_req', 'dmn_drools', 'pi_access', 'pi_create', 'collaboration', 'publish'])

export const GROUP_FEATURES: Record<string, Set<string>> = {
  'Administrators':     new Set(ALL_FEATURES.map(f => f.id)),
  'Business Architects': BUSINESS_ARCHITECTS_FEATURES,
  'Analysts':           new Set(['my_overview', 'joule_questions', 'joule_compare', 'pi_access', 'pi_create', 'collaboration']),
  'Modelers':           new Set(['bpmn', 'import_export', 'dict', 'upload', 'joule_desc', 'dmn', 'dmn_req', 'governance', 'collaboration', 'publish']),
  'Human Resources':    new Set(['my_overview', 'collaboration']),
  'Process Owners':     new Set(['my_overview', 'joule_questions', 'governance', 'collaboration', 'publish']),
  'Compliance Officers': new Set(['my_overview', 'joule_questions', 'governance']),
  'External Reviewers': new Set(['my_overview', 'collaboration']),
  'Finance Controllers': new Set(['my_overview', 'pi_access', 'pi_create', 'collaboration']),
  'IT Operations':      new Set(['bpmn', 'import_export', 'upload', 'collaboration']),
  'Legal Team':         new Set(['my_overview', 'governance', 'collaboration']),
  'Process Viewers':    new Set(['my_overview', 'joule_questions']),
}

export const CONTENT_FOLDERS = [
  'Modeling Files',
  'Dictionary',
  'Data Management Directory',
  'Objectives',
  'Shared Documents',
  'Process Templates',
  'Governance Archive',
  'Published Models',
]

export const GROUP_CONTENT: Record<string, { folder: string; role: string }[]> = {
  'Administrators':      CONTENT_FOLDERS.map(f => ({ folder: f, role: 'Manager' })),
  'Analysts':            [
    { folder: 'Modeling Files', role: 'Viewer' },
    { folder: 'Dictionary', role: 'Viewer' },
    { folder: 'Data Management Directory', role: 'Editor' },
    { folder: 'Objectives', role: 'Viewer' },
  ],
  'Modelers':            [
    { folder: 'Modeling Files', role: 'Editor' },
    { folder: 'Dictionary', role: 'Editor' },
    { folder: 'Process Templates', role: 'Editor' },
    { folder: 'Governance Archive', role: 'Viewer' },
  ],
  'Human Resources':     [
    { folder: 'Shared Documents', role: 'Viewer' },
    { folder: 'Published Models', role: 'Viewer' },
  ],
  'Business Architects': [
    { folder: 'Modeling Files', role: 'Manager' },
    { folder: 'Dictionary', role: 'Editor' },
    { folder: 'Process Templates', role: 'Manager' },
    { folder: 'Published Models', role: 'Viewer' },
  ],
  'Process Owners':      [
    { folder: 'Modeling Files', role: 'Commenter' },
    { folder: 'Governance Archive', role: 'Editor' },
    { folder: 'Published Models', role: 'Viewer' },
  ],
  'Compliance Officers': [
    { folder: 'Governance Archive', role: 'Viewer' },
    { folder: 'Published Models', role: 'Viewer' },
  ],
  'External Reviewers':  [
    { folder: 'Published Models', role: 'Commenter' },
  ],
  'Finance Controllers': [
    { folder: 'Data Management Directory', role: 'Viewer' },
    { folder: 'Objectives', role: 'Viewer' },
    { folder: 'Published Models', role: 'Viewer' },
  ],
  'IT Operations':       [
    { folder: 'Modeling Files', role: 'Viewer' },
    { folder: 'Dictionary', role: 'Viewer' },
    { folder: 'Shared Documents', role: 'Editor' },
  ],
  'Legal Team':          [
    { folder: 'Governance Archive', role: 'Commenter' },
    { folder: 'Published Models', role: 'Viewer' },
  ],
  'Process Viewers':     [
    { folder: 'Published Models', role: 'Viewer' },
  ],
}
