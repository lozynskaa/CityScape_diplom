export const getUserInitials = (fullName?: string) => {
  const name = fullName ?? "Unknown User";
  const [firstName = "Unknown", lastName = firstName ?? "User"] =
    name.split(" ");
  const initials = firstName.charAt(0) + lastName.charAt(0);
  return {
    firstName,
    lastName,
    initials,
  };
};
