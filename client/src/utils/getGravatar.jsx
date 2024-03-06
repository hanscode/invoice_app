import md5 from 'md5';

const getGravatar = (email) => {
  if (!email) return '';

  const emailHash = md5(email);

  return `https://www.gravatar.com/avatar/${emailHash}?d=retro`;
}

export default getGravatar
