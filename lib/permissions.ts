export interface OrganizerPermissions {
  checkin?: boolean;
  viewTeams?: boolean;
  viewContacts?: boolean;
}

export function maskPhone(phone: string): string {
  if (!phone || phone.length < 4) return '******';
  const clean = phone.trim();
  if (clean.length === 10) {
    return `${clean.slice(0, 2)}******${clean.slice(8)}`;
  }
  return `${clean.slice(0, 2)}****${clean.slice(-2)}`;
}

export function toOrganizerTeamView(
  team: any,
  permissions: OrganizerPermissions = { viewContacts: false }
) {
  if (!team) return null;

  const canViewContacts = permissions?.viewContacts ?? false;

  return {
    _id: team._id?.toString(),
    teamId: team.teamId,
    teamName: team.teamName,
    track: team.track,
    checkedIn: team.checkedIn,
    checkedInAt: team.checkedInAt,
    checkedInBy: team.checkedInBy ? { name: team.checkedInBy.name } : null,
    members: (team.members || []).map((m: any) => ({
      _id: m._id?.toString(),
      name: m.name,
      college: m.college,
      department: m.department,
      year: m.year,
      isLeader: m.isLeader,
      present: m.present,
      phone: canViewContacts ? m.phone : maskPhone(m.phone),
      email: canViewContacts ? m.email : undefined,
    })),
  };
}
