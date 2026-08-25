export function getDisplayName(profile: { first_name: string, nickname: string | null } | null) {
  if (!profile) return "User";
  // Returns nickname if it exists/is not empty, otherwise defaults to first_name
  return (profile.nickname && profile.nickname.trim() !== "") ? profile.nickname : profile.first_name;
}