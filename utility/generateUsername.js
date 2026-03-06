const generateUsername = async (baseName, User) => {
  // Remove spaces & invalid characters
  let username = baseName
    .replace(/[^a-zA-Z0-9_]/g, "")
    .toLowerCase();

  if (!username) username = "user";

  let existingUser = await User.findOne({ username });

  if (!existingUser) return username;

  let counter = 1;
  let newUsername = `${username}${counter}`;

  while (await User.findOne({ username: newUsername })) {
    counter++;
    newUsername = `${username}${counter}`;
  }

  return newUsername;
};

export default generateUsername;