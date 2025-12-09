const decryptToken = (token: string | null) => {
  if (!token) return null;
  const payload = JSON.parse(atob(token.split('.')[1]));
  return payload ? (isTokenValid(payload) ? payload : null) : null;
};

const isTokenValid = (payload: any) => {
  return payload && payload.exp && Date.now() < payload.exp * 1000;
};

export { decryptToken, isTokenValid };

export const formatDate = () => {
  const now = new Date();
  return now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
};
