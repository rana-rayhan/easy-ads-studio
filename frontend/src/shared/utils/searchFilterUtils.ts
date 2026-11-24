export const filteredUsers = (users: IUserDetails[], searchText: string) => {
  if (!searchText) return users;

  const filteredUsers = users.filter(
    (user) =>
      user.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase()),
  );

  return filteredUsers;
};
