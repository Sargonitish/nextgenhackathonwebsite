export function exportTeamsToCsv(teams: any[]): string {
  const headers = [
    'Team ID',
    'Team Name',
    'Track',
    'Leader Email',
    'Checked In',
    'Checked In At (IST)',
    'Checked In By',
    'Member Name',
    'Member Email',
    'Member Phone',
    'Member College',
    'Member Department',
    'Member Year',
    'Is Leader',
    'Present At Desk',
    'Registration Date (IST)',
  ];

  const rows: string[] = [];
  rows.push(headers.join(','));

  teams.forEach((team) => {
    const checkedInAt = team.checkedInAt
      ? new Date(team.checkedInAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      : 'N/A';
    const checkedInBy = team.checkedInBy
      ? `${team.checkedInBy.name} (${team.checkedInBy.role})`
      : 'N/A';
    const regDate = team.createdAt
      ? new Date(team.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      : 'N/A';

    (team.members || []).forEach((m: any) => {
      const row = [
        escapeCsv(team.teamId),
        escapeCsv(team.teamName),
        escapeCsv(team.track),
        escapeCsv(team.leaderEmail),
        team.checkedIn ? 'YES' : 'NO',
        escapeCsv(checkedInAt),
        escapeCsv(checkedInBy),
        escapeCsv(m.name),
        escapeCsv(m.email),
        escapeCsv(m.phone),
        escapeCsv(m.college),
        escapeCsv(m.department),
        escapeCsv(String(m.year)),
        m.isLeader ? 'YES' : 'NO',
        m.present ? 'YES' : 'NO',
        escapeCsv(regDate),
      ];
      rows.push(row.join(','));
    });
  });

  return rows.join('\r\n');
}

function escapeCsv(val: string | undefined | null): string {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}
