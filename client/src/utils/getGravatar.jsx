import md5 from 'md5';

/**
 * Get Gravatar
 * @param {string} email - A user's email address
 * @returns {string} - The Gravatar URL for the user's email
 */
const getGravatar = (email) => {
  if (!email) return '';

  const emailHash = md5(email);

  return `https://www.gravatar.com/avatar/${emailHash}?d=retro`;
}

export default getGravatar
