export type userParams = {
  userMasterId: number;
};

export interface UserDetails {
  userName: string;
  userId: string;
  userEmail: string;
  fName: string;
  lName: string;
  userRole: string;
}

export interface EnumOption {
  label: string;
  value: string;
  id?: number;
}

export interface ProfileField {
  name: string;
  dataType: 'text' | 'email' | 'select' | 'boolean';
  displayLabel: string;
  description: string;
  visible: boolean;
  required: boolean;
  readOnly: boolean;
  value: string | EnumOption | number | null;
  enumlist?: EnumOption[];
  widgetType: string;
  isClearable?: boolean;
  displayOrder: number;
  displayGroup: string;
  preferredMfa?: boolean;
}

export interface ReadOnlyFieldMapping {
  orderFrom: string;
  fields: string[];
}

export interface Application {
  applicationId: number;
  name: string;
  description: string;
  launchUrl: string;
  iconUrl: string;
  unassignedIconUrl: string | null;
  isDeleted: number;
  changeReasonDetail: string | null;
  dateCreated: string;
  createdBy: string;
  dateModified: string;
  modifiedBy: string;
  subdomain: string | null;
}

export interface ApplicationMapping {
  assignedApps: Application[];
  otherApps: Application[];
}

export interface RoleMapping {
  userRoleId: number;
  studyId: number;
  applicationId: number | null;
  roleId: number;
  isCurrent: number;
  userId: number;
  passwordPolicyId: number | null;
  scopeId: number | null;
  defaultDashboardId: number;
  isDeleted: number;
  dateCreated: string;
  createdBy: string;
  dateModified: string | null;
  modifiedBy: string | null;
  subdomain: string | null;
}

export interface OrgMapping {
  organizationId: number;
  organizationName: string;
}

export interface UserProfileData {
  userMasterId: number;
  fields: ProfileField[];
  readOnlyFieldMapping: ReadOnlyFieldMapping[];
  applicationMapping: ApplicationMapping;
  roleMappings: RoleMapping[];
  orgMapping: OrgMapping;
}

export interface UserProfileResponse {
  data: UserProfileData;
  statusCode: number;
  message: string;
}
